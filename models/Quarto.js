const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quarto = sequelize.define('Quarto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  tipo: {
    type: DataTypes.ENUM('standard', 'deluxe', 'suite', 'familia'),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  capacidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  preco_noite: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  comodidades: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('disponivel', 'ocupado', 'manutencao', 'reservado'),
    defaultValue: 'disponivel'
  },
  foto_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'quartos',
  timestamps: true
});

module.exports = Quarto;
