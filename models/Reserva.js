const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_reserva: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  hospede_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quarto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data_checkin: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  data_checkout: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  data_real_checkout: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  numero_hospedes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  valor_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  valor_pago: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  status_pagamento: {
    type: DataTypes.ENUM('pendente', 'pago', 'parcial', 'cancelado', 'finalizado'),
    defaultValue: 'pendente'
  },
  status_reserva: {
    type: DataTypes.ENUM('confirmada', 'pendente', 'cancelada', 'concluida', 'checkout'),
    defaultValue: 'pendente'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metodo_pagamento: {
    type: DataTypes.ENUM('cartao', 'dinheiro', 'pix', 'transferencia'),
    allowNull: true
  },
  extras: {
    type: DataTypes.JSON,
    defaultValue: {
      alimentacao: 0,
      lavanderia: 0,
      telefone: 0,
      outros: 0
    }
  }
}, {
  tableName: 'reservas',
  timestamps: true
});

module.exports = Reserva;
