const devolucaoState = {
    aluno: null,
    emprestimos: [],
    emprestimoSelecionado: null
};

document.addEventListener('DOMContentLoaded', () => {
    mostrarStepDevolucao('step1');
});

async function buscarEmprestimos() {
    const ra = document.getElementById('raInputDevolucao').value.trim();

    if (!ra) {
        showError('Informe o RA do aluno.');
        return;
    }

    try {
        const alunoResult = await BibliotecaAPI.buscarAlunoPorRA(ra);

        if (!alunoResult || !alunoResult.success || !alunoResult.data) {
            document.getElementById('alunoInfoDevolucao').innerHTML = '<p class="error-message">Aluno não encontrado. Procure a equipe da biblioteca.</p>';
            return;
        }

        devolucaoState.aluno = alunoResult.data;
        document.getElementById('alunoInfoDevolucao').innerHTML = `
            <p><strong>Nome:</strong> ${devolucaoState.aluno.nome}</p>
            <p><strong>RA:</strong> ${devolucaoState.aluno.ra}</p>
        `;

        const emprestimosResult = await BibliotecaAPI.listarEmprestimosAluno(ra);
        devolucaoState.emprestimos = emprestimosResult?.data || [];

        if (devolucaoState.emprestimos.length === 0) {
            document.getElementById('semEmprestimos').style.display = 'block';
            document.getElementById('listaEmprestimos').innerHTML = '';
        } else {
            document.getElementById('semEmprestimos').style.display = 'none';
            renderizarEmprestimos(devolucaoState.emprestimos);
        }

        document.getElementById('alunoSelecionadoInfo').innerHTML = `
            <p><strong>Aluno:</strong> ${devolucaoState.aluno.nome} (${devolucaoState.aluno.ra})</p>
        `;

        mostrarStepDevolucao('step2');
    } catch (error) {
        showError(`Erro ao buscar empréstimos: ${error.message}`);
    }
}

function renderizarEmprestimos(emprestimos) {
    const lista = document.getElementById('listaEmprestimos');

    lista.innerHTML = emprestimos.map((emprestimo) => `
        <div class="card emprestimo-card">
            <h3>${emprestimo.titulo}</h3>
            <p><strong>Código do exemplar:</strong> ${emprestimo.id_exemplar}</p>
            <p><strong>Data de empréstimo:</strong> ${formatDate(emprestimo.dataEmprestimo)}</p>
            <button class="btn-primary btn-full selecionar-emprestimo" data-id="${emprestimo.id}">
                Selecionar para devolução
            </button>
        </div>
    `).join('');

    lista.querySelectorAll('.selecionar-emprestimo').forEach((botao) => {
        botao.addEventListener('click', () => {
            const idEmprestimo = botao.getAttribute('data-id');
            const emprestimo = devolucaoState.emprestimos.find((item) => String(item.id) === String(idEmprestimo));
            if (emprestimo) {
                selecionarEmprestimo(emprestimo);
            }
        });
    });
}

function selecionarEmprestimo(emprestimo) {
    devolucaoState.emprestimoSelecionado = emprestimo;

    document.getElementById('confirmaDevolucaoLivro').textContent = emprestimo.titulo;
    document.getElementById('confirmaDevolucaoAluno').textContent = devolucaoState.aluno.nome;
    document.getElementById('confirmaDevolucaoRA').textContent = devolucaoState.aluno.ra;
    document.getElementById('confirmaDataEmprestimo').textContent = formatDate(emprestimo.dataEmprestimo);

    mostrarStepDevolucao('step3');
}

async function confirmarDevolucao() {
    const emprestimo = devolucaoState.emprestimoSelecionado;

    if (!emprestimo) {
        showError('Selecione um empréstimo para concluir a devolução.');
        return;
    }

    try {
        await BibliotecaAPI.registrarDevolucao(emprestimo.id);

        document.getElementById('sucessoDevolucaoLivro').textContent = emprestimo.titulo;
        document.getElementById('sucessoDevolucaoAluno').textContent = devolucaoState.aluno.nome;
        document.getElementById('sucessoDevolucaoData').textContent = formatDateTime(new Date());

        await atualizarClassificacaoPosDevolucao(devolucaoState.aluno.ra);

        mostrarStepDevolucao('step4');
    } catch (error) {
        showError(`Erro ao confirmar devolução: ${error.message}`);
    }
}

async function atualizarClassificacaoPosDevolucao(ra) {
    const container = document.querySelector('.classification-update');
    const detalhes = document.getElementById('novaClassificacao');

    if (!container || !detalhes) {
        return;
    }

    try {
        const resultado = await BibliotecaAPI.obterClassificacaoAluno(ra);
        if (resultado && resultado.success && resultado.data) {
            const stats = resultado.data.estatisticas || {};
            container.style.display = 'block';
            detalhes.innerHTML = `
                <p><strong>Classificação:</strong> ${stats.classificacao || '—'}</p>
                <p><strong>Livros lidos:</strong> ${stats.livros_devolvidos || 0}</p>
                <p><strong>Total de empréstimos:</strong> ${stats.total_emprestimos || 0}</p>
            `;
        } else {
            container.style.display = 'none';
        }
    } catch (error) {
        container.style.display = 'none';
        console.warn('Não foi possível atualizar a classificação:', error.message);
    }
}

function voltarParaIdentificacao() {
    devolucaoState.aluno = null;
    devolucaoState.emprestimoSelecionado = null;
    devolucaoState.emprestimos = [];
    document.getElementById('raInputDevolucao').value = '';
    document.getElementById('alunoInfoDevolucao').innerHTML = '';
    document.getElementById('listaEmprestimos').innerHTML = '';
    document.getElementById('alunoSelecionadoInfo').innerHTML = '';
    document.getElementById('semEmprestimos').style.display = 'none';
    mostrarStepDevolucao('step1');
}

function voltarParaSelecao() {
    if (devolucaoState.emprestimos.length > 0) {
        mostrarStepDevolucao('step2');
    } else {
        mostrarStepDevolucao('step1');
    }
}

function mostrarStepDevolucao(id) {
    document.querySelectorAll('.step').forEach((step) => step.classList.remove('active'));
    const destino = document.getElementById(id);
    if (destino) {
        destino.classList.add('active');
    }
}

window.buscarEmprestimos = buscarEmprestimos;
window.confirmarDevolucao = confirmarDevolucao;
window.voltarParaIdentificacao = voltarParaIdentificacao;
window.voltarParaSelecao = voltarParaSelecao;

