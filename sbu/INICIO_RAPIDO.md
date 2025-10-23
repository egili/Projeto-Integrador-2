# 🚀 Guia de Início Rápido - SBU

## ✅ Sistema Totalmente Corrigido

Todas as correções necessárias foram implementadas de acordo com o esquema do banco de dados fornecido. O sistema agora inclui **gerenciamento completo de exemplares** (cópias físicas dos livros).

## 📋 Pré-requisitos

- ✅ Node.js instalado
- ✅ MySQL instalado e rodando
- ✅ Navegador web

## 🔧 Instalação em 3 Passos

### 1️⃣ Configure o Banco de Dados

```bash
# Execute o script SQL
mysql -u root -p < backend/script.sql

# Ou abra MySQL Workbench e execute o arquivo backend/script.sql
```

**✅ O que foi criado:**
- Banco de dados `biblioteca`
- 8 tabelas (incluindo nova tabela `exemplar`)
- 5 alunos de teste
- 5 livros
- 7 exemplares (cópias dos livros)
- 2 semestres

### 2️⃣ Inicie o Backend

```bash
cd backend

# Instale dependências (primeira vez)
npm install

# IMPORTANTE: Configure as credenciais do MySQL
# Edite: src/database/connection.js
# Altere user e password conforme seu MySQL

# Inicie o servidor
npm start

# Ou com auto-reload para desenvolvimento:
npm run dev
```

**✅ Servidor rodando em:** `http://localhost:3000`

### 3️⃣ Abra o Frontend

**Opção A - Direto no navegador:**
```
Abra os arquivos HTML diretamente:
- totem/index.html
- sistema-aluno/index.html
- sistema-bibliotecario/index.html
```

**Opção B - Com servidor HTTP (recomendado):**
```bash
# Python 3
cd totem
python -m http.server 8000
# Acesse: http://localhost:8000

# Para sistema-aluno (em outro terminal):
cd sistema-aluno
python -m http.server 8001
# Acesse: http://localhost:8001
```

## 🎯 Teste Rápido

### Via API (Backend)

```bash
# 1. Verificar se API está funcionando
curl http://localhost:3000/api/health

# 2. Listar livros disponíveis (com contagem de exemplares)
curl http://localhost:3000/api/livros/disponiveis

# 3. Listar exemplares disponíveis
curl http://localhost:3000/api/exemplares/disponiveis

# 4. Realizar um empréstimo
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"raAluno": "25009281", "idLivro": 1}'

# 5. Verificar empréstimos do aluno
curl http://localhost:3000/api/emprestimos/ativos/25009281
```

### Via Interface (Frontend)

**Totem de Autoatendimento:**
1. Abra `totem/index.html`
2. Clique em "Retirar Livro"
3. Pesquise um livro (ex: "Programação")
4. Selecione o livro
5. Digite RA: `25009281`
6. Confirme o empréstimo

**Sistema do Aluno:**
1. Abra `sistema-aluno/index.html`
2. Clique em "Consultar Livros"
3. Pesquise livros (verá quantidade disponível)
4. Vá em "Pontuação do Leitor"
5. Digite RA: `25009281`
6. Veja a classificação do aluno

## 📊 Dados de Teste Disponíveis

### 👥 Alunos
```
João Silva     - RA: 25009281
Maria Santos   - RA: 25008024
Pedro Costa    - RA: 23011884
Eliseu Gili    - RA: 250099281
Lucas Pereira  - RA: 22004567
```

### 📚 Livros e Exemplares

| Livro | Exemplares | Códigos | Status |
|-------|------------|---------|--------|
| Introdução à Programação | 2 | EX-001-01, EX-001-02 | ✅ Disponíveis |
| Banco de Dados | 1 | EX-002-01 | ✅ Disponível |
| Desenvolvimento Web | 2 | EX-003-01, EX-003-02 | ✅ 1 disponível, 🔴 1 emprestado |
| Algoritmos | 1 | EX-004-01 | ✅ Disponível |
| Engenharia de Software | 1 | EX-005-01 | 🔧 Em manutenção |

### 📅 Semestres
```
2025-1: 01/02/2025 - 31/07/2025 (ATIVO)
2025-2: 01/08/2025 - 20/12/2025
```

## 🎓 Classificação de Leitores

O sistema classifica alunos automaticamente baseado em livros lidos:

| Livros Lidos | Classificação |
|--------------|---------------|
| 0 - 5        | 🌱 Leitor Iniciante |
| 6 - 10       | 📖 Leitor Regular |
| 11 - 20      | 🔥 Leitor Ativo |
| 21+          | 🚀 Leitor Extremo |

## 🆕 Principais Mudanças Implementadas

### ✨ Sistema de Exemplares
Cada livro agora pode ter múltiplas cópias físicas:
- Cada exemplar tem código único (ex: EX-001-01)
- Status individual: disponível, emprestado, manutenção
- Rastreamento completo de qual cópia foi emprestada

### 🔄 Fluxo de Empréstimo Melhorado
```
1. Aluno escolhe livro
2. Sistema busca exemplar disponível automaticamente
3. Registra empréstimo vinculado ao exemplar específico
4. Atualiza status do exemplar para "emprestado"
5. Na devolução, status volta para "disponível"
```

### 📊 Contadores em Tempo Real
Consultas de livros agora mostram:
- ✅ Exemplares disponíveis
- 📚 Total de exemplares
- 🎯 Status real de disponibilidade

## 🔍 Endpoints da API

### Livros
```
GET    /api/livros/disponiveis     # Lista livros com exemplares disponíveis
GET    /api/livros/todos           # Lista todos os livros (com contadores)
GET    /api/livros/:id             # Busca livro específico
GET    /api/livros?titulo=...      # Busca por título
POST   /api/livros                 # Cadastra novo livro
```

### Exemplares (NOVO)
```
GET    /api/exemplares/disponiveis         # Lista exemplares disponíveis
GET    /api/exemplares/livro/:idLivro      # Exemplares de um livro
GET    /api/exemplares/codigo/:codigo      # Busca por código
GET    /api/exemplares/:id                 # Busca por ID
POST   /api/exemplares                     # Cadastra exemplar
PUT    /api/exemplares/:id                 # Atualiza exemplar
DELETE /api/exemplares/:id                 # Remove exemplar
```

### Empréstimos
```
POST   /api/emprestimos                    # Realiza empréstimo (idLivro ou idExemplar)
POST   /api/emprestimos/devolucao          # Registra devolução
GET    /api/emprestimos/ativos/:ra         # Empréstimos ativos do aluno
GET    /api/emprestimos/ativos             # Todos empréstimos ativos
```

### Alunos
```
GET    /api/alunos                 # Lista todos alunos
GET    /api/alunos/:ra             # Busca aluno por RA
POST   /api/alunos                 # Cadastra novo aluno
```

### Classificação
```
GET    /api/classificacao/:ra      # Classificação de um aluno
GET    /api/classificacao          # Classificação geral do semestre
```

## 🐛 Problemas Comuns

### ❌ "Cannot connect to database"
**Solução:** Verifique credenciais em `backend/src/database/connection.js`

### ❌ "Port 3000 already in use"
**Solução:** Outra aplicação está usando a porta. Encerre ou mude a porta em `server.js`

### ❌ Frontend não carrega livros
**Solução:** 
1. Verifique se backend está rodando em `http://localhost:3000`
2. Abra console do navegador (F12) e veja erros
3. Verifique CORS (backend já tem CORS habilitado)

### ❌ "Nenhum livro disponível"
**Solução:** 
1. Execute o script SQL completo
2. Verifique: `SELECT * FROM exemplar WHERE status = 'disponivel';`

## 📚 Documentação Adicional

- 📄 **CHANGELOG.md** - Histórico detalhado de mudanças
- 🔧 **SETUP.md** - Guia completo de instalação
- 📋 **RESUMO_CORRECOES.md** - Documentação técnica das correções

## ✅ Checklist de Verificação

Marque conforme for testando:

- [ ] MySQL rodando
- [ ] Banco de dados criado (`biblioteca`)
- [ ] 8 tabelas criadas (incluindo `exemplar`)
- [ ] Backend iniciado (porta 3000)
- [ ] API respondendo (`/api/health`)
- [ ] Livros listando com contadores de exemplares
- [ ] Exemplares sendo listados
- [ ] Empréstimo funcionando
- [ ] Devolução funcionando
- [ ] Classificação sendo calculada
- [ ] Frontend conectando ao backend

## 🎉 Pronto!

Seu Sistema de Biblioteca Universitária está totalmente funcional e corrigido!

### 💡 Próximos Passos Sugeridos

1. **Cadastre mais livros e exemplares** via API ou crie interface no sistema do bibliotecário
2. **Teste todos os fluxos**: empréstimo → devolução → classificação
3. **Personalize as interfaces** com cores e logo da sua instituição
4. **Implemente autenticação** (não incluída nesta versão)
5. **Adicione relatórios** de uso do sistema

---

**📌 Dúvidas?**
- Consulte os arquivos de documentação na pasta raiz
- Revise o código dos controllers para entender a lógica
- Execute os testes de API com curl para verificar funcionamento

**🎯 Sistema 100% Funcional e de Acordo com o Esquema do Banco de Dados!**
