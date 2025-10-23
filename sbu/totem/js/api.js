const API_BASE_URL = 'http://localhost:3000/api';

class BibliotecaAPI {
    // Alunos
    static async buscarAlunoPorRA(ra) {
        const response = await fetch(`${API_BASE_URL}/alunos/ra/${ra}`);
        return await response.json();
    }

    static async cadastrarAluno(alunoData) {
        const response = await fetch(`${API_BASE_URL}/alunos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alunoData)
        });
        return await response.json();
    }

    // Livros
    static async listarLivrosDisponiveis() {
        const response = await fetch(`${API_BASE_URL}/livros/disponiveis`);
        return await response.json();
    }

    static async buscarLivros(termo) {
        const response = await fetch(`${API_BASE_URL}/livros/busca/${termo}`);
        return await response.json();
    }

    // Empréstimos
    static async realizarEmprestimo(emprestimoData) {
        const response = await fetch(`${API_BASE_URL}/emprestimos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emprestimoData)
        });
        return await response.json();
    }

    static async realizarDevolucao(idEmprestimo) {
        const response = await fetch(`${API_BASE_URL}/emprestimos/${idEmprestimo}/devolucao`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    }

    static async listarEmprestimosAtivos(idAluno) {
        const response = await fetch(`${API_BASE_URL}/emprestimos/aluno/${idAluno}/ativos`);
        return await response.json();
    }
}

// Utilitários
function showError(message) { 
    alert(`Erro: ${message}`); 
}

function showSuccess(message) {
    alert(`Sucesso: ${message}`); 
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function navigateTo(url) {
    window.location.href = url;
}