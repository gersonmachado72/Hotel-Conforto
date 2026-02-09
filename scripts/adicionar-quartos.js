require('dotenv').config();
const sequelize = require('../config/database');
const Quarto = require('../models/Quarto');

async function adicionarQuartos() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco');
    
    const novosQuartos = [
      {
        numero: '103',
        tipo: 'standard',
        descricao: 'Quarto standard com vista para o jardim',
        capacidade: 2,
        preco_noite: 280.00,
        comodidades: ['TV', 'Wi-Fi', 'Ar-condicionado', 'Banheiro privativo'],
        status: 'disponivel'
      },
      {
        numero: '104',
        tipo: 'standard',
        descricao: 'Quarto standard silencioso',
        capacidade: 2,
        preco_noite: 270.00,
        comodidades: ['TV', 'Wi-Fi', 'Ar-condicionado', 'Cofre'],
        status: 'disponivel'
      },
      {
        numero: '202',
        tipo: 'deluxe',
        descricao: 'Quarto deluxe com varanda',
        capacidade: 3,
        preco_noite: 520.00,
        comodidades: ['TV LCD', 'Wi-Fi', 'Frigobar', 'Varanda', 'Cafeteira'],
        status: 'disponivel'
      },
      {
        numero: '203',
        tipo: 'suite',
        descricao: 'Suíte júnior com sala separada',
        capacidade: 4,
        preco_noite: 750.00,
        comodidades: ['TV 55"', 'Wi-Fi', 'Frigobar', 'Sala de estar', 'Banheira'],
        status: 'disponivel'
      },
      {
        numero: '301',
        tipo: 'familia',
        descricao: 'Suíte familiar com 2 quartos',
        capacidade: 6,
        preco_noite: 950.00,
        comodidades: ['2 TVs', 'Wi-Fi', 'Frigobar', 'Cozinha compacta', '2 Banheiros'],
        status: 'disponivel'
      }
    ];
    
    for (const quarto of novosQuartos) {
      const existe = await Quarto.findOne({ where: { numero: quarto.numero } });
      if (!existe) {
        await Quarto.create(quarto);
        console.log(`✅ Quarto ${quarto.numero} criado`);
      } else {
        console.log(`⚠️  Quarto ${quarto.numero} já existe`);
      }
    }
    
    console.log('🎉 Quartos adicionados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

adicionarQuartos();
