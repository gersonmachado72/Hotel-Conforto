const express = require('express');
const Quarto = require('../models/Quarto');
const { authenticateToken, isStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/quartos - Listar todos os quartos
router.get('/', async (req, res) => {
  try {
    const quartos = await Quarto.findAll({
      order: [['numero', 'ASC']]
    });
    res.json(quartos);
  } catch (error) {
    console.error('Erro ao buscar quartos:', error);
    res.status(500).json({ error: 'Erro ao buscar quartos' });
  }
});

// GET /api/quartos/disponiveis - Listar quartos disponíveis
router.get('/disponiveis', async (req, res) => {
  try {
    const quartos = await Quarto.findAll({
      where: {
        status: 'disponivel'
      },
      order: [['preco_noite', 'ASC']]
    });
    
    res.json(quartos);
  } catch (error) {
    console.error('Erro ao buscar quartos disponíveis:', error);
    res.status(500).json({ error: 'Erro ao buscar quartos disponíveis' });
  }
});

// GET /api/quartos/:id - Buscar quarto por ID
router.get('/:id', async (req, res) => {
  try {
    const quarto = await Quarto.findByPk(req.params.id);
    
    if (!quarto) {
      return res.status(404).json({ error: 'Quarto não encontrado' });
    }
    
    res.json(quarto);
  } catch (error) {
    console.error('Erro ao buscar quarto:', error);
    res.status(500).json({ error: 'Erro ao buscar quarto' });
  }
});

// POST /api/quartos - Criar novo quarto (apenas staff)
router.post('/', authenticateToken, isStaff, async (req, res) => {
  try {
    const quarto = await Quarto.create(req.body);
    res.status(201).json(quarto);
  } catch (error) {
    console.error('Erro ao criar quarto:', error);
    res.status(500).json({ error: 'Erro ao criar quarto' });
  }
});

// PUT /api/quartos/:id - Atualizar quarto (apenas staff)
router.put('/:id', authenticateToken, isStaff, async (req, res) => {
  try {
    const quarto = await Quarto.findByPk(req.params.id);
    
    if (!quarto) {
      return res.status(404).json({ error: 'Quarto não encontrado' });
    }
    
    await quarto.update(req.body);
    res.json(quarto);
  } catch (error) {
    console.error('Erro ao atualizar quarto:', error);
    res.status(500).json({ error: 'Erro ao atualizar quarto' });
  }
});

// DELETE /api/quartos/:id - Excluir quarto (apenas admin)
router.delete('/:id', authenticateToken, isStaff, async (req, res) => {
  try {
    const quarto = await Quarto.findByPk(req.params.id);
    
    if (!quarto) {
      return res.status(404).json({ error: 'Quarto não encontrado' });
    }
    
    await quarto.destroy();
    res.json({ message: 'Quarto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir quarto:', error);
    res.status(500).json({ error: 'Erro ao excluir quarto' });
  }
});

module.exports = router;
