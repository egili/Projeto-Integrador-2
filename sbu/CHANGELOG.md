# Changelog - Sistema de Biblioteca Universitária

## Versão 2.0.0 - Implementação do Sistema de Exemplares

### Mudanças Principais

#### 1. Estrutura do Banco de Dados
- **Adicionada tabela `exemplar`**: Agora cada livro pode ter múltiplos exemplares (cópias físicas)
  - Campos: `id`, `idLivro`, `codigo`, `status`, `observacoes`, `data_aquisicao`
  - Status possíveis: 'disponivel', 'emprestado', 'manutencao'
  - Cada exemplar tem um código único para identificação

- **Modificada tabela `emprestimo`**: 
  - Alterado de `idLivro` para `idExemplar`
  - Agora empréstimos são vinculados a exemplares específicos, não apenas ao livro

#### 2. Backend - Novos Recursos

##### Novo Model: Exemplar
- `models/exemplar.js` - Gerenciamento completo de exemplares
- Métodos disponíveis:
  - `criar()` - Cadastra novo exemplar
  - `buscarPorId()` - Busca exemplar por ID
  - `buscarPorCodigo()` - Busca exemplar pelo código único
  - `listarPorLivro()` - Lista todos exemplares de um livro
  - `listarDisponiveis()` - Lista apenas exemplares disponíveis
  - `atualizarStatus()` - Atualiza status do exemplar
  - `contarDisponiveisPorLivro()` - Conta exemplares disponíveis

##### Controller Atualizado: Emprestimo
- Agora trabalha com exemplares em vez de livros diretamente
- Ao realizar empréstimo sem especificar exemplar, busca automaticamente um disponível
- Atualiza status do exemplar automaticamente (disponivel ↔ emprestado)
- Suporte para emprestar por `idLivro` (busca exemplar disponível) ou `idExemplar` (específico)

##### Model Atualizado: Livro
- Todas as consultas agora incluem contagem de exemplares:
  - `exemplares_disponiveis` - Quantidade de exemplares disponíveis
  - `total_exemplares` - Total de exemplares do livro
- Livros só aparecem como disponíveis se tiverem pelo menos um exemplar disponível

##### Novos Endpoints da API

**Exemplares:**
- `POST /api/exemplares` - Cadastra novo exemplar
- `GET /api/exemplares/disponiveis` - Lista exemplares disponíveis
- `GET /api/exemplares/livro/:idLivro` - Lista exemplares de um livro específico
- `GET /api/exemplares/codigo/:codigo` - Busca exemplar por código
- `GET /api/exemplares/:id` - Busca exemplar por ID
- `PUT /api/exemplares/:id` - Atualiza exemplar
- `DELETE /api/exemplares/:id` - Remove exemplar

**Empréstimos (modificados):**
- `POST /api/emprestimos` - Agora aceita `idLivro` ou `idExemplar`
  - Se `idLivro`: sistema busca exemplar disponível automaticamente
  - Se `idExemplar`: empresta exemplar específico
- `POST /api/emprestimos/devolucao` - Atualiza status do exemplar na devolução

#### 3. Frontend - Atualizações

##### Sistema de Aluno
- **consulta_livros.js**: Agora mostra quantidade de exemplares disponíveis
- **pontuacao_leitor.js**: Integrado com API real (antes era mock)
- Novo arquivo `api.js` com funções para comunicação com backend

##### Totem de Autoatendimento
- **API atualizada** em `totem/js/index.js`:
  - Suporte para trabalhar com exemplares
  - Novos métodos: `buscarExemplaresPorLivro()`, `buscarExemplarPorCodigo()`, etc.
  - Empréstimos agora informam código do exemplar emprestado

- **Tela de devolução** atualizada:
  - Exibe código do exemplar junto com informações do livro
  - Mostra histórico completo de empréstimos com códigos dos exemplares

### Dados de Exemplo

O sistema vem com 7 exemplares pré-cadastrados:
- Livro 1 (Introdução à Programação): 2 exemplares (EX-001-01, EX-001-02)
- Livro 2 (Banco de Dados): 1 exemplar (EX-002-01)
- Livro 3 (Desenvolvimento Web): 2 exemplares (EX-003-01, EX-003-02)
- Livro 4 (Algoritmos): 1 exemplar (EX-004-01)
- Livro 5 (Engenharia de Software): 1 exemplar (EX-005-01) - em manutenção

### Migração de Dados

**IMPORTANTE**: Esta versão requer recriação do banco de dados devido às mudanças estruturais.

Para atualizar:
1. Execute o script `backend/script.sql` completo
2. Isso recriará todas as tabelas com a nova estrutura
3. Dados de exemplo serão inseridos automaticamente

### Compatibilidade

- Versão anterior de empréstimos (baseados em livros) não é compatível
- É necessário limpar e recriar o banco de dados
- Frontend totalmente compatível com novo backend

### Próximos Passos Recomendados

1. Implementar interface no sistema do bibliotecário para gerenciar exemplares
2. Adicionar relatórios de disponibilidade por exemplar
3. Implementar sistema de reserva de livros
4. Adicionar rastreamento de histórico por exemplar individual

---

**Data da Atualização**: 2025-10-23
**Responsável**: Sistema automatizado de correção
