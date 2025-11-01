// Detectar a porta correta baseada na URL atual
const getApiBaseUrl = () => {
    const port = window.location.port || '3000';
    return `http://localhost:${port}/api`;
};
const API_BASE_URL = getApiBaseUrl();

class BibliotecaAPI {
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

    static async listarLivrosDisponiveis() {
        const response = await fetch(`${API_BASE_URL}/livros/disponiveis`);
        return await response.json();
    }

    static async buscarLivros(termo) {
        const response = await fetch(`${API_BASE_URL}/livros/busca?titulo=${encodeURIComponent(termo)}`);
        return await response.json();
    }

    static async buscarExemplarPorCodigo(codigo) {
        const response = await fetch(`${API_BASE_URL}/exemplares/codigo/${codigo}`);
        return await response.json();
    }

    static async realizarEmprestimo(emprestimoData) {
        const response = await fetch(`${API_BASE_URL}/emprestimos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emprestimoData)
        });
        return await response.json();
    }

    static async realizarDevolucao(idEmprestimo) {
        const response = await fetch(`${API_BASE_URL}/emprestimos/${idEmprestimo}/devolver`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    }

    static async listarEmprestimosAtivos(ra) {
        const response = await fetch(`${API_BASE_URL}/emprestimos/aluno/${ra}`);
        return await response.json();
    }
}

// Funções Utilitárias
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