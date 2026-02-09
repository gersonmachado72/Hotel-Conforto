const sequelize = require('../config/database');
const Quarto = require('../models/Quarto');
const Hospede = require('../models/Hospede');
const Reserva = require('../models/Reserva');
const Usuario = require('../models/Usuario');

async function initDatabase() {
  try {
    // Sincronizar modelos com o banco
    await sequelize.sync({ force: true });
    console.log('✅ Banco de dados sincronizado!');
    
    // Criar usuário admin padrão
    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash('admin123', 10);
    
    await Usuario.create({
      nome: 'Administrador',
      email: 'admin@hotelconforto.com',
      senha: senhaHash,
      cargo: 'admin',
      status: 'ativo'
    });
    console.log('👤 Usuário admin criado (email: admin@hotelconforto.com, senha: admin123)');
    
    // Criar quartos de exemplo
    const quartos = [
      {
        numero: '101',
        tipo: 'standard',
        descricao: 'Quarto standard com cama de casal, TV e banheiro privativo',
        capacidade: 2,
        preco_noite: 250.00,
        comodidades: ['TV', 'Ar-condicionado', 'Wi-Fi', 'Banheiro privativo'],
        status: 'disponivel'
      },
      {
        numero: '102',
        tipo: 'deluxe',
        descricao: 'Quarto deluxe com vista para o mar',
        capacidade: 3,
        preco_noite: 450.00,
        comodidades: ['TV LCD', 'Ar-condicionado', 'Wi-Fi', 'Frigobar', 'Varanda'],
        status: 'disponivel'
      },
      {
        numero: '201',
        tipo: 'suite',
        descricao: 'Suíte master com hidromassagem',
        capacidade: 4,
        preco_noite: 680.00,
        comodidades: ['TV 55"', 'Ar-condicionado', 'Wi-Fi', 'Frigobar', 'Hidromassagem', 'Varanda'],
        status: 'disponivel'
      }
    ];
    
    for (const quarto of quartos) {
      await Quarto.create(quarto);
    }
    console.log(`✅ ${quartos.length} quartos criados!`);
    
    console.log('\n🎉 Banco de dados inicializado com sucesso!');
    console.log('📊 Acesse: http://localhost:3000/admin para fazer login');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  } finally {
    await sequelize.close();
  }
}

initDatabase();
