const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos
require('./models/Quarto');
require('./models/Hospede');
require('./models/Reserva');
require('./models/Usuario');

// Importar rotas
const authRoutes = require('./routes/auth');
const quartoRoutes = require('./routes/quartos');
const hospedeRoutes = require('./routes/hospedes');
const reservaRoutes = require('./routes/reservas');
const dashboardRoutes = require('./routes/dashboard');
const checkoutRoutes = require('./routes/checkout');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/quartos', quartoRoutes);
app.use('/api/hospedes', hospedeRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/checkout', checkoutRoutes);

// Rota para admin dashboard
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin', 'index.html'));
});

// Rota para painel do hóspede
app.get('/painel*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard', 'index.html'));
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para página de reservas
app.get('/reservas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reservas.html'));
});

// Rota para página de quartos
app.get('/quartos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'quartos.html'));
});

// Conexão com banco de dados e inicialização do servidor
async function startServer() {
  try {
    // Testar conexão com banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida!');

    // Sincronizar modelos (sem forçar em produção)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      try {
        const { checkDuplicateIndexes } = require('./scripts/check-indexes.js');
        await checkDuplicateIndexes();
        console.log('✅ Verificação de índices concluída');
      } catch (error) {
        console.warn('⚠️  Verificação de índices falhou:', error.message);
      }
      console.log('📊 Modelos sincronizados com o banco!');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
      console.log(`📊 Painel Admin: http://localhost:${PORT}/admin`);
      console.log(`👤 Painel Hóspede: http://localhost:${PORT}/painel`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
