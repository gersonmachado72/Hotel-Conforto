const express = require('express');
const { Op } = require('sequelize');  // ADICIONAR ESTA LINHA
const Hospede = require('../models/Hospede');
const { authenticateToken, isStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/hospedes - Listar hóspedes (apenas staff)
router.get('/', authenticateToken, isStaff, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { cpf: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const hospedes = await Hospede.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nome', 'ASC']]
    });
    
    res.json({
      data: hospedes.rows,
      total: hospedes.count,
      page: parseInt(page),
      totalPages: Math.ceil(hospedes.count / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar hóspedes:', error);
    res.status(500).json({ error: 'Erro ao buscar hóspedes' });
  }
});

// GET /api/hospedes/:id - Buscar hóspede por ID
router.get('/:id', authenticateToken, isStaff, async (req, res) => {
  try {
    const hospede = await Hospede.findByPk(req.params.id);
    
    if (!hospede) {
      return res.status(404).json({ error: 'Hóspede não encontrado' });
    }
    
    res.json(hospede);
  } catch (error) {
    console.error('Erro ao buscar hóspede:', error);
    res.status(500).json({ error: 'Erro ao buscar hóspede' });
  }
});

// POST /api/hospedes - Criar novo hóspede
router.post('/', async (req, res) => {
  try {
    // Verificar se já existe hóspede com este CPF ou email
    const hospedeExistente = await Hospede.findOne({
      where: {
        [Op.or]: [
          { cpf: req.body.cpf },
          { email: req.body.email }
        ]
      }
    });
    
    if (hospedeExistente) {
      return res.status(400).json({ 
        error: 'Já existe um hóspede com este CPF ou email' 
      });
    }
    
    const hospede = await Hospede.create(req.body);
    res.status(201).json(hospede);
  } catch (error) {
    console.error('Erro ao criar hóspede:', error);
    res.status(500).json({ error: 'Erro ao criar hóspede' });
  }
});

// PUT /api/hospedes/:id - Atualizar hóspede
router.put('/:id', authenticateToken, isStaff, async (req, res) => {
  try {
    const hospede = await Hospede.findByPk(req.params.id);
    
    if (!hospede) {
      return res.status(404).json({ error: 'Hóspede não encontrado' });
    }
    
    await hospede.update(req.body);
    res.json(hospede);
  } catch (error) {
    console.error('Erro ao atualizar hóspede:', error);
    res.status(500).json({ error: 'Erro ao atualizar hóspede' });
  }
});

module.exports = router;
