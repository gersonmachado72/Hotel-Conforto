const express = require('express');
const { Op } = require('sequelize');
const Reserva = require('../models/Reserva');
const Quarto = require('../models/Quarto');
const Hospede = require('../models/Hospede');
const { authenticateToken, isStaff } = require('../middleware/auth');

const router = express.Router();

// POST /api/checkout/:reservaId - Finalizar estadia (check-out)
router.post('/:reservaId', authenticateToken, isStaff, async (req, res) => {
  try {
    const { reservaId } = req.params;
    const { 
      data_real_checkout, 
      valor_pago, 
      metodo_pagamento, 
      observacoes,
      extras 
    } = req.body;
    
    console.log('📤 Processando check-out para reserva:', reservaId);
    
    // Buscar reserva
    const reserva = await Reserva.findByPk(reservaId, {
      include: [
        { model: Quarto },
        { model: Hospede }
      ]
    });
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    // Verificar se já está finalizada
    if (reserva.status_reserva === 'concluida') {
      return res.status(400).json({ error: 'Esta reserva já foi finalizada' });
    }
    
    // Calcular dias e valor total
    const checkinDate = new Date(reserva.data_checkin);
    const checkoutDate = new Date(data_real_checkout || new Date().toISOString().split('T')[0]);
    
    // Verificar se a data de check-out é válida
    if (checkoutDate < checkinDate) {
      return res.status(400).json({ error: 'Data de check-out inválida' });
    }
    
    // Calcular número de dias
    const diffTime = Math.abs(checkoutDate - checkinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calcular valor da hospedagem
    const valorHospedagem = diffDays * parseFloat(reserva.Quarto.preco_noite);
    
    // Calcular extras
    const extrasTotal = extras ? 
      (extras.alimentacao || 0) + 
      (extras.lavanderia || 0) + 
      (extras.telefone || 0) + 
      (extras.outros || 0) : 0;
    
    const valorTotalComExtras = valorHospedagem + extrasTotal;
    
    // Atualizar reserva
    await reserva.update({
      data_real_checkout: checkoutDate.toISOString().split('T')[0],
      valor_pago: valor_pago || valorTotalComExtras,
      metodo_pagamento: metodo_pagamento || 'dinheiro',
      observacoes: observacoes || '',
      extras: extras || reserva.extras,
      status_reserva: 'concluida',
      status_pagamento: valor_pago >= valorTotalComExtras ? 'pago' : 
                       valor_pago > 0 ? 'parcial' : 'pendente'
    });
    
    // Liberar quarto
    await reserva.Quarto.update({ status: 'disponivel' });
    
    // Buscar reserva atualizada
    const reservaAtualizada = await Reserva.findByPk(reservaId, {
      include: [
        { model: Quarto },
        { model: Hospede }
      ]
    });
    
    // Gerar recibo
    const recibo = {
      codigo_reserva: reservaAtualizada.codigo_reserva,
      hospede: {
        nome: reservaAtualizada.Hospede.nome,
        cpf: reservaAtualizada.Hospede.cpf
      },
      quarto: {
        numero: reservaAtualizada.Quarto.numero,
        tipo: reservaAtualizada.Quarto.tipo
      },
      periodo: {
        checkin: reservaAtualizada.data_checkin,
        checkout: reservaAtualizada.data_real_checkout,
        dias: diffDays
      },
      valores: {
        diaria: parseFloat(reservaAtualizada.Quarto.preco_noite),
        hospedagem: valorHospedagem,
        extras: extrasTotal,
        total: valorTotalComExtras,
        pago: parseFloat(valor_pago || valorTotalComExtras),
        troco: (valor_pago || valorTotalComExtras) - valorTotalComExtras
      },
      pagamento: {
        metodo: reservaAtualizada.metodo_pagamento,
        status: reservaAtualizada.status_pagamento
      },
      data_finalizacao: new Date().toISOString()
    };
    
    res.json({
      message: 'Check-out realizado com sucesso!',
      recibo: recibo,
      reserva: reservaAtualizada
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar check-out:', error);
    res.status(500).json({ error: 'Erro ao processar check-out: ' + error.message });
  }
});

// GET /api/checkout/hospede/:hospedeId - Listar reservas ativas do hóspede
router.get('/hospede/:hospedeId', authenticateToken, isStaff, async (req, res) => {
  try {
    const { hospedeId } = req.params;
    
    const reservas = await Reserva.findAll({
      where: {
        hospede_id: hospedeId,
        status_reserva: { [Op.in]: ['confirmada', 'pendente'] }
      },
      include: [
        { model: Quarto },
        { model: Hospede }
      ],
      order: [['data_checkin', 'DESC']]
    });
    
    res.json(reservas);
  } catch (error) {
    console.error('Erro ao buscar reservas do hóspede:', error);
    res.status(500).json({ error: 'Erro ao buscar reservas do hóspede' });
  }
});

// GET /api/checkout/reserva/:reservaId/detalhes - Detalhes para check-out
router.get('/reserva/:reservaId/detalhes', authenticateToken, isStaff, async (req, res) => {
  try {
    const { reservaId } = req.params;
    
    const reserva = await Reserva.findByPk(reservaId, {
      include: [
        { model: Quarto },
        { model: Hospede }
      ]
    });
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    // Calcular valores
    const hoje = new Date().toISOString().split('T')[0];
    const checkinDate = new Date(reserva.data_checkin);
    const checkoutDate = new Date(reserva.data_real_checkout || hoje);
    
    const diffTime = Math.abs(checkoutDate - checkinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const valorHospedagem = diffDays * parseFloat(reserva.Quarto.preco_noite);
    const extrasTotal = reserva.extras ? 
      (reserva.extras.alimentacao || 0) + 
      (reserva.extras.lavanderia || 0) + 
      (reserva.extras.telefone || 0) + 
      (reserva.extras.outros || 0) : 0;
    
    const valorTotal = valorHospedagem + extrasTotal;
    
    res.json({
      reserva: reserva,
      calculo: {
        dias: diffDays,
        diaria: parseFloat(reserva.Quarto.preco_noite),
        valor_hospedagem: valorHospedagem,
        extras: extrasTotal,
        total: valorTotal,
        pago: parseFloat(reserva.valor_pago || 0),
        saldo: valorTotal - parseFloat(reserva.valor_pago || 0)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar detalhes da reserva:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes da reserva' });
  }
});

module.exports = router;
