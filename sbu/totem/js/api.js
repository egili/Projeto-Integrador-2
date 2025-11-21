const getApiBaseUrl = () => {
    const { origin } = window.location;
    return `${origin}/api`;
};

const API_BASE_URL = getApiBaseUrl();

class BibliotecaAPI {
    static async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const mensagem = errorData?.error || `Erro HTTP: ${response.status}`;
            throw new Error(mensagem);
        }
        return await response.json();
    }

    static async listarLivrosDisponiveis() {
        const response = await fetch(`${API_BASE_URL}/livros/disponiveis`);
        return await this.handleResponse(response);
    }

    static async buscarLivros(termo) {
        const params = new URLSearchParams({
            q: termo,
            titulo: termo,
            autor: termo
        });

        let response = await fetch(`${API_BASE_URL}/livros/busca?${params.toString()}`);

        if (!response.ok) {
            const fallbackParams = new URLSearchParams({ titulo: termo });
            response = await fetch(`${API_BASE_URL}/livros/busca?${fallbackParams.toString()}`);
        }

        return await this.handleResponse(response);
    }

    static async listarExemplaresDisponiveisPorLivro(idLivro) {
        const response = await fetch(`${API_BASE_URL}/exemplares/livro/${idLivro}/disponiveis`);
        return await this.handleResponse(response);
    }

    static async buscarAlunoPorRA(ra) {
        const response = await fetch(`${API_BASE_URL}/alunos/ra/${encodeURIComponent(ra)}`);
        return await this.handleResponse(response);
    }

    static async cadastrarAluno(dadosAluno) {
        const response = await fetch(`${API_BASE_URL}/alunos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAluno)
        });
        return await this.handleResponse(response);
    }

    static async registrarEmprestimo(dadosEmprestimo) {
        const response = await fetch(`${API_BASE_URL}/emprestimos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosEmprestimo)
        });
        return await this.handleResponse(response);
    }

    static async listarEmprestimosAluno(ra) {
        const response = await fetch(`${API_BASE_URL}/emprestimos/aluno/${encodeURIComponent(ra)}`);
        return await this.handleResponse(response);
    }

    static async registrarDevolucao(idEmprestimo) {
        const response = await fetch(`${API_BASE_URL}/emprestimos/${idEmprestimo}/devolver`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        return await this.handleResponse(response);
    }

    static async obterClassificacaoAluno(ra) {
        const response = await fetch(`${API_BASE_URL}/classificacao/aluno/${encodeURIComponent(ra)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const mensagem = errorData?.error || 'Não foi possível obter a classificação.';
            throw new Error(mensagem);
        }

        return await response.json();
    }
}

function showError(message) {
    console.error(message);
    alert(message);
}

function showSuccess(message) {
    console.log(message);
    alert(message);
}

function formatDateTime(value) {
    if (!value) {
        return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(value) {
    if (!value) {
        return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString('pt-BR');
}

window.BibliotecaAPI = BibliotecaAPI;
window.showError = showError;
window.showSuccess = showSuccess;
window.formatDateTime = formatDateTime;
window.formatDate = formatDate;

