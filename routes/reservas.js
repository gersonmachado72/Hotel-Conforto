const express = require('express');
const { Op } = require('sequelize');
const Reserva = require('../models/Reserva');
const Quarto = require('../models/Quarto');
const Hospede = require('../models/Hospede');
const { authenticateToken, isStaff } = require('../middleware/auth');

const router = express.Router();

// Função para gerar código de reserva
function gerarCodigoReserva() {
  const prefix = 'RES';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

// GET /api/reservas - Listar reservas (apenas staff)
router.get('/', authenticateToken, isStaff, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      data_inicio,
      data_fim 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = {};
    
    if (status) {
      where.status_reserva = status;
    }
    
    if (data_inicio && data_fim) {
      where[Op.or] = [
        {
          data_checkin: {
            [Op.between]: [data_inicio, data_fim]
          }
        },
        {
          data_checkout: {
            [Op.between]: [data_inicio, data_fim]
          }
        }
      ];
    }
    
    const reservas = await Reserva.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data_checkin', 'DESC']],
      include: [
        {
          model: Quarto,
          attributes: ['numero', 'tipo', 'preco_noite']
        },
        {
          model: Hospede,
          attributes: ['nome', 'email', 'telefone']
        }
      ]
    });
    
    res.json({
      data: reservas.rows,
      total: reservas.count,
      page: parseInt(page),
      totalPages: Math.ceil(reservas.count / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
});

// GET /api/reservas/minhas - Listar minhas reservas
router.get('/minhas', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Buscar hóspede pelo email do usuário
    const hospede = await Hospede.findOne({
      where: { email: user.email }
    });
    
    if (!hospede) {
      return res.json([]);
    }
    
    const reservas = await Reserva.findAll({
      where: { hospede_id: hospede.id },
      order: [['data_checkin', 'DESC']],
      include: [
        {
          model: Quarto,
          attributes: ['numero', 'tipo', 'foto_url']
        }
      ]
    });
    
    res.json(reservas);
  } catch (error) {
    console.error('Erro ao buscar minhas reservas:', error);
    res.status(500).json({ error: 'Erro ao buscar minhas reservas' });
  }
});

// GET /api/reservas/:id - Buscar reserva por ID
router.get('/:id', authenticateToken, isStaff, async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id, {
      include: [
        {
          model: Quarto,
          attributes: ['numero', 'tipo', 'preco_noite', 'descricao']
        },
        {
          model: Hospede,
          attributes: ['nome', 'email', 'telefone', 'cpf']
        }
      ]
    });
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    res.json(reserva);
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    res.status(500).json({ error: 'Erro ao buscar reserva' });
  }
});

// POST /api/reservas - Criar nova reserva (VERSÃO CORRIGIDA PARA ACEITAR OBJETO hospede)
router.post('/', async (req, res) => {
  try {
    console.log('📨 Dados recebidos para reserva:', JSON.stringify(req.body, null, 2));
    
    // ACEITA AMBOS OS FORMATOS para compatibilidade
    // Formato novo: com objeto hospede
    // Formato antigo: campos soltos
    
    let nome, email, telefone, cpf;
    
    if (req.body.hospede) {
      // Formato novo: objeto hospede
      console.log('📋 Usando formato novo (objeto hospede)');
      const hospedeData = req.body.hospede;
      nome = hospedeData.nome;
      email = hospedeData.email;
      telefone = hospedeData.telefone;
      cpf = hospedeData.cpf;
    } else {
      // Formato antigo: campos soltos
      console.log('📋 Usando formato antigo (campos soltos)');
      nome = req.body.nome;
      email = req.body.email;
      telefone = req.body.telefone;
      cpf = req.body.cpf;
    }
    
    const { 
      quarto_id, 
      data_checkin, 
      data_checkout, 
      numero_hospedes = 1, 
      valor_total,
      observacoes,
      metodo_pagamento
    } = req.body;
    
    console.log('📊 Dados extraídos:', {
      quarto_id,
      data_checkin,
      data_checkout,
      numero_hospedes,
      valor_total,
      nome,
      email,
      telefone,
      cpf
    });
    
    // Validações básicas
    const camposObrigatorios = [];
    if (!quarto_id) camposObrigatorios.push('quarto_id');
    if (!data_checkin) camposObrigatorios.push('data_checkin');
    if (!data_checkout) camposObrigatorios.push('data_checkout');
    if (!nome) camposObrigatorios.push('nome');
    if (!email) camposObrigatorios.push('email');
    if (!telefone) camposObrigatorios.push('telefone');
    if (!cpf) camposObrigatorios.push('cpf');
    
    if (camposObrigatorios.length > 0) {
      return res.status(400).json({ 
        error: `Campos obrigatórios faltando: ${camposObrigatorios.join(', ')}` 
      });
    }
    
    // Verificar se o quarto existe e está disponível
    const quarto = await Quarto.findByPk(quarto_id);
    
    if (!quarto) {
      return res.status(404).json({ error: `Quarto com ID ${quarto_id} não encontrado` });
    }
    
    console.log(`🛏️ Quarto encontrado: ${quarto.numero} - ${quarto.tipo} (Status: ${quarto.status})`);
    
    if (quarto.status !== 'disponivel') {
      return res.status(400).json({ 
        error: `Quarto não está disponível. Status atual: ${quarto.status}` 
      });
    }
    
    // Verificar conflito de datas
    const reservaConflito = await Reserva.findOne({
      where: {
        quarto_id,
        status_reserva: { [Op.notIn]: ['cancelada', 'concluida'] },
        [Op.or]: [
          {
            data_checkin: {
              [Op.lt]: new Date(data_checkout),
              [Op.gte]: new Date(data_checkin)
            }
          },
          {
            data_checkout: {
              [Op.gt]: new Date(data_checkin),
              [Op.lte]: new Date(data_checkout)
            }
          },
          {
            data_checkin: { [Op.lte]: new Date(data_checkin) },
            data_checkout: { [Op.gte]: new Date(data_checkout) }
          }
        ]
      }
    });
    
    if (reservaConflito) {
      console.log('⚠️ Conflito de reserva encontrado:', reservaConflito.codigo_reserva);
      return res.status(400).json({ 
        error: 'Quarto já reservado para estas datas ou datas conflitantes' 
      });
    }
    
    // CRIAR OU BUSCAR HÓSPEDE
    console.log('👤 Procurando hóspede...');
    console.log('  Email:', email.trim().toLowerCase());
    console.log('  CPF:', cpf ? cpf.replace(/\D/g, '') : 'Não fornecido');
    
    // Limpar CPF (remover pontos, traços, espaços)
    const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : '';
    
    // Primeiro tenta encontrar por email
    let hospede = await Hospede.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });
    
    // Se não encontrar por email, tenta por CPF
    if (!hospede && cpfLimpo) {
      hospede = await Hospede.findOne({ 
        where: { cpf: cpfLimpo } 
      });
    }
    
    if (!hospede) {
      console.log('👤 Criando novo hóspede...');
      try {
        hospede = await Hospede.create({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          telefone: telefone.trim(),
          cpf: cpfLimpo,
          status: 'ativo'
        });
        console.log('✅ Novo hóspede criado. ID:', hospede.id);
      } catch (hospedeError) {
        console.error('❌ Erro ao criar hóspede:', hospedeError);
        console.error('Detalhes do erro:', hospedeError.errors);
        
        // Se for erro de duplicidade, tenta buscar novamente
        if (hospedeError.name === 'SequelizeUniqueConstraintError') {
          console.log('🔄 Tentando buscar hóspede existente após erro de duplicidade...');
          hospede = await Hospede.findOne({ 
            where: { 
              [Op.or]: [
                { email: email.trim().toLowerCase() },
                { cpf: cpfLimpo }
              ]
            } 
          });
        }
        
        if (!hospede) {
          return res.status(500).json({ 
            error: 'Erro ao criar ou encontrar hóspede',
            details: hospedeError.message 
          });
        }
      }
    } else {
      console.log('✅ Hóspede existente encontrado. ID:', hospede.id);
      // Atualizar dados do hóspede existente
      await hospede.update({
        nome: nome.trim(),
        telefone: telefone.trim(),
        status: 'ativo'
      });
    }
    
    if (!hospede || !hospede.id) {
      return res.status(500).json({ 
        error: 'Hóspede não criado/encontrado. ID inválido.' 
      });
    }
    
    console.log(`👤 Hóspede ID: ${hospede.id} pronto para reserva`);
    
    // Calcular valor se não fornecido
    let valorFinal = valor_total;
    if (!valorFinal || valorFinal <= 0) {
      const inicio = new Date(data_checkin);
      const fim = new Date(data_checkout);
      const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
      valorFinal = parseFloat(quarto.preco_noite) * dias;
      console.log(`💰 Valor calculado: ${quarto.preco_noite} × ${dias} dias = ${valorFinal}`);
    }
    
    // Gerar código da reserva
    const codigoReserva = gerarCodigoReserva();
    console.log('📋 Código da reserva gerado:', codigoReserva);
    
    // CRIAR RESERVA
    console.log('📝 Criando reserva...');
    console.log('  Quarto ID:', quarto_id);
    console.log('  Hóspede ID:', hospede.id);
    console.log('  Check-in:', data_checkin);
    console.log('  Check-out:', data_checkout);
    console.log('  Valor total:', valorFinal);
    
    const reserva = await Reserva.create({
      quarto_id: parseInt(quarto_id),
      hospede_id: hospede.id,
      data_checkin,
      data_checkout,
      numero_hospedes: parseInt(numero_hospedes) || 1,
      valor_total: parseFloat(valorFinal),
      codigo_reserva: codigoReserva,
      status_reserva: 'confirmada',
      status_pagamento: 'pendente',
      observacoes: observacoes || '',
      metodo_pagamento: metodo_pagamento || null,
      extras: {
        alimentacao: 0,
        lavanderia: 0,
        telefone: 0,
        outros: 0
      }
    });
    
    console.log('✅ Reserva criada com sucesso. ID:', reserva.id);
    
    // Atualizar status do quarto para "reservado"
    await quarto.update({ status: 'reservado' });
    console.log('✅ Status do quarto atualizado para: reservado');
    
    res.status(201).json({
      success: true,
      message: 'Reserva criada com sucesso!',
      id: reserva.id,
      codigo_reserva: reserva.codigo_reserva,
      data_checkin: reserva.data_checkin,
      data_checkout: reserva.data_checkout,
      valor_total: reserva.valor_total,
      quarto_numero: quarto.numero,
      quarto_tipo: quarto.tipo,
      hospede_nome: hospede.nome
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar reserva:');
    console.error('  Mensagem:', error.message);
    console.error('  Stack:', error.stack);
    
    // Log detalhado do erro Sequelize
    if (error.name === 'SequelizeValidationError') {
      console.error('  Erros de validação:', error.errors.map(e => `${e.path}: ${e.message}`));
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('  Erro de duplicidade:', error.errors);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar reserva',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT /api/reservas/:id - Atualizar reserva
router.put('/:id', authenticateToken, isStaff, async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    await reserva.update(req.body);
    res.json(reserva);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    res.status(500).json({ error: 'Erro ao atualizar reserva' });
  }
});

// DELETE /api/reservas/:id - Cancelar reserva
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    // Verificar permissão
    const user = req.user;
    const hospede = await Hospede.findOne({ where: { email: user.email } });
    
    if (user.cargo !== 'admin' && hospede.id !== reserva.hospede_id) {
      return res.status(403).json({ 
        error: 'Você não tem permissão para cancelar esta reserva' 
      });
    }
    
    // Atualizar status da reserva
    await reserva.update({ 
      status_reserva: 'cancelada',
      status_pagamento: 'cancelado'
    });
    
    // Liberar quarto
    const quarto = await Quarto.findByPk(reserva.quarto_id);
    if (quarto) {
      await quarto.update({ status: 'disponivel' });
    }
    
    res.json({ message: 'Reserva cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
});

module.exports = router;
