# Resumo das Correções Implementadas

## Visão Geral

O Sistema de Biblioteca Universitária (SBU) foi totalmente revisado e corrigido para estar de acordo com o esquema de banco de dados fornecido. A principal mudança foi a implementação do sistema de **exemplares**, permitindo que cada livro tenha múltiplas cópias físicas que podem ser gerenciadas independentemente.

## Problema Principal Identificado

O sistema original tinha uma falha fundamental na arquitetura: **empréstimos eram vinculados diretamente aos livros**, não às cópias físicas. Isso impossibilitava:

- Ter múltiplas cópias do mesmo livro
- Rastrear qual cópia específica foi emprestada
- Gerenciar cópias em manutenção
- Controlar disponibilidade real do acervo

## Solução Implementada

### 1. Banco de Dados (script.sql)

#### Tabela Adicionada: `exemplar`
```sql
CREATE TABLE IF NOT EXISTS exemplar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idLivro INT NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('disponivel', 'emprestado', 'manutencao') DEFAULT 'disponivel',
    observacoes TEXT,
    data_aquisicao DATE,
    FOREIGN KEY (idLivro) REFERENCES livro(id) ON DELETE CASCADE
);
```

**Campos:**
- `codigo`: Identificador único do exemplar (ex: "EX-001-01")
- `status`: Estado atual (disponível, emprestado, em manutenção)
- `observacoes`: Anotações sobre o exemplar
- `data_aquisicao`: Data de entrada no acervo

#### Tabela Modificada: `emprestimo`
- **ANTES**: `idLivro INT NOT NULL`
- **DEPOIS**: `idExemplar INT NOT NULL`

Agora cada empréstimo registra qual exemplar específico foi emprestado.

### 2. Backend - Novos Arquivos

#### models/exemplar.js
Novo modelo para gerenciar exemplares com métodos:
- `criar(exemplar)` - Cadastra novo exemplar
- `buscarPorId(id)` - Busca por ID
- `buscarPorCodigo(codigo)` - Busca por código único
- `listarPorLivro(idLivro)` - Lista exemplares de um livro
- `listarDisponiveis()` - Lista só os disponíveis
- `listarDisponiveisPorLivro(idLivro)` - Disponíveis de um livro específico
- `atualizarStatus(id, status)` - Muda status do exemplar
- `atualizar(id, exemplar)` - Atualiza dados completos
- `deletar(id)` - Remove exemplar
- `contarDisponiveisPorLivro(idLivro)` - Conta disponíveis
- `contarTotalPorLivro(idLivro)` - Conta total

#### controllers/exemplarController.js
Novo controller com endpoints:
- `cadastrarExemplar` - POST para criar exemplar
- `listarExemplaresPorLivro` - GET exemplares de um livro
- `listarExemplaresDisponiveis` - GET todos disponíveis
- `buscarExemplarPorCodigo` - GET por código
- `buscarExemplarPorId` - GET por ID
- `atualizarExemplar` - PUT para atualizar
- `deletarExemplar` - DELETE para remover

### 3. Backend - Arquivos Modificados

#### models/emprestimo.js
**Mudanças principais:**
```javascript
// ANTES
static async criar(emprestimo) {
    const { idAluno, idLivro, ... } = emprestimo;
    // ... código usando idLivro
}

// DEPOIS
static async criar(emprestimo) {
    const { idAluno, idExemplar, ... } = emprestimo;
    // ... código usando idExemplar
}
```

- Todas as consultas JOIN agora incluem tabela `exemplar`
- Novo método: `verificarExemplarDisponivel(idExemplar)`
- Novo método: `buscarPorExemplar(idExemplar)`
- Queries retornam `exemplar_codigo` e `exemplar_status`

#### models/livro.js
**Mudanças principais:**
- Todas as queries agora incluem subconsultas para contar exemplares:
  ```sql
  SELECT l.*,
    (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id AND ex.status = 'disponivel') as exemplares_disponiveis,
    (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id) as total_exemplares
  FROM livro l
  ```
- Livros só aparecem como disponíveis se tiverem exemplares disponíveis
- Métodos afetados: `listarDisponiveis()`, `listarTodos()`, `buscarPorId()`, `buscarPorTitulo()`, `buscarPorAutor()`

#### controllers/emprestimoController.js
**Lógica de empréstimo completamente reformulada:**

```javascript
// Agora aceita idLivro OU idExemplar
const { raAluno, idLivro, idExemplar } = req.body;

// Se idExemplar específico
if (idExemplar) {
    exemplar = await Exemplar.buscarPorId(idExemplar);
    // valida se disponível
}
// Se apenas idLivro, busca exemplar disponível automaticamente
else if (idLivro) {
    const exemplaresDisponiveis = await Exemplar.listarDisponiveisPorLivro(idLivro);
    exemplar = exemplaresDisponiveis[0]; // Pega primeiro disponível
}

// Registra empréstimo com idExemplar
// Atualiza status do exemplar para 'emprestado'
```

**Devolução também atualizada:**
```javascript
// Registra devolução
await Emprestimo.registrarDevolucao(idEmprestimo, dataDevolucaoReal);

// Atualiza status do exemplar para 'disponivel'
await Exemplar.atualizarStatus(emprestimo.idExemplar, 'disponivel');
```

#### server.js
**Novos endpoints adicionados:**
```javascript
// Routes - Exemplares
app.post('/api/exemplares', exemplarController.cadastrarExemplar);
app.get('/api/exemplares/disponiveis', exemplarController.listarExemplaresDisponiveis);
app.get('/api/exemplares/livro/:idLivro', exemplarController.listarExemplaresPorLivro);
app.get('/api/exemplares/codigo/:codigo', exemplarController.buscarExemplarPorCodigo);
app.get('/api/exemplares/:id', exemplarController.buscarExemplarPorId);
app.put('/api/exemplares/:id', exemplarController.atualizarExemplar);
app.delete('/api/exemplares/:id', exemplarController.deletarExemplar);
```

### 4. Frontend - Alterações

#### Totem (totem/js/index.js)
**API atualizada:**
```javascript
// Empréstimo agora suporta idLivro ou idExemplar
realizarEmprestimo: async (raAluno, idLivro, idExemplar = null) => {
    const requestBody = { raAluno };
    if (idExemplar) {
        requestBody.idExemplar = idExemplar;
    } else if (idLivro) {
        requestBody.idLivro = idLivro;
    }
    // ... rest of code
}

// Novos métodos adicionados:
buscarExemplaresPorLivro(idLivro)
buscarExemplarPorCodigo(codigo)
listarExemplaresDisponiveis()
cadastrarExemplar(exemplar)
```

#### Totem (totem/js/devolucao.js)
**Exibição de exemplar:**
```javascript
// Agora mostra código do exemplar
<p><strong>Exemplar:</strong> ${emp.exemplar_codigo || 'N/A'}</p>
```

#### Sistema do Aluno - Novo Arquivo (sistema-aluno/js/api.js)
Criado arquivo de API compartilhado para o sistema do aluno, substituindo mocks por chamadas reais à API.

#### Sistema do Aluno (sistema-aluno/js/consulta_livros.js)
**ANTES:** Usava mock API com dados fictícios
**DEPOIS:** Usa API real e mostra disponibilidade:
```javascript
const disponibilidade = livro.exemplares_disponiveis > 0 
    ? `${livro.exemplares_disponiveis} disponível(is)`
    : `Indisponível`;
```

#### Sistema do Aluno (sistema-aluno/js/pontuacao_leitor.js)
**ANTES:** Mock data local
**DEPOIS:** Integração com API real via `api.buscarAluno()` e `api.obterClassificacao()`

#### HTMLs Atualizados
- `sistema-aluno/pages/consulta_livros.html` - Agora carrega `api.js`
- `sistema-aluno/pages/pontuacao_leitor.html` - Agora carrega `api.js`

## Fluxo Completo de Empréstimo (Novo)

### 1. Aluno escolhe livro no totem
```
GET /api/livros/disponiveis
→ Retorna livros com exemplares_disponiveis > 0
```

### 2. Sistema identifica aluno
```
GET /api/alunos/{ra}
→ Valida se aluno existe
```

### 3. Sistema realiza empréstimo
```
POST /api/emprestimos
Body: { raAluno: "25009281", idLivro: 1 }

Backend:
1. Busca aluno
2. Busca exemplares disponíveis do livro
3. Seleciona primeiro exemplar disponível
4. Cria empréstimo com idExemplar
5. Atualiza status do exemplar para 'emprestado'
6. Retorna dados incluindo código do exemplar
```

### 4. Devolução
```
POST /api/emprestimos/devolucao
Body: { idEmprestimo: 123 }

Backend:
1. Busca empréstimo
2. Registra data de devolução
3. Atualiza status do exemplar para 'disponivel'
4. Calcula e atualiza classificação do aluno
5. Retorna confirmação
```

## Dados de Exemplo Incluídos

### 7 Exemplares Cadastrados:
1. **EX-001-01** - Introdução à Programação (disponível)
2. **EX-001-02** - Introdução à Programação (disponível)
3. **EX-002-01** - Banco de Dados (disponível)
4. **EX-003-01** - Desenvolvimento Web (disponível)
5. **EX-003-02** - Desenvolvimento Web (emprestado)
6. **EX-004-01** - Algoritmos (disponível)
7. **EX-005-01** - Engenharia de Software (manutenção)

## Benefícios da Nova Arquitetura

### 1. Controle Real do Acervo
- Cada cópia física tem registro próprio
- Status individual (disponível/emprestado/manutenção)
- Rastreamento completo de cada exemplar

### 2. Escalabilidade
- Adicionar novas cópias não afeta estrutura
- Sistema suporta dezenas de exemplares por livro
- Fácil gerenciamento de grandes acervos

### 3. Relatórios Precisos
- Saber exatamente qual exemplar está onde
- Histórico por exemplar individual
- Estatísticas de uso por cópia

### 4. Manutenção
- Marcar exemplares danificados sem afetar outros
- Observações específicas por cópia
- Data de aquisição para controle de idade

### 5. Flexibilidade
- Emprestar por livro (sistema escolhe exemplar)
- Emprestar exemplar específico (via código)
- Reservar exemplares específicos (futuro)

## Compatibilidade

### ⚠️ Breaking Changes
Esta atualização **NÃO é retrocompatível**. É necessário:

1. **Recriar banco de dados** - Execute script.sql completo
2. **Dados antigos serão perdidos** - Faça backup se necessário
3. **Frontend antigo não funciona** - Use versão atualizada

### ✅ O que NÃO mudou
- Estrutura de alunos
- Estrutura de classificação
- Estrutura de semestres
- Autenticação (ainda a ser implementada)
- Layout das interfaces

## Testes Recomendados

### 1. Teste de Empréstimo
```bash
# Listar livros disponíveis
curl http://localhost:3000/api/livros/disponiveis

# Realizar empréstimo
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"raAluno": "25009281", "idLivro": 1}'

# Verificar empréstimos ativos
curl http://localhost:3000/api/emprestimos/ativos/25009281
```

### 2. Teste de Exemplares
```bash
# Listar todos exemplares disponíveis
curl http://localhost:3000/api/exemplares/disponiveis

# Buscar exemplares de um livro específico
curl http://localhost:3000/api/exemplares/livro/1

# Buscar por código
curl http://localhost:3000/api/exemplares/codigo/EX-001-01
```

### 3. Teste de Devolução
```bash
# Devolver livro
curl -X POST http://localhost:3000/api/emprestimos/devolucao \
  -H "Content-Type: application/json" \
  -d '{"idEmprestimo": 1}'

# Verificar classificação atualizada
curl http://localhost:3000/api/classificacao/25009281
```

## Próximas Melhorias Sugeridas

### Curto Prazo
1. Interface do bibliotecário para gerenciar exemplares
2. Busca avançada por status de exemplar
3. Relatório de exemplares em manutenção
4. Histórico detalhado por exemplar

### Médio Prazo
1. Sistema de reservas
2. Notificações de disponibilidade
3. Fila de espera por livro
4. Renovação online de empréstimos

### Longo Prazo
1. Integração com código de barras
2. App mobile
3. Analytics de uso do acervo
4. Sistema de multas automatizado

## Arquivos Criados

Novos arquivos adicionados ao projeto:
```
/workspace/sbu/
├── backend/src/
│   ├── models/exemplar.js                    [NOVO]
│   └── controllers/exemplarController.js     [NOVO]
├── sistema-aluno/js/api.js                   [NOVO]
├── CHANGELOG.md                              [NOVO]
├── SETUP.md                                  [NOVO]
└── RESUMO_CORRECOES.md                       [NOVO]
```

## Arquivos Modificados

Arquivos alterados no projeto:
```
/workspace/sbu/
├── backend/
│   ├── script.sql                            [MODIFICADO]
│   ├── src/
│   │   ├── server.js                         [MODIFICADO]
│   │   ├── models/
│   │   │   ├── emprestimo.js                 [MODIFICADO]
│   │   │   └── livro.js                      [MODIFICADO]
│   │   └── controllers/
│   │       └── emprestimoController.js       [MODIFICADO]
├── totem/js/
│   ├── index.js                              [MODIFICADO]
│   └── devolucao.js                          [MODIFICADO]
└── sistema-aluno/
    ├── js/
    │   ├── consulta_livros.js                [MODIFICADO]
    │   └── pontuacao_leitor.js               [MODIFICADO]
    └── pages/
        ├── consulta_livros.html              [MODIFICADO]
        └── pontuacao_leitor.html             [MODIFICADO]
```

---

**Data:** 2025-10-23  
**Versão:** 2.0.0  
**Status:** ✅ Implementação Completa
