const Quarto = require('./Quarto');
const Hospede = require('./Hospede');
const Reserva = require('./Reserva');
const Usuario = require('./Usuario');

// Definir associações
Reserva.belongsTo(Quarto, { foreignKey: 'quarto_id' });
Reserva.belongsTo(Hospede, { foreignKey: 'hospede_id' });
Quarto.hasMany(Reserva, { foreignKey: 'quarto_id' });
Hospede.hasMany(Reserva, { foreignKey: 'hospede_id' });

module.exports = {
  Quarto,
  Hospede,
  Reserva,
  Usuario
};
