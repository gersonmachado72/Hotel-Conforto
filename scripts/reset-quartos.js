require('dotenv').config();
const sequelize = require('../config/database');
const Quarto = require('../models/Quarto');
const Reserva = require('../models/Reserva');

async function resetQuartos() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco');
    
    // Atualizar TODOS os quartos para "disponivel"
    const result = await Quarto.update(
      { status: 'disponivel' },
      { where: {} }
    );
    
    console.log(`✅ ${result[0]} quartos atualizados para DISPONÍVEL`);
    
    // Opcional: limpar reservas antigas
    // await Reserva.destroy({ where: {} });
    // console.log('✅ Reservas antigas removidas');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

resetQuartos();
