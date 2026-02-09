const express = require('express');
const { authenticateToken, isStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats - Estatísticas do dashboard
router.get('/stats', authenticateToken, isStaff, async (req, res) => {
  try {
    const { Reserva, Quarto, Hospede } = require('../models');
    const { Op } = require('sequelize');
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Contagens básicas
    const [
      totalReservas,
      reservasEsteMes,
      totalQuartos,
      quartosDisponiveis,
      totalHospedes
    ] = await Promise.all([
      Reserva.count(),
      Reserva.count({
        where: { createdAt: { [Op.gte]: startOfMonth } }
      }),
      Quarto.count(),
      Quarto.count({ where: { status: 'disponivel' } }),
      Hospede.count()
    ]);
    
    // Faturamento mensal (simplificado)
    const faturamentoMes = await Reserva.sum('valor_total', {
      where: {
        status_pagamento: 'pago',
        createdAt: { [Op.gte]: startOfMonth }
      }
    });
    
    // Taxa de ocupação
    const taxaOcupacao = totalQuartos > 0 
      ? ((totalQuartos - quartosDisponiveis) / totalQuartos * 100).toFixed(1)
      : 0;
    
    res.json({
      totalReservas,
      reservasEsteMes,
      totalQuartos,
      quartosDisponiveis,
      totalHospedes,
      faturamentoMes: faturamentoMes || 0,
      taxaOcupacao,
      reservasPorStatus: {
        confirmada: await Reserva.count({ where: { status_reserva: 'confirmada' } }),
        pendente: await Reserva.count({ where: { status_reserva: 'pendente' } }),
        cancelada: await Reserva.count({ where: { status_reserva: 'cancelada' } })
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET /api/dashboard/reservas-recentes - Últimas 10 reservas
router.get('/reservas-recentes', authenticateToken, isStaff, async (req, res) => {
  try {
    const { Reserva, Quarto, Hospede } = require('../models');
    
    const reservas = await Reserva.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Quarto, attributes: ['numero', 'tipo'] },
        { model: Hospede, attributes: ['nome', 'email'] }
      ]
    });
    
    res.json(reservas);
  } catch (error) {
    console.error('Erro ao buscar reservas recentes:', error);
    res.status(500).json({ error: 'Erro ao buscar reservas recentes' });
  }
});

module.exports = router;
