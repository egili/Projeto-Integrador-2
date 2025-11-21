const retiradaState = {
    livros: [],
    livroSelecionado: null,
    exemplarSelecionado: null,
    aluno: null
};

document.addEventListener('DOMContentLoaded', () => {
    carregarLivrosDisponiveis();
});

async function carregarLivrosDisponiveis() {
    try {
        const resultado = await BibliotecaAPI.listarLivrosDisponiveis();
        if (resultado && resultado.success && Array.isArray(resultado.data)) {
            retiradaState.livros = resultado.data;
            renderizarListaDeLivros(resultado.data, 'Nenhum livro disponível no momento.');
        } else {
            renderizarListaDeLivros([], 'Nenhum livro disponível no momento.');
        }
    } catch (error) {
        renderizarListaDeLivros([], 'Erro ao carregar livros disponíveis.');
        showError(`Erro ao carregar livros: ${error.message}`);
    }
}

async function pesquisarLivros() {
    const termo = document.getElementById('searchInput').value.trim();

    if (!termo) {
        await carregarLivrosDisponiveis();
        return;
    }

    try {
        const resultado = await BibliotecaAPI.buscarLivros(termo);
        if (resultado && resultado.success && Array.isArray(resultado.data)) {
            retiradaState.livros = resultado.data;
            renderizarListaDeLivros(resultado.data, 'Nenhum livro encontrado para sua busca.');
        } else {
            renderizarListaDeLivros([], 'Nenhum livro encontrado para sua busca.');
        }
    } catch (error) {
        renderizarListaDeLivros([], 'Erro ao buscar livros.');
        showError(`Erro ao buscar livros: ${error.message}`);
    }
}

function renderizarListaDeLivros(livros, mensagemVazia) {
    const container = document.getElementById('resultadosLivros');

    if (livros.length === 0) {
        container.innerHTML = `<div class="no-results">${mensagemVazia}</div>`;
        return;
    }

    container.innerHTML = livros.map((livro) => `
        <div class="card livro-card">
            <h3>${livro.titulo}</h3>
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>Editora:</strong> ${livro.editora}</p>
            <p><strong>Ano:</strong> ${livro.anoPublicacao}</p>
            <p><strong>Exemplares disponíveis:</strong> ${livro.exemplares_disponiveis || 0}</p>
            <button class="btn-primary btn-full selecionar-livro" data-id="${livro.id}">
                Selecionar
            </button>
        </div>
    `).join('');

    container.querySelectorAll('.selecionar-livro').forEach((botao) => {
        botao.addEventListener('click', () => {
            const idLivro = botao.getAttribute('data-id');
            const livro = retiradaState.livros.find((item) => String(item.id) === String(idLivro));
            if (livro) {
                selecionarLivro(livro);
            }
        });
    });
}

async function selecionarLivro(livro) {
    try {
        const disponiveis = await BibliotecaAPI.listarExemplaresDisponiveisPorLivro(livro.id);
        const exemplares = disponiveis?.data || [];

        if (exemplares.length === 0) {
            showError('Nenhum exemplar disponível para este livro no momento.');
            return;
        }

        retiradaState.livroSelecionado = livro;
        retiradaState.exemplarSelecionado = exemplares[0];

        document.getElementById('livroSelecionadoInfo').textContent =
            `${livro.titulo} — ${livro.autor} (Exemplar ${retiradaState.exemplarSelecionado.id})`;

        mostrarStep('step2');
    } catch (error) {
        showError(`Erro ao buscar exemplares disponíveis: ${error.message}`);
    }
}

async function verificarAluno() {
    const ra = document.getElementById('raInput').value.trim();

    if (!ra) {
        showError('Informe o RA do aluno.');
        return;
    }

    try {
        const resultado = await BibliotecaAPI.buscarAlunoPorRA(ra);
        if (!resultado || !resultado.success || !resultado.data) {
            document.getElementById('alunoInfo').innerHTML = '<p class="error-message">Aluno não encontrado. Procure a equipe da biblioteca.</p>';
            return;
        }

        retiradaState.aluno = resultado.data;
        document.getElementById('alunoInfo').innerHTML = `
            <p><strong>Nome:</strong> ${resultado.data.nome}</p>
            <p><strong>RA:</strong> ${resultado.data.ra}</p>
        `;

        prepararConfirmacaoEmprestimo();
    } catch (error) {
        showError(`Erro ao verificar aluno: ${error.message}`);
    }
}

function prepararConfirmacaoEmprestimo() {
    const livro = retiradaState.livroSelecionado;
    const aluno = retiradaState.aluno;
    const exemplar = retiradaState.exemplarSelecionado;

    if (!livro || !aluno || !exemplar) {
        showError('Selecione um livro e informe um aluno antes de continuar.');
        return;
    }

    document.getElementById('confirmaLivroTitulo').textContent = `${livro.titulo} (Exemplar ${exemplar.id})`;
    document.getElementById('confirmaAlunoNome').textContent = aluno.nome;
    document.getElementById('confirmaAlunoRA').textContent = aluno.ra;
    document.getElementById('dataRetirada').textContent = formatDateTime(new Date());

    mostrarStep('step3');
}

async function confirmarEmprestimo() {
    const aluno = retiradaState.aluno;
    const exemplar = retiradaState.exemplarSelecionado;
    const livro = retiradaState.livroSelecionado;

    if (!aluno || !exemplar || !livro) {
        showError('Informações insuficientes para concluir o empréstimo.');
        return;
    }

    try {
        await BibliotecaAPI.registrarEmprestimo({
            idAluno: aluno.id,
            idExemplar: exemplar.id
        });

        document.getElementById('sucessoLivro').textContent = livro.titulo;
        document.getElementById('sucessoAluno').textContent = aluno.nome;
        document.getElementById('sucessoExemplar').textContent = exemplar.id;
        document.getElementById('sucessoData').textContent = formatDateTime(new Date());

        mostrarStep('step4');
    } catch (error) {
        showError(`Erro ao confirmar empréstimo: ${error.message}`);
    }
}

function voltarParaPesquisa() {
    retiradaState.livroSelecionado = null;
    retiradaState.exemplarSelecionado = null;
    retiradaState.aluno = null;
    document.getElementById('raInput').value = '';
    document.getElementById('alunoInfo').innerHTML = '';
    mostrarStep('step1');
    carregarLivrosDisponiveis();
}

function mostrarStep(id) {
    document.querySelectorAll('.step').forEach((step) => step.classList.remove('active'));
    const destino = document.getElementById(id);
    if (destino) {
        destino.classList.add('active');
    }
}

window.pesquisarLivros = pesquisarLivros;
window.verificarAluno = verificarAluno;
window.confirmarEmprestimo = confirmarEmprestimo;
window.voltarParaPesquisa = voltarParaPesquisa;

