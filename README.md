# 📚 Sistema de Gestão de Biblioteca Universitária (SBU)

O **SBU** é um sistema completo de gestão de bibliotecas universitárias, projetado para automatizar e organizar o fluxo de empréstimos, devoluções e gestão de acervo, proporcionando interfaces distintas para alunos, bibliotecários e autoatendimento via totem.

## 🚀 Visão Geral do Projeto

O sistema é composto por um backend unificado que serve três aplicações frontend distintas:

1. **Sistema do Aluno**: Interface para que estudantes possam consultar livros disponíveis, realizar cadastros e acompanhar sua pontuação de leitura.
2. **Sistema do Bibliotecário**: Painel administrativo para gestão de livros, exemplares, alunos e emissão de relatórios de leitores.
3. **Totem de Autoatendimento**: Interface simplificada para agilizar os processos de retirada e devolução de livros sem a necessidade de intervenção humana constante.

---

## ✨ Principais Funcionalidades

### 👤 Alunos
- Consulta de livros disponíveis no acervo.
- Cadastro de novos alunos.
- Acompanhamento de classificação e pontuação de leitura.

### 📑 Bibliotecários
- Gestão completa do catálogo (CRUD de livros e exemplares).
- Gerenciamento de alunos.
- Relatórios de leitores e histórico de empréstimos.

### 🤖 Totem (Autoatendimento)
- Registro rápido de retirada de livros.
- Registro de devolução de exemplares.

### ⚙️ Backend & API
- API RESTful para comunicação entre as interfaces e o banco de dados.
- Gestão de status de exemplares (disponível/emprestado).
- Controle de datas de empréstimo e devolução.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** (Runtime)
- **Express** (Framework Web)
- **MySQL** (Banco de Dados)
- **mysql2** (Driver de conexão)
- **dotenv** (Gestão de variáveis de ambiente)
- **cors** (Cross-Origin Resource Sharing)

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**

---

## 📦 Instalação e Execução

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado.
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) instalado e rodando.

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd sbu/backend
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente:**
   Crie um arquivo `.env` na pasta `sbu/backend` com as seguintes configurações:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=biblioteca
   ```

4. **Configurar o Banco de Dados:**
   Execute o script SQL localizado em `sbu/backend/script.sql` no seu cliente MySQL para criar as tabelas necessárias. Ou utilize o comando:
   ```bash
   npm run init-db
   ```

5. **Iniciar o servidor:**
   ```bash
   # Modo desenvolvimento (com auto-reload)
   npm run dev

   # Modo produção
   npm start
   ```

### Acessando os Sistemas
Com o servidor rodando na porta 3000, acesse:
- 🎓 **Sistema do Aluno**: `http://localhost:3000/aluno`
- 📚 **Sistema do Bibliotecário**: `http://localhost:3000/bibliotecario`
- 🤖 **Totem**: `http://localhost:3000/totem`
- 🌐 **API Docs**: `http://localhost:3000/api`

---

## 🛣️ Endpoints da API

A API fornece os seguintes recursos principais:

| Recurso | Método | Endpoint | Descrição |
| :--- | :---: | :--- | :--- |
| **Alunos** | `GET` | `/api/alunos` | Lista todos os alunos |
| | `POST` | `/api/alunos` | Cadastra um novo aluno |
| | `GET` | `/api/alunos/ra/:ra` | Busca aluno por RA |
| **Livros** | `GET` | `/api/livros` | Lista todos os livros |
| | `POST` | `/api/livros` | Cadastra um novo livro |
| | `GET` | `/api/livros/disponiveis` | Lista livros com exemplares disponíveis |
| | `PUT` | `/api/livros/:id` | Atualiza dados do livro |
| | `DELETE` | `/api/livros/:id` | Remove um livro |
| **Exemplares** | `GET` | `/api/exemplares/livro/:idLivro` | Lista exemplares de um livro |
| | `POST` | `/api/exemplares` | Cadastra um novo exemplar |
| | `PUT` | `/api/exemplares/:id/status` | Altera status (disponível/emprestado) |
| **Empréstimos** | `POST` | `/api/emprestimos` | Registra um novo empréstimo |
| | `PUT` | `/api/emprestimos/:id/devolver` | Registra a devolução de um livro |
| | `GET` | `/api/emprestimos/pendentes` | Lista empréstimos não devolvidos |
| **Classificação**| `GET` | `/api/classificacao/geral` | Ranking geral de leitores |

---

## 👥 Equipe
- **Desenvolvido por:** Time 3 - PI2
