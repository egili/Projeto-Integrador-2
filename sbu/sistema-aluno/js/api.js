// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Navegação entre páginas
function navigateTo(page) {
    window.location.href = page;
}

// Formatação de datas
function formatarData(data) {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// API functions
const api = {
    // Alunos
    buscarAluno: async (ra) => {
        try {
            const response = await fetch(`${API_BASE_URL}/alunos/${ra}`);
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Aluno não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar aluno:', error);
            throw error;
        }
    },

    cadastrarAluno: async (aluno) => {
        try {
            const response = await fetch(`${API_BASE_URL}/alunos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(aluno)
            });
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Erro ao cadastrar aluno');
            }
        } catch (error) {
            console.error('Erro ao cadastrar aluno:', error);
            throw error;
        }
    },

    // Livros
    buscarLivrosDisponiveis: async (termo = '') => {
        try {
            let url = `${API_BASE_URL}/livros/disponiveis`;
            if (termo) {
                url = `${API_BASE_URL}/livros?titulo=${encodeURIComponent(termo)}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Erro ao buscar livros');
            }
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
            throw error;
        }
    },

    // Classificação
    obterClassificacao: async (ra) => {
        try {
            const response = await fetch(`${API_BASE_URL}/classificacao/${ra}`);
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Erro ao obter classificação');
            }
        } catch (error) {
            console.error('Erro ao obter classificação:', error);
            throw error;
        }
    }
};
