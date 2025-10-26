const API_BASE_URL = 'http://localhost:3000/api';

class BibliotecaAPI {
    // Método auxiliar para tratar erros HTTP
    static async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro ao processar resposta' }));
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
        return await response.json();
    }

    // Alunos
    static async cadastrarAluno(alunoData) {
        const response = await fetch(`${API_BASE_URL}/alunos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alunoData)
        });
        return await this.handleResponse(response);
    }

    static async buscarAlunoPorRA(ra) {
        const response = await fetch(`${API_BASE_URL}/alunos/ra/${ra}`);
        return await this.handleResponse(response);
    }

    // Livros
    static async listarLivrosDisponiveis() {
        const response = await fetch(`${API_BASE_URL}/livros/disponiveis`);
        return await this.handleResponse(response);
    }

    static async buscarLivros(termo) {
        const response = await fetch(`${API_BASE_URL}/livros/busca?titulo=${encodeURIComponent(termo)}`);
        return await this.handleResponse(response);
    }

    // Classificação
    static async obterClassificacaoAluno(ra) {
        const response = await fetch(`${API_BASE_URL}/classificacao/aluno/${ra}`);
        return await this.handleResponse(response);
    }

    static async obterClassificacaoGeral() {
        const response = await fetch(`${API_BASE_URL}/classificacao/geral`);
        return await this.handleResponse(response);
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
