// Configuração da API
const API_BASE_URL = 'http://localhost:3001/api';

let alunoAtual = null;
let livrosSelecionados = [];

// Verificar aluno pelo RA
async function verificarAluno() {
    const ra = document.getElementById('raInput').value.trim();
    const alunoInfoDiv = document.getElementById('alunoInfo');
    
    if (!ra) {
        alert('Por favor, informe o RA.');
        return;
    }
    
    alunoInfoDiv.innerHTML = '<p>Verificando cadastro...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/alunos/${ra}`);
        const data = await response.json();
        
        if (data.success) {
            alunoAtual = data.data;
            alunoInfoDiv.innerHTML = `
                <div style="color: #27ae60;">
                    <h4>Aluno encontrado:</h4>
                    <p><strong>Nome:</strong> ${alunoAtual.nome}</p>
                    <p><strong>RA:</strong> ${alunoAtual.ra}</p>
                </div>
            `;
            
            // Avançar para seleção de livros
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            
            // Carregar livros disponíveis
            carregarLivrosDisponiveis();
            
        } else {
            throw new Error(data.error || 'Aluno não encontrado');
        }
    } catch (error) {
        alunoAtual = null;
        alunoInfoDiv.innerHTML = '<p style="color: #e74c3c;">Erro ao verificar aluno: ' + error.message + '</p>';
    }
}

// Carregar livros disponíveis
async function carregarLivrosDisponiveis() {
    const resultadosDiv = document.getElementById('resultadosLivros');
    resultadosDiv.innerHTML = '<p>Carregando livros disponíveis...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/exemplares/disponiveis`);
        const data = await response.json();
        
        if (data.success) {
            const exemplares = data.data;
            
            // Agrupar exemplares por livro
            const livrosUnicos = {};
            exemplares.forEach(exemplar => {
                const livroId = exemplar.idLivro;
                if (!livrosUnicos[livroId]) {
                    livrosUnicos[livroId] = {
                        id: exemplar.idLivro,
                        titulo: exemplar.livro_titulo,
                        autor: exemplar.autor,
                        editora: exemplar.editora,
                        anoPublicacao: exemplar.anoPublicacao,
                        isbn: exemplar.isbn,
                        exemplares: []
                    };
                }
                livrosUnicos[livroId].exemplares.push(exemplar);
            });
            
            exibirLivros(Object.values(livrosUnicos));
        } else {
            throw new Error(data.error || 'Erro ao carregar livros');
        }
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        resultadosDiv.innerHTML = '<p>Erro ao carregar livros. Tente novamente.</p>';
    }
}

// Pesquisar livros
async function pesquisarLivros() {
    const termo = document.getElementById('searchInput').value.trim();
    const resultadosDiv = document.getElementById('resultadosLivros');
    
    resultadosDiv.innerHTML = '<p>Pesquisando livros...</p>';
    
    try {
        let url = `${API_BASE_URL}/exemplares/disponiveis`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            let exemplares = data.data;
            
            // Filtrar por termo se fornecido
            if (termo) {
                const termoLower = termo.toLowerCase();
                exemplares = exemplares.filter(exemplar => 
                    exemplar.livro_titulo.toLowerCase().includes(termoLower) ||
                    exemplar.autor.toLowerCase().includes(termoLower)
                );
            }
            
            // Agrupar exemplares por livro
            const livrosUnicos = {};
            exemplares.forEach(exemplar => {
                const livroId = exemplar.idLivro;
                if (!livrosUnicos[livroId]) {
                    livrosUnicos[livroId] = {
                        id: exemplar.idLivro,
                        titulo: exemplar.livro_titulo,
                        autor: exemplar.autor,
                        editora: exemplar.editora,
                        anoPublicacao: exemplar.anoPublicacao,
                        isbn: exemplar.isbn,
                        exemplares: []
                    };
                }
                livrosUnicos[livroId].exemplares.push(exemplar);
            });
            
            exibirLivros(Object.values(livrosUnicos));
        } else {
            throw new Error(data.error || 'Erro ao pesquisar livros');
        }
    } catch (error) {
        console.error('Erro ao pesquisar livros:', error);
        resultadosDiv.innerHTML = '<p>Erro ao pesquisar livros. Tente novamente.</p>';
    }
}

// Exibir livros na interface
function exibirLivros(livros) {
    const resultadosDiv = document.getElementById('resultadosLivros');
    
    if (livros.length === 0) {
        resultadosDiv.innerHTML = '<p>Nenhum livro disponível encontrado.</p>';
        return;
    }
    
    resultadosDiv.innerHTML = livros.map(livro => `
        <div class="livro-item" onclick="selecionarLivro(${livro.id})" data-livro='${JSON.stringify(livro)}'>
            <h4>${livro.titulo}</h4>
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>Editora:</strong> ${livro.editora} (${livro.anoPublicacao})</p>
            <p><strong>ISBN:</strong> ${livro.isbn || 'N/A'}</p>
            <p><strong>Exemplares disponíveis:</strong> ${livro.exemplares.length}</p>
            <p><strong>Códigos:</strong> ${livro.exemplares.map(ex => ex.codigo).join(', ')}</p>
            <p><strong>Status:</strong> <span style="color: #27ae60;">Disponível</span></p>
        </div>
    `).join('');
}

// Selecionar livro
function selecionarLivro(livroId) {
    const livroItem = event.target.closest('.livro-item');
    const livroData = JSON.parse(livroItem.getAttribute('data-livro'));
    
    // Verificar se já foi selecionado
    if (livrosSelecionados.find(l => l.id === livroId)) {
        alert('Este livro já foi selecionado.');
        return;
    }
    
    // Adicionar à lista de selecionados
    livrosSelecionados.push({
        ...livroData,
        exemplarSelecionado: livroData.exemplares[0]
    });
    
    atualizarListaSelecionados();
    
    // Mostrar seção de livros selecionados
    document.getElementById('livrosSelecionados').style.display = 'block';
}

// Atualizar lista de livros selecionados
function atualizarListaSelecionados() {
    const listaDiv = document.getElementById('listaSelecionados');
    
    listaDiv.innerHTML = livrosSelecionados.map((livro, index) => `
        <div class="livro-selecionado">
            <div class="livro-info">
                <h4>${livro.titulo}</h4>
                <p><strong>Exemplar:</strong> ${livro.exemplarSelecionado.codigo}</p>
            </div>
            <button onclick="removerLivro(${index})" class="btn-remove">Remover</button>
        </div>
    `).join('');
}

// Remover livro da seleção
function removerLivro(index) {
    livrosSelecionados.splice(index, 1);
    atualizarListaSelecionados();
    
    if (livrosSelecionados.length === 0) {
        document.getElementById('livrosSelecionados').style.display = 'none';
    }
}

// Confirmar empréstimo
async function confirmarEmprestimo() {
    if (livrosSelecionados.length === 0) {
        alert('Selecione pelo menos um livro para empréstimo.');
        return;
    }
    
    try {
        const emprestimosPromises = livrosSelecionados.map(livro => 
            fetch(`${API_BASE_URL}/emprestimos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    raAluno: alunoAtual.ra,
                    idExemplar: livro.exemplarSelecionado.id
                })
            }).then(res => res.json())
        );
        
        const resultados = await Promise.all(emprestimosPromises);
        
        // Verificar se todos os empréstimos foram realizados com sucesso
        const emprestimosComErro = resultados.filter(result => !result.success);
        if (emprestimosComErro.length > 0) {
            console.warn('Alguns empréstimos falharam:', emprestimosComErro);
        }
        
        // Preencher detalhes do empréstimo
        const detalhesDiv = document.getElementById('detalhesEmprestimo');
        detalhesDiv.innerHTML = `
            <p><strong>Aluno:</strong> ${alunoAtual.nome} (${alunoAtual.ra})</p>
            <p><strong>Livros emprestados:</strong></p>
            <ul>
                ${livrosSelecionados.map(livro => 
                    `<li>${livro.titulo} (${livro.exemplarSelecionado.codigo})</li>`
                ).join('')}
            </ul>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        `;
        
        // Avançar para confirmação
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step3').classList.add('active');
        
    } catch (error) {
        console.error('Erro ao realizar empréstimo:', error);
        alert('Erro ao realizar empréstimo: ' + error.message);
    }
}

// Novo empréstimo
function novoEmprestimo() {
    // Resetar variáveis
    alunoAtual = null;
    livrosSelecionados = [];
    
    // Resetar formulários
    document.getElementById('raInput').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('alunoInfo').innerHTML = '';
    document.getElementById('resultadosLivros').innerHTML = '';
    document.getElementById('livrosSelecionados').style.display = 'none';
    
    // Voltar para o primeiro passo
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step1').classList.add('active');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Buscar livros ao pressionar Enter
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            pesquisarLivros();
        }
    });
});