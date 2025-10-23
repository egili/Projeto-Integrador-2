# Guia de Instalação e Configuração - SBU (Sistema de Biblioteca Universitária)

## Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL Server (versão 5.7 ou superior)
- Navegador web moderno (Chrome, Firefox, Edge)

## Instalação

### 1. Configurar o Banco de Dados

1. Inicie o MySQL Server
2. Execute o script de criação do banco:
   ```bash
   mysql -u root -p < backend/script.sql
   ```
   Ou abra o MySQL Workbench e execute o conteúdo de `backend/script.sql`

3. Verifique se o banco foi criado corretamente:
   ```sql
   USE biblioteca;
   SHOW TABLES;
   ```
   Você deve ver as seguintes tabelas:
   - aluno
   - bibliotecario
   - classificacao
   - emprestimo
   - exemplar
   - livro
   - log
   - semestre

### 2. Configurar o Backend

1. Navegue até a pasta do backend:
   ```bash
   cd sbu/backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as credenciais do banco de dados:
   - Abra o arquivo `src/database/connection.js`
   - Ajuste as seguintes configurações conforme seu ambiente:
     ```javascript
     const connection = mysql.createPool({
         host: 'localhost',
         user: 'root',           // Seu usuário MySQL
         password: 'cc20669',    // Sua senha MySQL
         database: 'biblioteca',
         waitForConnections: true,
         connectionLimit: 10,
         queueLimit: 0
     });
     ```

4. Inicie o servidor:
   ```bash
   npm start
   ```
   Ou para desenvolvimento com auto-reload:
   ```bash
   npm run dev
   ```

5. Verifique se o servidor está rodando:
   - Abra seu navegador e acesse: `http://localhost:3000`
   - Você deve ver uma mensagem de boas-vindas da API
   - Teste o health check: `http://localhost:3000/api/health`

### 3. Configurar o Frontend

O frontend é composto por três sistemas independentes:

#### 3.1. Totem de Autoatendimento
- Localização: `sbu/totem/`
- Abra o arquivo `index.html` em um navegador
- Ou use um servidor local:
  ```bash
  # Usando Python 3
  cd sbu/totem
  python -m http.server 8000
  
  # Acesse: http://localhost:8000
  ```

#### 3.2. Sistema do Aluno
- Localização: `sbu/sistema-aluno/`
- Abra o arquivo `index.html` em um navegador
- Ou use um servidor local na porta 8001

#### 3.3. Sistema do Bibliotecário
- Localização: `sbu/sistema-bibliotecario/`
- Abra o arquivo `index.html` em um navegador
- Ou use um servidor local na porta 8002

## Estrutura do Projeto

```
sbu/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── database/        # Configuração do banco
│   │   ├── models/          # Modelos de dados
│   │   └── server.js        # Servidor Express
│   ├── package.json
│   └── script.sql           # Script de criação do banco
├── totem/                   # Interface do totem
├── sistema-aluno/           # Interface do aluno
├── sistema-bibliotecario/   # Interface do bibliotecário
└── docs/                    # Documentação do projeto
```

## Testando o Sistema

### Teste 1: Consultar Livros Disponíveis
```bash
curl http://localhost:3000/api/livros/disponiveis
```

### Teste 2: Buscar Aluno
```bash
curl http://localhost:3000/api/alunos/25009281
```

### Teste 3: Listar Exemplares Disponíveis
```bash
curl http://localhost:3000/api/exemplares/disponiveis
```

### Teste 4: Realizar Empréstimo
```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "raAluno": "25009281",
    "idLivro": 1
  }'
```

### Teste 5: Buscar Empréstimos Ativos
```bash
curl http://localhost:3000/api/emprestimos/ativos/25009281
```

## Dados de Teste

O sistema vem com os seguintes dados pré-cadastrados:

### Alunos
- João Silva (RA: 25009281)
- Maria Santos (RA: 25008024)
- Pedro Costa (RA: 23011884)
- Eliseu Gili (RA: 250099281)
- Lucas Pereira (RA: 22004567)

### Livros e Exemplares
1. **Introdução à Programação** (2 exemplares)
   - EX-001-01 (disponível)
   - EX-001-02 (disponível)

2. **Banco de Dados Relacional** (1 exemplar)
   - EX-002-01 (disponível)

3. **Desenvolvimento Web Moderno** (2 exemplares)
   - EX-003-01 (disponível)
   - EX-003-02 (emprestado)

4. **Algoritmos e Estruturas de Dados** (1 exemplar)
   - EX-004-01 (disponível)

5. **Engenharia de Software** (1 exemplar)
   - EX-005-01 (em manutenção)

### Semestres
- 2025-1 (01/02/2025 - 31/07/2025)
- 2025-2 (01/08/2025 - 20/12/2025)

## Solução de Problemas

### Erro: "Cannot connect to MySQL"
- Verifique se o MySQL está rodando
- Confirme as credenciais em `src/database/connection.js`
- Teste a conexão diretamente: `mysql -u root -p`

### Erro: "Port 3000 already in use"
- Outra aplicação está usando a porta 3000
- Altere a porta em `src/server.js` ou encerre a outra aplicação

### Frontend não conecta ao backend
- Verifique se o backend está rodando em `http://localhost:3000`
- Verifique o console do navegador para erros CORS
- Confirme que a URL da API está correta nos arquivos JS

### Livros não aparecem como disponíveis
- Verifique se existem exemplares cadastrados para o livro
- Confirme que pelo menos um exemplar está com status 'disponivel'
- Execute: `SELECT * FROM exemplar WHERE status = 'disponivel';`

## Suporte

Para problemas ou dúvidas:
1. Verifique a documentação em `docs/`
2. Revise o CHANGELOG.md para mudanças recentes
3. Consulte os logs do servidor backend no terminal

## Próximas Etapas

Após a instalação bem-sucedida:
1. Teste todos os fluxos principais (empréstimo, devolução, consulta)
2. Cadastre novos livros e exemplares através da API
3. Configure os semestres conforme necessário
4. Personalize as interfaces conforme a identidade da sua instituição
