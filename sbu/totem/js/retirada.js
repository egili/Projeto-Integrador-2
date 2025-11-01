let livroSelecionado = null;
let alunoEncontrado = null;

async function pesquisarLivros() {
    const termo = document.getElementById('searchInput').value;
    
    if (!termo) {
        showError('Digite um termo para pesquisa');
        return;
    }

    try {
        const result = await BibliotecaAPI.buscarLivros(termo);
        
        if (result.success) {
            exibirResultados(result.data);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Erro ao buscar livros: ' + error.message);
    }
}

function exibirResultados(livros) {
    const container = document.getElementById('resultadosLivros');
    
    if (livros.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum livro encontrado</p>';
        return;
    }

    // Filtrar apenas livros com exemplares disponíveis
    const livrosDisponiveis = livros.filter(livro => livro.exemplares_disponiveis > 0);

    if (livrosDisponiveis.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum exemplar disponível para os livros encontrados</p>';
        return;
    }

    container.innerHTML = livrosDisponiveis.map(livro => `
        <div class="livro-item" onclick="selecionarLivro(${JSON.stringify(livro).replace(/"/g, '&quot;')})">
            <h3>${livro.titulo}</h3>
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>Editora:</strong> ${livro.editora}</p>
            <p><strong>Ano:</strong> ${livro.anoPublicacao}</p>
            <p><strong>Exemplares disponíveis:</strong> ${livro.exemplares_disponiveis}</p>
        </div>
    `).join('');
}

function selecionarLivro(livro) {
    livroSelecionado = livro;
    document.getElementById('livroSelecionadoInfo').innerHTML = `
        <strong>${livro.titulo}</strong> - ${livro.autor}
    `;
    
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
}

async function verificarAluno() {
    const ra = document.getElementById('raInput').value;
    
    if (!ra) {
        showError('Digite o RA do aluno');
        return;
    }

    try {
        const result = await BibliotecaAPI.buscarAlunoPorRA(ra);
        
        if (result.success) {
            alunoEncontrado = result.data;
            document.getElementById('alunoInfo').innerHTML = `
                <div class="aluno-encontrado">
                    <p><strong>Aluno:</strong> ${result.data.nome}</p>
                    <p><strong>RA:</strong> ${result.data.ra}</p>
                </div>
            `;
            document.getElementById('cadastroSection').style.display = 'none';
            
            // Avançar para confirmação
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.add('active');
            
            // Preencher dados de confirmação
            document.getElementById('confirmaLivroTitulo').textContent = livroSelecionado.titulo;
            document.getElementById('confirmaAlunoNome').textContent = result.data.nome;
            document.getElementById('confirmaAlunoRA').textContent = result.data.ra;
            document.getElementById('dataRetirada').textContent = new Date().toLocaleDateString('pt-BR');
            
        } else {
            alunoEncontrado = null;
            document.getElementById('alunoInfo').innerHTML = '';
            document.getElementById('cadastroSection').style.display = 'block';
        }
    } catch (error) {
        showError('Erro ao verificar aluno: ' + error.message);
    }
}

async function confirmarEmprestimo() {
    if (!alunoEncontrado || !livroSelecionado) {
        showError('Dados incompletos para realizar empréstimo');
        return;
    }

    // Buscar um exemplar disponível do livro
    try {
        const port = window.location.port || '3000';
        const exemplares = await fetch(`http://localhost:${port}/api/exemplares/livro/${livroSelecionado.id}`).then(r => r.json());
        
        if (!exemplares.success || exemplares.data.length === 0) {
            showError('Nenhum exemplar disponível para este livro');
            return;
        }

        // Pegar o primeiro exemplar disponível
        const exemplarDisponivel = exemplares.data.find(ex => ex.status === 'disponivel');
        
        if (!exemplarDisponivel) {
            showError('Nenhum exemplar disponível para este livro');
            return;
        }

        const emprestimoData = {
            ra: alunoEncontrado.ra,
            codigoExemplar: exemplarDisponivel.codigo
        };

        const result = await BibliotecaAPI.realizarEmprestimo(emprestimoData);
        
        if (result.success) {
            document.getElementById('step3').classList.remove('active');
            document.getElementById('step4').classList.add('active');
            
            document.getElementById('sucessoLivro').textContent = livroSelecionado.titulo;
            document.getElementById('sucessoAluno').textContent = alunoEncontrado.nome;
            document.getElementById('sucessoData').textContent = new Date().toLocaleDateString('pt-BR');
            document.getElementById('sucessoExemplar').textContent = exemplarDisponivel.codigo;
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Erro ao realizar empréstimo: ' + error.message);
    }
}

function voltarParaPesquisa() {
    livroSelecionado = null;
    alunoEncontrado = null;
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step4').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    
    document.getElementById('searchInput').value = '';
    document.getElementById('raInput').value = '';
    document.getElementById('alunoInfo').innerHTML = '';
    document.getElementById('cadastroSection').style.display = 'none';
}