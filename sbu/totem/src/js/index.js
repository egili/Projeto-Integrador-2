// Funções comuns para o Totem de autoatendimento

// Navegação entre páginas
function navigateTo(page) {
    window.location.href = page;
}

// Formatação de datas
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calcula prazo de devolução (7 dias a partir de hoje)
function calcularPrazoDevolucao() {
    const prazo = new Date();
    prazo.setDate(prazo.getDate() + 7);
    return prazo;
}

// Gera código aleatório para comprovantes
function gerarCodigoComprovante() {
    return 'EMP' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 3).toUpperCase();
}

// Simulação de API - Em um sistema real, isso seria substituído por chamadas HTTP
const mockAPI = {
    // Buscar aluno por RA
    buscarAluno: async (ra) => {
        // Simulação de delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const alunos = [
            { ra: '25009281', nome: 'Eliseu Pereira Gili', email: 'eliseu.gili@example.com', curso: 'Sistemas de Informação' },
            { ra: '25008024', nome: 'Eduardo Fagundes da Silva', email: 'eduardo.silva@example.com', curso: 'Sistemas de Informação' },
            { ra: '23011884', nome: 'Kaue Rodrigues Seixas', email: 'kaue.seixas@example.com', curso: 'Sistemas de Informação' },
            { ra: '25002731', nome: 'Lucas Athanasio Bueno de Andrade', email: 'lucas.andrade@example.com', curso: 'Sistemas de Informação' },
            { ra: '25002436', nome: 'Pietra Façanha Bortolatto', email: 'pietra.bortolatto@example.com', curso: 'Sistemas de Informação' }
        ];
        
        return alunos.find(aluno => aluno.ra === ra) || null;
    },

    // Buscar livros disponíveis
    buscarLivrosDisponiveis: async (termo = '') => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const livros = [
            { id: 1, titulo: 'Introdução à Programação', autor: 'João Silva', editora: 'Tecnologia Press', ano: 2023, disponivel: true },
            { id: 2, titulo: 'Banco de Dados Relacional', autor: 'Maria Santos', editora: 'Data Books', ano: 2022, disponivel: true },
            { id: 3, titulo: 'Desenvolvimento Web Moderno', autor: 'Pedro Costa', editora: 'Web Publishing', ano: 2024, disponivel: true },
            { id: 4, titulo: 'Algoritmos e Estruturas de Dados', autor: 'Ana Oliveira', editora: 'Computação Ltda', ano: 2023, disponivel: true },
            { id: 5, titulo: 'Engenharia de Software', autor: 'Carlos Mendes', editora: 'SoftPress', ano: 2022, disponivel: true }
        ];

        if (termo) {
            const termoLower = termo.toLowerCase();
            return livros.filter(livro => 
                livro.titulo.toLowerCase().includes(termoLower) ||
                livro.autor.toLowerCase().includes(termoLower)
            );
        }
        
        return livros;
    },

    // Buscar empréstimos ativos do aluno
    buscarEmprestimosAtivos: async (ra) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const emprestimos = [
            { 
                id: 101, 
                livroId: 1, 
                livroTitulo: 'Introdução à Programação', 
                livroAutor: 'João Silva',
                dataEmprestimo: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
                prazoDevolucao: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 dias no futuro
            },
            { 
                id: 102, 
                livroId: 3, 
                livroTitulo: 'Desenvolvimento Web Moderno', 
                livroAutor: 'Pedro Costa',
                dataEmprestimo: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
                prazoDevolucao: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) // 6 dias no futuro
            }
        ];

        // Simulação - retorna apenas alguns empréstimos para RAs específicos
        if (ra === '25009281') {
            return emprestimos;
        }
        
        return [];
    },

    // Registrar empréstimo
    registrarEmprestimo: async (ra, livroId) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
            success: true,
            codigo: gerarCodigoComprovante(),
            dataRetirada: new Date(),
            prazoDevolucao: calcularPrazoDevolucao()
        };
    },

    // Registrar devolução
    registrarDevolucao: async (emprestimoId) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
            success: true,
            codigo: 'DEV' + Date.now().toString().slice(-8),
            dataDevolucao: new Date(),
            classificacaoAtual: 'Leitor Ativo',
            livrosLidosSemestre: 15
        };
    }
};

// Funções de impressão (simuladas)
function imprimirComprovante() {
    alert('Funcionalidade de impressão seria implementada aqui. Em um ambiente real, isso acionaria a impressora do totem.');
    // window.print(); // Para imprimir a página atual
}

function imprimirComprovanteDevolucao() {
    alert('Funcionalidade de impressão seria implementada aqui. Em um ambiente real, isso acionaria a impressora do totem.');
    // window.print(); // Para imprimir a página atual
}