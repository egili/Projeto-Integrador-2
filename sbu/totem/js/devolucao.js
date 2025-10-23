let alunoEncontrado = null;
let emprestimosAtivos = [];

async function buscarEmprestimos() {
    const ra = document.getElementById('raInputDevolucao').value;
    
    if (!ra) {
        showError('Digite o RA do aluno');
        return;
    }

    try {
        // Buscar aluno
        const alunoResult = await BibliotecaAPI.buscarAlunoPorRA(ra);
        
        if (alunoResult.success) {
            alunoEncontrado = alunoResult.data;
            
            // Buscar empréstimos ativos
            const emprestimosResult = await BibliotecaAPI.listarEmprestimosAtivos(alunoResult.data.id);
            
            if (emprestimosResult.success) {
                emprestimosAtivos = emprestimosResult.data;
                exibirEmprestimosAtivos();
            } else {
                showError('Erro ao buscar empréstimos');
            }
        } else {
            alunoEncontrado = null;
            document.getElementById('alunoInfoDevolucao').innerHTML = '';
            document.getElementById('cadastroSectionDevolucao').style.display = 'block';
        }
    } catch (error) {
        showError('Erro ao buscar empréstimos: ' + error.message);
    }
}

function exibirEmprestimosAtivos() {
    const container = document.getElementById('alunoInfoDevolucao');
    const listaContainer = document.getElementById('listaEmprestimos');
    const semEmprestimos = document.getElementById('semEmprestimos');

    // Exibir info do aluno
    container.innerHTML = `
        <div class="aluno-encontrado">
            <p><strong>Aluno:</strong> ${alunoEncontrado.nome}</p>
            <p><strong>RA:</strong> ${alunoEncontrado.ra}</p>
        </div>
    `;

    if (emprestimosAtivos.length === 0) {
        listaContainer.innerHTML = '';
        semEmprestimos.style.display = 'block';
        return;
    }

    semEmprestimos.style.display = 'none';
    
    listaContainer.innerHTML = emprestimosAtivos.map(emp => `
        <div class="emprestimo-item" onclick="selecionarEmprestimo(${JSON.stringify(emp).replace(/"/g, '&quot;')})">
            <h3>${emp.titulo}</h3>
            <p><strong>Autor:</strong> ${emp.autor}</p>
            <p><strong>Exemplar:</strong> ${emp.codigo_exemplar}</p>
            <p><strong>Data do empréstimo:</strong> ${formatDate(emp.dataEmprestimo)}</p>
            <p><strong>Devolução prevista:</strong> ${formatDate(emp.dataDevolucaoPrevista)}</p>
        </div>
    `).join('');

    // Avançar para próxima etapa
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
}

function selecionarEmprestimo(emprestimo) {
    document.getElementById('alunoSelecionadoInfo').innerHTML = `
        <p><strong>Aluno:</strong> ${alunoEncontrado.nome} (RA: ${alunoEncontrado.ra})</p>
    `;

    // Preencher dados de confirmação
    document.getElementById('confirmaDevolucaoLivro').textContent = emprestimo.titulo;
    document.getElementById('confirmaDevolucaoAluno').textContent = alunoEncontrado.nome;
    document.getElementById('confirmaDevolucaoRA').textContent = alunoEncontrado.ra;
    document.getElementById('confirmaDataEmprestimo').textContent = formatDate(emprestimo.dataEmprestimo);

    // Armazenar ID do empréstimo para devolução
    window.emprestimoSelecionado = emprestimo;

    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
}

async function confirmarDevolucao() {
    if (!window.emprestimoSelecionado) {
        showError('Nenhum empréstimo selecionado');
        return;
    }

    try {
        const result = await BibliotecaAPI.realizarDevolucao(window.emprestimoSelecionado.id);
        
        if (result.success) {
            document.getElementById('step3').classList.remove('active');
            document.getElementById('step4').classList.add('active');
            
            document.getElementById('sucessoDevolucaoLivro').textContent = window.emprestimoSelecionado.titulo;
            document.getElementById('sucessoDevolucaoAluno').textContent = alunoEncontrado.nome;
            document.getElementById('sucessoDevolucaoData').textContent = new Date().toLocaleDateString('pt-BR');
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Erro ao realizar devolução: ' + error.message);
    }
}

function voltarParaIdentificacao() {
    alunoEncontrado = null;
    emprestimosAtivos = [];
    window.emprestimoSelecionado = null;
    
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step4').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    
    document.getElementById('raInputDevolucao').value = '';
    document.getElementById('alunoInfoDevolucao').innerHTML = '';
    document.getElementById('cadastroSectionDevolucao').style.display = 'none';
}

function voltarParaSelecao() {
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step2').classList.add('active');
}