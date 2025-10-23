const API_BASE_URL = 'http://localhost:3000/api';

class BibliotecaAPI {
    // Livros
    static async cadastrarLivro(livroData) {
        const response = await fetch(`${API_BASE_URL}/livros`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(livroData)
        });
        return await response.json();
    }

    static async listarTodosLivros() {
        const response = await fetch(`${API_BASE_URL}/livros`);
        return await response.json();
    }

    static async buscarLivros(termo) {
        const response = await fetch(`${API_BASE_URL}/livros/busca/${termo}`);
        return await response.json();
    }

    // Exemplares
    static async cadastrarExemplar(exemplarData) {
        const response = await fetch(`${API_BASE_URL}/exemplares`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exemplarData)
        });
        return await response.json();
    }

    static async listarExemplaresPorLivro(idLivro) {
        const response = await fetch(`${API_BASE_URL}/exemplares/livro/${idLivro}`);
        return await response.json();
    }

    // Empréstimos
    static async listarEmprestimosPendentes() {
        const response = await fetch(`${API_BASE_URL}/emprestimos/pendentes`);
        return await response.json();
    }

    static async listarHistoricoEmprestimos() {
        const response = await fetch(`${API_BASE_URL}/emprestimos/historico`);
        return await response.json();
    }

    static async registrarEmprestimo(emprestimoData) {
        const response = await fetch(`${API_BASE_URL}/emprestimos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emprestimoData)
        });
        return await response.json();
    }

    static async registrarDevolucao(idEmprestimo, dataDevolucaoReal) {
        const response = await fetch(`${API_BASE_URL}/emprestimos/${idEmprestimo}/devolver`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataDevolucaoReal })
        });
        return await response.json();
    }

    // Classificação
    static async obterClassificacaoGeral() {
        const response = await fetch(`${API_BASE_URL}/classificacao/geral`);
        return await response.json();
    }
}

function showError(message) { 
    alert(`Erro: ${message}`); 
}

function showSuccess(message) {
    alert(`Sucesso: ${message}`); 
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}