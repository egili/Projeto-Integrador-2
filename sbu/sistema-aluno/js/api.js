const API_BASE_URL = 'http://localhost:3000/api';

class BibliotecaAPI {
    // Alunos
    static async cadastrarAluno(alunoData) {
        const response = await fetch(`${API_BASE_URL}/alunos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alunoData)
        });
        return await response.json();
    }

    static async buscarAlunoPorRA(ra) {
        const response = await fetch(`${API_BASE_URL}/alunos/ra/${ra}`);
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

    // Classificação
    static async obterClassificacaoAluno(idAluno) {
        const response = await fetch(`${API_BASE_URL}/classificacao/aluno/${idAluno}`);
        return await response.json();
    }

    static async obterClassificacaoGeral() {
        const response = await fetch(`${API_BASE_URL}/classificacao/geral`);
        return await response.json();
    }
}

// Utilitários
function showError(message) {
    console.error('Erro:', message);
    alert(`Erro: ${message}`);
}

function showSuccess(message) {
    console.log('Sucesso:', message);
    alert(`Sucesso: ${message}`);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function navigateTo(url) {
    window.location.href = url;
}