📚 Totem de Autoatendimento - Sistema de Biblioteca Universitária
Sistema web desenvolvido para o Projeto Integrador II do curso de Sistemas de Informação da PUC-Campinas. O totem permite que alunos realizem empréstimos e devoluções de livros de forma autônoma através de uma interface intuitiva.

🎯 Funcionalidades
Terminal de Autoatendimento (Totem)
Retirada de Livros: Empréstimo autônomo com validação em tempo real

Devolução de Livros: Devolução simplificada com atualização automática da classificação

Validações: Verificação de cadastro do aluno e disponibilidade dos livros

🗂️ Estrutura do Projeto
text
sbu/
├── backend/                 # API Node.js + MySQL
│   ├── src/
│   │   ├── controllers/     # Lógica das rotas
│   │   ├── models/          # Modelos de dados
│   │   ├── database/        # Configuração do banco
│   │   └── server.js        # Servidor principal
│   ├── package.json
│   └── script.sql           # Script do banco de dados
│
└── totem/                   # Frontend do totem
    ├── src/
    │   ├── assets/          # Recursos estáticos
    │   ├── js/              # JavaScript do frontend
    │   ├── pages/           # Telas do sistema
    │   ├── styles/          # Arquivos CSS
    │   └── index.html       # Página inicial
    └── README.md
🚀 Como Executar o Sistema
Pré-requisitos
Node.js (versão 14 ou superior)

MySQL (versão 5.7 ou superior)

Navegador moderno (Chrome, Firefox, Edge)

📋 Passo a Passo Completo
1. Configurar o Banco de Dados
bash
# Conecte ao MySQL
mysql -u root -p

# Execute o script do banco
source caminho/para/backend/script.sql
2. Configurar e Executar o Backend
bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências (usando CMD no Windows)
npm install

# Configure as credenciais do banco no arquivo:
# backend/src/database/connection.js

# Inicie o servidor
npm run dev
Verifique se o backend está rodando:
Acesse: http://localhost:3000
Você deve ver a mensagem: "Bem-vindo ao Sistema de Biblioteca Universitária"

3. Executar o Frontend (Totem)
bash
# Navegue até a pasta do totem
cd totem

# Abra o arquivo index.html em um navegador
# Métodos:
# 1. Duplo clique no arquivo index.html
# 2. Servidor local: python -m http.server 8000
# 3. Extensão Live Server no VSCode
Acesso direto: Abra totem/src/index.html no navegador.

🔧 Configuração do Banco de Dados
Arquivo: backend/src/database/connection.js
javascript
const connection = mysql.createPool({
    host: 'localhost',      // Servidor MySQL
    user: 'root',           // Seu usuário MySQL
    password: '',           // Sua senha MySQL
    database: 'biblioteca', // Nome do banco
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
Estrutura do Banco
sql
-- Tabelas principais
- aluno (id, nome, ra)
- livro (id, titulo, isbn, autor, editora, anoPublicacao)
- emprestimo (id, idAluno, idLivro, dataEmprestimo, dataDevolucao)
- classificacao (id, codigo, descricao, idSemestre, idAluno)
- semestre (id, descricao, dataInicio, dataFim)
🎮 Como Usar o Totem
Fluxo de Retirada de Livros:
Selecionar "Retirada de Livro" na tela inicial

Pesquisar livro por título ou autor

Selecionar livro desejado

Informar RA do aluno

Confirmar empréstimo

Visualizar mensagem de sucesso

Fluxo de Devolução de Livros:
Selecionar "Devolução de Livro" na tela inicial

Informar RA do aluno

Selecionar livro para devolver

Confirmar devolução

Visualizar mensagem de sucesso e classificação atualizada

🛠️ Tecnologias Utilizadas
Backend
Node.js - Runtime JavaScript

Express.js - Framework web

MySQL2 - Driver do banco de dados

CORS - Middleware para requisições cross-origin

Body Parser - Parse de JSON nas requisições

Frontend
HTML5 - Estrutura da aplicação

CSS3 - Estilos e design responsivo

JavaScript - Lógica e integração com API

Fetch API - Comunicação com o backend

🔌 Endpoints da API
Alunos
POST /api/alunos - Cadastrar aluno

GET /api/alunos/:ra - Buscar aluno por RA

GET /api/alunos - Listar todos os alunos

Livros
POST /api/livros - Cadastrar livro

GET /api/livros - Buscar livros disponíveis

GET /api/livros/todos - Listar todos os livros

Empréstimos
POST /api/emprestimos - Realizar empréstimo

POST /api/emprestimos/devolucao - Registrar devolução

GET /api/emprestimos/ativos/:ra - Listar empréstimos ativos por aluno

Classificação
GET /api/classificacao/:ra - Obter classificação do aluno

GET /api/classificacao - Listar classificação geral

🐛 Solução de Problemas Comuns
Erro de Política de Execução no Windows
cmd
# Use git bash em vez do PowerShell
cd backend
npm install
Erro de Conexão com MySQL
javascript
// Verifique as credenciais em:
// backend/src/database/connection.js

// Teste a conexão manualmente:
mysql -u root -p
USE biblioteca;
SHOW TABLES;
Frontend Não Conecta com Backend
Verifique se o backend está rodando na porta 3000

Confirme se a URL da API está correta: http://localhost:3000/api

Verifique o console do navegador para erros de CORS

Dados Não Aparecem
Execute o script.sql para popular o banco com dados de exemplo

Verifique se as tabelas foram criadas corretamente

📝 Desenvolvimento
Adicionando Novas Funcionalidades
Backend: Crie novos models e controllers

Frontend: Adicione páginas e scripts JavaScript

Integração: Use a API existente ou crie novos endpoints

Estrutura de Desenvolvimento
bash
# Desenvolvimento do backend
cd backend
npm run dev

# Desenvolvimento do frontend  
cd totem
# Use Live Server ou servidor local
👥 Equipe de Desenvolvimento
Eliseu Pereira Gili - RA 25009281

Eduardo Fagundes da Silva - RA 25008024

Kaue Rodrigues Seixas - RA 23011884

Lucas Athanasio Bueno de Andrade - RA 25002731

Pietra Façanha Bortolatto - RA 25002436

📞 Suporte
Em caso de problemas:

Verifique os logs do servidor backend

Confirme a conexão com o banco de dados

Verifique o console do navegador para erros JavaScript

Execute o script.sql novamente se necessário

Projeto Integrador II - Curso de Sistemas de Informação - PUC Campinas - 2025

Desenvolvido com ❤️ pelo Time 03