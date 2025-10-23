// Variáveis globais
let livrosDisponiveis = [];
let exemplaresDisponiveis = [];
let livroSelecionado = null;
let exemplarSelecionado = null;
let alunoSelecionado = null;

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const raInput = document.getElementById('raInput');

    // Event listeners
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            pesquisarLivros();
        }
    });

    raInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verificarAluno();
        }
    });
});

// Pesquisar livros
async function pesquisarLivros() {
    const termo = document.getElementById('searchInput').value.trim();
    const resultadosDiv = document.getElementById('resultadosLivros');
    
    resultadosDiv.innerHTML = '<p>Pesquisando livros...</p>';
    
    try {
        livrosDisponiveis = await api.buscarLivrosDisponiveis(termo);
        exibirResultadosLivros();
    } catch (error) {
        console.error('Erro ao pesquisar livros:', error);
        resultadosDiv.innerHTML = '<p>Erro ao pesquisar livros. Tente novamente.</p>';
    }
}

// Exibir resultados dos livros
function exibirResultadosLivros() {
    const resultadosDiv = document.getElementById('resultadosLivros');
    
    if (livrosDisponiveis.length === 0) {
        resultadosDiv.innerHTML = '<p>Nenhum livro encontrado.</p>';
        return;
    }
    
    resultadosDiv.innerHTML = '';
    
    livrosDisponiveis.forEach(livro => {
        const livroDiv = document.createElement('div');
        livroDiv.className = 'livro-item';
        livroDiv.innerHTML = `
            <div class="livro-info">
                <h3>${livro.titulo}</h3>
                <p><strong>Autor:</strong> ${livro.autor}</p>
                <p><strong>Editora:</strong> ${livro.editora}</p>
                <p><strong>Ano:</strong> ${livro.anoPublicacao}</p>
                <p><strong>Exemplares disponíveis:</strong> ${livro.totalExemplares || 0}</p>
            </div>
            <button onclick="selecionarLivro(${livro.id})" class="btn-primary">Selecionar</button>
        `;
        resultadosDiv.appendChild(livroDiv);
    });
}

// Selecionar livro
async function selecionarLivro(idLivro) {
    livroSelecionado = livrosDisponiveis.find(l => l.id === idLivro);
    
    if (!livroSelecionado) {
        alert('Livro não encontrado.');
        return;
    }
    
    // Atualizar informações do livro selecionado
    document.getElementById('livroSelecionadoInfo').innerHTML = `
        <strong>${livroSelecionado.titulo}</strong><br>
        Autor: ${livroSelecionado.autor}<br>
        Editora: ${livroSelecionado.editora}
    `;
    
    // Carregar exemplares disponíveis
    await carregarExemplares(idLivro);
    
    // Avançar para o próximo passo
    mostrarPasso(2);
}

// Carregar exemplares disponíveis
async function carregarExemplares(idLivro) {
    const exemplaresList = document.getElementById('exemplaresList');
    exemplaresList.innerHTML = '<p>Carregando exemplares...</p>';
    
    try {
        exemplaresDisponiveis = await api.buscarExemplaresDisponiveis(idLivro);
        exibirExemplares();
    } catch (error) {
        console.error('Erro ao carregar exemplares:', error);
        exemplaresList.innerHTML = '<p>Erro ao carregar exemplares.</p>';
    }
}

// Exibir exemplares
function exibirExemplares() {
    const exemplaresList = document.getElementById('exemplaresList');
    
    if (exemplaresDisponiveis.length === 0) {
        exemplaresList.innerHTML = '<p>Nenhum exemplar disponível para este livro.</p>';
        return;
    }
    
    exemplaresList.innerHTML = '';
    
    exemplaresDisponiveis.forEach(exemplar => {
        const exemplarDiv = document.createElement('div');
        exemplarDiv.className = 'exemplar-item';
        exemplarDiv.innerHTML = `
            <div class="exemplar-info">
                <h4>Código: ${exemplar.codigo}</h4>
                <p><strong>Status:</strong> ${exemplar.status}</p>
                ${exemplar.observacoes ? `<p><strong>Observações:</strong> ${exemplar.observacoes}</p>` : ''}
            </div>
            <button onclick="selecionarExemplar(${exemplar.id})" class="btn-primary">Selecionar</button>
        `;
        exemplaresList.appendChild(exemplarDiv);
    });
}

// Selecionar exemplar
function selecionarExemplar(idExemplar) {
    exemplarSelecionado = exemplaresDisponiveis.find(e => e.id === idExemplar);
    
    if (!exemplarSelecionado) {
        alert('Exemplar não encontrado.');
        return;
    }
    
    // Atualizar informações do exemplar selecionado
    document.getElementById('exemplarSelecionadoInfo').innerHTML = `
        <strong>Código:</strong> ${exemplarSelecionado.codigo}<br>
        <strong>Livro:</strong> ${exemplarSelecionado.livro_titulo}<br>
        <strong>Autor:</strong> ${exemplarSelecionado.autor}
    `;
    
    // Avançar para o próximo passo
    mostrarPasso(3);
}

// Verificar aluno
async function verificarAluno() {
    const ra = document.getElementById('raInput').value.trim();
    const alunoInfo = document.getElementById('alunoInfo');
    const cadastroSection = document.getElementById('cadastroSection');
    
    if (!ra) {
        alert('Por favor, informe seu RA.');
        return;
    }
    
    alunoInfo.innerHTML = '<p>Verificando cadastro...</p>';
    cadastroSection.style.display = 'none';
    
    try {
        alunoSelecionado = await api.buscarAluno(ra);
        
        alunoInfo.innerHTML = `
            <div class="aluno-encontrado">
                <h3>Aluno encontrado:</h3>
                <p><strong>Nome:</strong> ${alunoSelecionado.nome}</p>
                <p><strong>RA:</strong> ${alunoSelecionado.ra}</p>
                <button onclick="avancarParaConfirmacao()" class="btn-primary">Continuar</button>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao verificar aluno:', error);
        alunoInfo.innerHTML = '<p>Aluno não encontrado.</p>';
        cadastroSection.style.display = 'block';
    }
}

// Avançar para confirmação
function avancarParaConfirmacao() {
    if (!livroSelecionado || !exemplarSelecionado || !alunoSelecionado) {
        alert('Dados incompletos. Tente novamente.');
        return;
    }
    
    // Preencher dados de confirmação
    document.getElementById('confirmaLivroTitulo').textContent = livroSelecionado.titulo;
    document.getElementById('confirmaExemplarCodigo').textContent = exemplarSelecionado.codigo;
    document.getElementById('confirmaAlunoNome').textContent = alunoSelecionado.nome;
    document.getElementById('confirmaAlunoRA').textContent = alunoSelecionado.ra;
    document.getElementById('dataRetirada').textContent = formatarData(new Date());
    
    mostrarPasso(4);
}

// Confirmar empréstimo
async function confirmarEmprestimo() {
    if (!livroSelecionado || !exemplarSelecionado || !alunoSelecionado) {
        alert('Dados incompletos. Tente novamente.');
        return;
    }
    
    try {
        const resultado = await api.realizarEmprestimo(alunoSelecionado.ra, exemplarSelecionado.id);
        
        // Preencher dados de sucesso
        document.getElementById('sucessoLivro').textContent = livroSelecionado.titulo;
        document.getElementById('sucessoAluno').textContent = alunoSelecionado.nome;
        document.getElementById('sucessoData').textContent = formatarData(new Date());
        
        mostrarPasso(5);
        
    } catch (error) {
        console.error('Erro ao realizar empréstimo:', error);
        alert('Erro ao realizar empréstimo: ' + error.message);
    }
}

// Mostrar passo específico
function mostrarPasso(numeroPasso) {
    // Ocultar todos os passos
    for (let i = 1; i <= 5; i++) {
        const passo = document.getElementById(`step${i}`);
        if (passo) {
            passo.classList.remove('active');
        }
    }
    
    // Mostrar o passo atual
    const passoAtual = document.getElementById(`step${numeroPasso}`);
    if (passoAtual) {
        passoAtual.classList.add('active');
    }
}

// Voltar para pesquisa
function voltarParaPesquisa() {
    // Limpar dados
    livroSelecionado = null;
    exemplarSelecionado = null;
    alunoSelecionado = null;
    
    // Limpar campos
    document.getElementById('searchInput').value = '';
    document.getElementById('raInput').value = '';
    document.getElementById('resultadosLivros').innerHTML = '';
    document.getElementById('exemplaresList').innerHTML = '';
    document.getElementById('alunoInfo').innerHTML = '';
    document.getElementById('cadastroSection').style.display = 'none';
    
    // Voltar para o primeiro passo
    mostrarPasso(1);
}