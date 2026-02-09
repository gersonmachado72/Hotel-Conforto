# 🏨 Hotel Conforto - Sistema de Gestão Hoteleira

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![GitHub](https://img.shields.io/github/license/gersonmachado72/Hotel-Conforto?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/gersonmachado72/Hotel-Conforto?style=for-the-badge)
![GitHub repo size](https://img.shields.io/github/repo-size/gersonmachado72/Hotel-Conforto?style=for-the-badge)

Sistema completo de gestão hoteleira desenvolvido com Node.js, Express, MySQL e Sequelize. Gerencia reservas, hóspedes, quartos e funcionários com interface administrativa moderna.

## 📸 Screenshots

| Painel Administrativo | Sistema de Reservas | Dashboard |
|----------------------|---------------------|-----------|
| ![Admin](https://via.placeholder.com/400x250/4A6572/FFFFFF?text=Painel+Admin) | ![Reservas](https://via.placeholder.com/400x250/4A6572/FFFFFF?text=Sistema+de+Reservas) | ![Dashboard](https://via.placeholder.com/400x250/4A6572/FFFFFF?text=Dashboard+Estatísticas) |

| Check-in/Check-out | Gestão de Hóspedes | Quartos Disponíveis |
|-------------------|-------------------|-------------------|
| ![Checkout](https://via.placeholder.com/400x250/4A6572/FFFFFF?text=Check-in/Check-out) | ![Hóspedes](https://via.placeholder.com/400x250/4A6572/FFFFFF?text=Gestão+de+Hóspedes) | ![Quartos](https://via.placeholder.com/400x250/4A6572/FFFFFF?text=Quartos+Disponíveis) |

## ✨ Funcionalidades

### 🏨 **Gestão de Quartos**
- ✅ Cadastro de quartos com tipos (standard, deluxe, suite, família)
- ✅ Definição de preços por noite, capacidade e comodidades
- ✅ Controle de status (disponível, ocupado, reservado, manutenção)
- ✅ Upload de fotos dos quartos

### 👥 **Gestão de Hóspedes**
- ✅ Cadastro completo com dados pessoais
- ✅ CPF e email únicos para evitar duplicidades
- ✅ Histórico de reservas
- ✅ Status do hóspede (ativo, inativo, bloqueado)

### 📅 **Sistema de Reservas**
- ✅ Criação de reservas com código único
- ✅ Verificação automática de disponibilidade
- ✅ Cálculo automático de valores
- ✅ Controle de status (pendente, confirmada, cancelada, concluída)
- ✅ Sistema de checkout com cálculo de extras

### 👨‍💼 **Painel Administrativo**
- ✅ Dashboard com métricas em tempo real
- ✅ Gráficos de ocupação e receita
- ✅ Listagem e filtros avançados
- ✅ Interface responsiva e moderna

### 🔐 **Sistema de Segurança**
- ✅ Autenticação JWT
- ✅ Controle de acesso por cargos (admin, gerente, recepcionista, camareira)
- ✅ Middleware de autorização
- ✅ Proteção de rotas sensíveis

## 🛠️ Tecnologias

### **Backend**
- **Node.js v18.x** - Ambiente de execução
- **Express v4.x** - Framework web
- **MySQL v8.0** - Banco de dados relacional
- **Sequelize v6.x** - ORM para MySQL
- **JWT** - Autenticação por tokens
- **bcrypt** - Hash de senhas
- **dotenv** - Variáveis de ambiente

### **Frontend**
- **HTML5, CSS3, JavaScript ES6+**
- **Bootstrap 5** - Framework CSS
- **Font Awesome** - Ícones
- **Chart.js** - Gráficos
- **Design responsivo**

### **Ferramentas de Desenvolvimento**
- **NPM** - Gerenciador de pacotes
- **Nodemon** - Reinício automático em desenvolvimento
- **Git** - Controle de versão

## 🚀 Instalação

### **Pré-requisitos**
- Node.js 18.x ou superior
- MySQL 8.0 ou superior
- NPM ou Yarn

### **Passo a Passo**

```bash
# 1. Clone o repositório
git clone https://github.com/gersonmachado72/Hotel-Conforto.git
cd Hotel-Conforto

# 2. Instale as dependências
npm install

# 3. Configure o banco de dados
mysql -u root -p -e "CREATE DATABASE hotel_conforto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 5. Execute o script de inicialização
npm run db:init

# 6. Inicie o servidor
npm run dev

# 7. Acesse a aplicação
# Admin: http://localhost:3000/admin
# Painel Hóspede: http://localhost:3000/painel
# Site: http://localhost:3000
⚙️ Configuração
Arquivo .env
env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotel_conforto
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# Autenticação
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=24h

# Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
📁 Estrutura do Projeto
text
hotel-conforto/
├── config/
│   └── database.js          # Configuração do Sequelize
├── middleware/
│   ├── auth.js             # Middleware de autenticação
│   └── upload.js           # Middleware de upload
├── models/                  # Modelos Sequelize
│   ├── Hospede.js          # Modelo de hóspedes
│   ├── Quarto.js           # Modelo de quartos
│   ├── Reserva.js          # Modelo de reservas
│   └── Usuario.js          # Modelo de usuários
├── routes/                  # Rotas da API
│   ├── auth.js             # Rotas de autenticação
│   ├── checkout.js         # Rotas de checkout
│   ├── dashboard.js        # Rotas do dashboard
│   ├── hospedes.js         # Rotas de hóspedes
│   ├── quartos.js          # Rotas de quartos
│   └── reservas.js         # Rotas de reservas
├── public/                  # Arquivos estáticos
│   ├── admin/              # Painel administrativo
│   ├── dashboard/          # Painel do hóspede
│   ├── css/                # Estilos
│   ├── js/                 # JavaScript
│   └── img/                # Imagens
├── scripts/                 # Scripts auxiliares
├── uploads/                 # Arquivos enviados
├── .env.example            # Exemplo de variáveis
├── .gitignore              # Arquivos ignorados
├── package.json            # Dependências
├── server.js               # Ponto de entrada
└── README.md               # Documentação
🔌 API Endpoints
Autenticação
POST /api/auth/login - Login de usuário

GET /api/auth/verify - Verificar token

Quartos
GET /api/quartos - Listar todos os quartos

GET /api/quartos/disponiveis - Quartos disponíveis

GET /api/quartos/:id - Buscar quarto por ID

POST /api/quartos - Criar novo quarto (staff)

PUT /api/quartos/:id - Atualizar quarto (staff)

Hóspedes
GET /api/hospedes - Listar hóspedes

GET /api/hospedes/:id - Buscar hóspede por ID

POST /api/hospedes - Criar novo hóspede (staff)

Reservas
GET /api/reservas - Listar reservas (staff)

GET /api/reservas/:id - Buscar reserva por ID

POST /api/reservas - Criar reserva (staff)

POST /api/reservas/public - Criar reserva pública (hóspedes)

PUT /api/reservas/:id - Atualizar reserva (staff)

Dashboard
GET /api/dashboard/stats - Estatísticas (staff)

GET /api/dashboard/recent-reservations - Reservas recentes (staff)

🗄️ Modelos de Banco de Dados
Usuários
javascript
{
  id: INTEGER, PK, AI,
  nome: STRING(100),
  email: STRING(100), UNIQUE,
  senha: STRING(255),
  cargo: ENUM('admin', 'gerente', 'recepcionista', 'camareira'),
  status: ENUM('ativo', 'inativo', 'ferias'),
  ultimo_login: DATETIME
}
Hóspedes
javascript
{
  id: INTEGER, PK, AI,
  nome: STRING(100),
  email: STRING(100), UNIQUE,
  telefone: STRING(20),
  cpf: STRING(14), UNIQUE,
  data_nascimento: DATE,
  endereco: JSON,
  nacionalidade: STRING(50),
  status: ENUM('ativo', 'inativo', 'bloqueado')
}
Quartos
javascript
{
  id: INTEGER, PK, AI,
  numero: STRING(10), UNIQUE,
  tipo: ENUM('standard', 'deluxe', 'suite', 'familia'),
  descricao: TEXT,
  capacidade: INTEGER,
  preco_noite: DECIMAL(10,2),
  comodidades: JSON,
  status: ENUM('disponivel', 'ocupado', 'manutencao', 'reservado'),
  foto_url: STRING(255)
}
Reservas
javascript
{
  id: INTEGER, PK, AI,
  codigo_reserva: STRING(20), UNIQUE,
  hospede_id: INTEGER, FK → Hospedes,
  quarto_id: INTEGER, FK → Quartos,
  data_checkin: DATE,
  data_checkout: DATE,
  valor_total: DECIMAL(10,2),
  status_pagamento: ENUM('pendente', 'pago', 'parcial', 'cancelado'),
  status_reserva: ENUM('confirmada', 'pendente', 'cancelada', 'concluida')
}
🔐 Autenticação
O sistema usa JWT (JSON Web Tokens) para autenticação:

javascript
// Exemplo de login
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@hotelconforto.com',
    senha: 'admin123'
  })
});

// Token é armazenado no localStorage
// E enviado em requisições subsequentes
headers: {
  'Authorization': `Bearer ${token}`
}
⚠️ Problemas Comuns e Soluções
1. Erro: "Too many keys specified; max 64 keys allowed"
sql
-- Remova índices duplicados
DROP INDEX email_2 ON hospedes;
DROP INDEX email_3 ON hospedes;
2. Erro: "Token de acesso não fornecido"
javascript
// No frontend, adicione header Authorization
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
3. Erro de Conexão com MySQL
bash
# Verifique se o MySQL está rodando
sudo systemctl status mysql

# Teste a conexão
mysql -u seu_usuario -p -h localhost hotel_conforto
4. Erros de Sincronização do Sequelize
javascript
// No server.js use:
await sequelize.sync({ alter: false }); // Em produção
🤝 Contribuindo
Contribuições são bem-vindas! Siga os passos:

Fork o projeto

Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'Add some AmazingFeature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request

📄 Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

🙏 Agradecimentos
Equipe de desenvolvimento do Hotel Conforto

Comunidade Node.js e Express

Todos os contribuidores e testadores

📞 Suporte
Para suporte, dúvidas ou reportar bugs:

Verifique a seção de Problemas Comuns

Abra uma issue no GitHub

Entre em contato com a equipe de desenvolvimento

Hotel Conforto - Transformando a gestão hoteleira com tecnologia moderna e eficiente. 🏨✨

Última atualização: Fevereiro 2026
Versão: 2.0.0
