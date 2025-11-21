function getApiBaseUrl() {
    return "http://localhost:3000/api"; 
}

const API_BASE_URL = getApiBaseUrl();

async function handleResponse(response) {
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erro desconhecido na API");
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
}

class BibliotecaAPI {
    static async cadastrarLivro(livroData) {
        const response = await fetch(`${API_BASE_URL}/livros`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(livroData)
        });
        return await handleResponse(response);
    }

    static async listarTodosLivros() {
        try {
            const response = await fetch(`${API_BASE_URL}/livros`);
            const data = await handleResponse(response);
            console.log('Livros carregados:', data?.data?.length || 0);
            return data?.data || [];
        } catch (error) {
            console.error('Erro ao listar livros:', error);
            throw error;
        }
    }

    static async buscarLivros(termo) {
        try {
            const response = await fetch(`${API_BASE_URL}/livros/busca?titulo=${encodeURIComponent(termo)}`);
            const data = await handleResponse(response);
            return data?.data || [];
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
            throw error;
        }
    }

    static async buscarLivroPorId(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/livros/${id}`);
            const data = await handleResponse(response);
            return data?.data || null; // Retorna o objeto do livro
        } catch (error) {
            console.error(`Erro ao buscar livro ${id}:`, error);
            throw error;
        }
    }
    
    static async atualizarLivro(id, livroData) {
        const response = await fetch(`${API_BASE_URL}/livros/${id}`, {
            method: 'PUT', // Usamos PUT para atualizar um recurso existente
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(livroData)
        });
        return await handleResponse(response);
    }

    static async removerLivroCompleto(id) {
        const response = await fetch(`${API_BASE_URL}/livros/${id}`, {
            method: 'DELETE',
        });
        return await handleResponse(response);
    }

    static async removerExemplar(idExemplar) {
        const response = await fetch(`${API_BASE_URL}/exemplares/${idExemplar}`, {
            method: 'DELETE',
        });
        return await handleResponse(response);
    }

    static async cadastrarExemplar(exemplarData) {
        const response = await fetch(`${API_BASE_URL}/exemplares`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exemplarData)
        });
        return await handleResponse(response);
    }

    static async listarExemplaresPorLivro(idLivro) {
        const response = await fetch(`${API_BASE_URL}/exemplares/livro/${idLivro}`);
        const data = await handleResponse(response);
        return data?.data || [];
    }

    static async listarEmprestimosPendentes() {
        try {
            const response = await fetch(`${API_BASE_URL}/emprestimos/pendentes`);
            const data = await handleResponse(response);
            console.log('Pendentes carregados:', data?.data?.length || 0);
            return data?.data || [];
        } catch (error) {
            console.error('Erro ao carregar pendentes:', error);
            throw error;
        }
    }

    static async listarHistoricoEmprestimos() {
        try {
            const response = await fetch(`${API_BASE_URL}/emprestimos/historico`);
            const data = await handleResponse(response);
            console.log('Histórico carregado:', data?.data?.length || 0);
            return data?.data || [];
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            throw error;
        }
    }

    static async registrarEmprestimo(emprestimoData) {
        const response = await fetch(`${API_BASE_URL}/emprestimos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emprestimoData)
        });
        return await handleResponse(response);
    }

    static async registrarDevolucao(idEmprestimo) {
        const response = await fetch(`${API_BASE_URL}/emprestimos/${idEmprestimo}/devolver`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        return await handleResponse(response);
    }

    static async obterClassificacaoGeral() {
        const response = await fetch(`${API_BASE_URL}/classificacao/geral`);
        const data = await handleResponse(response);
        return data || {};
    }
}

// Funções utilitárias
function showError(message) {
    alert(`Erro: ${message}`);
}

function showSuccess(message) {
    alert(`Sucesso: ${message}`);
}

function formatDate(dateString) {
    if (!dateString) return "—";
    
    try {
        const isoString = dateString.replace(' ', 'T').replace(/\.\d{3}Z$/, ''); 
        const date = new Date(isoString);
        
        if (isNaN(date.getTime())) {
            return "Data inválida";
        }
        
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        console.error('Erro ao formatar data:', error, dateString);
        return "—";
    }
}

function navigateTo(url) {
    window.location.href = url;
}