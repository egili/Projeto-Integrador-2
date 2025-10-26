# Sistema de Gestão de Biblioteca Universitária (SBU)

---

## 📋 Sobre o Projeto

O Sistema de Gestão de Biblioteca Universitária (SBU) é uma aplicação web completa que permite:

- **Sistema do Aluno**: Consultar livros disponíveis e visualizar classificação de leitores
- **Sistema do Bibliotecário**: Cadastrar livros, gerenciar exemplares e acompanhar empréstimos
- **Totem de Autoatendimento**: Realizar empréstimos e devoluções de forma autônoma

## 🚀 Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MySQL
- dotenv (gerenciamento de variáveis de ambiente)

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

## 📁 Estrutura do Projeto

```
sbu/
├── backend/
│   ├── controllers/        # Controladores da aplicação
│   ├── database/          # Configuração do banco de dados
│   ├── models/            # Modelos de dados
│   ├── routes/            # Rotas da API REST
│   ├── init-db.js         # Script de inicialização do banco
│   ├── script.sql         # Script SQL das tabelas
│   ├── server.js          # Servidor principal
│   └── package.json       # Dependências do backend
├── sistema-aluno/         # Interface do aluno
├── sistema-bibliotecario/ # Interface do bibliotecário
└── totem/                 # Interface do totem
```

## 🔧 Pré-requisitos

Antes de começar, você precisará ter instalado:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [MySQL](https://www.mysql.com/) (versão 5.7 ou superior)
- [Git](https://git-scm.com/)

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd Projeto-Integrador-2
```

### 2. Configure o banco de dados MySQL

Certifique-se de que o MySQL está rodando e crie o banco de dados:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE biblioteca;
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na pasta `sbu/backend/` com suas configurações:

```env
# Configurações do servidor
PORT=3000

# Configurações do banco de dados MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=biblioteca

# Configurações da aplicação
NODE_ENV=development
```

> **Nota**: Use o arquivo `.env.example` como referência.

### 4. Instale as dependências do backend

```bash
cd sbu/backend
npm install
```

### 5. Inicialize o banco de dados

```bash
npm run init-db
```

Este comando irá:
- Criar todas as tabelas necessárias
- Inserir dados iniciais (alunos, livros, semestres)

## 🎯 Como Executar

### Iniciar o servidor

```bash
cd sbu/backend
npm start
```

Ou para modo de desenvolvimento (com auto-reload):

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Acessar os sistemas

Após iniciar o servidor, você pode acessar:

- **Sistema do Aluno**: http://localhost:3000/aluno
- **Sistema do Bibliotecário**: http://localhost:3000/bibliotecario
- **Totem de Autoatendimento**: http://localhost:3000/totem

## 📚 API REST

A API REST está disponível em `http://localhost:3000/api` com os seguintes endpoints:

### Alunos
- `GET /api/alunos` - Listar todos os alunos
- `POST /api/alunos` - Cadastrar novo aluno
- `GET /api/alunos/ra/:ra` - Buscar aluno por RA

### Livros
- `GET /api/livros` - Listar todos os livros
- `POST /api/livros` - Cadastrar novo livro
- `GET /api/livros/disponiveis` - Listar livros disponíveis
- `GET /api/livros/busca?titulo=termo` - Buscar livros
- `GET /api/livros/:id` - Buscar livro por ID

### Exemplares
- `GET /api/exemplares/livro/:idLivro` - Listar exemplares de um livro
- `POST /api/exemplares` - Cadastrar novo exemplar
- `GET /api/exemplares/codigo/:codigo` - Buscar exemplar por código

### Empréstimos
- `GET /api/emprestimos/pendentes` - Listar empréstimos pendentes
- `GET /api/emprestimos/historico` - Listar histórico completo
- `GET /api/emprestimos/aluno/:ra` - Listar empréstimos de um aluno
- `POST /api/emprestimos` - Registrar empréstimo
- `PUT /api/emprestimos/:id/devolver` - Registrar devolução

### Classificação
- `GET /api/classificacao/geral` - Obter ranking de leitores
- `GET /api/classificacao/semestre/:id` - Classificação por semestre
- `GET /api/classificacao/aluno/:ra` - Pontuação de um aluno
- `GET /api/classificacao/semestres` - Listar semestres

## 🎮 Funcionalidades

### Sistema do Aluno
- Consultar livros disponíveis no acervo
- Buscar livros por título ou autor
- Visualizar informações detalhadas dos livros
- Ver ranking de leitores mais ativos

### Sistema do Bibliotecário
- Cadastrar novos livros e exemplares
- Gerenciar exemplares (status, observações)
- Visualizar empréstimos pendentes
- Acessar histórico de empréstimos
- Visualizar relatório de leitores

### Totem de Autoatendimento
- **Retirada de Livros**:
  - Buscar livro disponível
  - Identificar aluno por RA
  - Cadastrar novo aluno (se necessário)
  - Confirmar empréstimo
  
- **Devolução de Livros**:
  - Identificar aluno por RA
  - Selecionar empréstimo a devolver
  - Confirmar devolução

## 📊 Banco de Dados

O sistema utiliza as seguintes tabelas:

- `aluno` - Dados dos alunos
- `livro` - Catálogo de livros
- `exemplar` - Exemplares físicos dos livros
- `emprestimo` - Registro de empréstimos (sem controle de prazo)
- `classificacao` - Sistema de classificação de leitores
- `semestre` - Períodos letivos
- `log` - Registro de eventos do sistema

## 🐛 Solução de Problemas

### Erro de conexão com o banco de dados

Verifique se:
1. O MySQL está rodando
2. As credenciais no arquivo `.env` estão corretas
3. O banco de dados `biblioteca` foi criado

### Porta 3000 já está em uso

Altere a porta no arquivo `.env`:
```env
PORT=3001
```

### Erro ao executar `npm install`

Certifique-se de que está na pasta `sbu/backend` e que o Node.js está instalado:
```bash
node --version
npm --version
```

## 👥 Autores

Time 3 - Projeto Integrador II

## 📄 Licença

Este projeto está sob a licença MIT.

## 📝 Notas de Desenvolvimento

### Alterações Realizadas

1. **Estrutura do Backend**:
   - Unificação dos arquivos `server.js` e `api.js`
   - Criação de rotas organizadas na pasta `routes/`
   - Integração com controllers e models existentes
   - Remoção de campo `data_aquisicao` da tabela `exemplar` (não necessário)

2. **Configuração**:
   - Implementação de variáveis de ambiente com `.env`
   - Configuração de conexão dinâmica com MySQL

3. **Frontend**:
   - Correção de URLs da API nos três sistemas
   - Ajuste das chamadas de API para usar query params
   - Correção do fluxo de empréstimo com exemplares
   - Atualização das rotas de devolução

4. **API REST**:
   - Padronização das rotas
   - Uso de `idExemplar` ao invés de `idLivro` nos empréstimos
   - Implementação de busca por RA do aluno
   - Adição de endpoint de busca de exemplar por código