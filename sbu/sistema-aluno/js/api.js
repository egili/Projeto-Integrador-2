const getApiBaseUrl = () => {
    const port = window.location.port || '3000';
    return `http://localhost:${port}/api`;
};
const API_BASE_URL = getApiBaseUrl();

class BibliotecaAPI {
    static async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro ao processar resposta' }));
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
        return await response.json();
    }

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

    static async listarLivrosDisponiveis() {
        const response = await fetch(`${API_BASE_URL}/livros/disponiveis`);
        return await this.handleResponse(response);
    }

    static async buscarLivros(termo) {
        const queryParams = new URLSearchParams({
            q: termo,
            titulo: termo,
            autor: termo
        });

        let response = await fetch(`${API_BASE_URL}/livros/busca?${queryParams.toString()}`);

        if (!response.ok) {
            // Fallback para backends que ainda esperam apenas o parâmetro "titulo"
            const fallbackParams = new URLSearchParams({ titulo: termo });
            response = await fetch(`${API_BASE_URL}/livros/busca?${fallbackParams.toString()}`);
        }

        return await this.handleResponse(response);
    }

    static async obterClassificacaoAluno(ra) {
        const url = `${API_BASE_URL}/classificacao/aluno/${encodeURIComponent(ra)}`;
        const response = await fetch(url);

        if (!response.ok) {
            // Tenta extrair a mensagem de erro amigável retornada pela API
            const errorData = await response.json().catch(() => null);
            const mensagem = errorData?.error || 'Classificação indisponível';
            throw new Error(mensagem);
        }

        return await this.handleResponse(response);
    }
}

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
