// Lógica específica para a tela de devolução de livros

let alunoDevolucao = null;
let emprestimoSelecionado = null;

// Buscar empréstimos ativos do aluno
async function buscarEmprestimos() {
    const ra = document.getElementById('raInputDevolucao').value.trim();
    const alunoInfoDiv = document.getElementById('alunoInfoDevolucao');
    const cadastroSection = document.getElementById('cadastroSectionDevolucao');
    
    if (!ra) {
        alert('Por favor, informe o RA.');
        return;
    }
    
    alunoInfoDiv.innerHTML = '<p>Buscando informações...</p>';
    
    try {
        const aluno = await api.buscarAluno(ra);
        
        alunoDevolucao = aluno;
        alunoInfoDiv.innerHTML = `
            <div style="color: #27ae60;">
                <h4>Aluno encontrado:</h4>
                <p><strong>Nome:</strong> ${aluno.nome}</p>
                <p><strong>RA:</strong> ${aluno.ra}</p>
            </div>
        `;
        cadastroSection.style.display = 'none';
        
        // Buscar empréstimos ativos
        const emprestimos = await api.buscarEmprestimosAtivos(ra);
        
        if (emprestimos.length > 0) {
            document.getElementById('alunoSelecionadoInfo').innerHTML = `
                <h4>Aluno: ${aluno.nome}</h4>
                <p><strong>RA:</strong> ${aluno.ra}</p>
                <p><strong>Livros em empréstimo:</strong> ${emprestimos.length}</p>
            `;
            
            document.getElementById('listaEmprestimos').innerHTML = emprestimos.map(emp => `
                <div class="emprestimo-item" onclick="selecionarEmprestimo(${emp.id})" data-emprestimo='${JSON.stringify(emp)}'>
                    <h4>${emp.livro_titulo}</h4>
                    <p><strong>Autor:</strong> ${emp.autor}</p>
                    <p><strong>Editora:</strong> ${emp.editora}</p>
                    <p><strong>Data do empréstimo:</strong> ${formatarData(emp.dataEmprestimo)}</p>
                    <p><strong>Prazo de devolução:</strong> ${formatarData(emp.dataDevolucaoPrevista)}</p>
                </div>
            `).join('');
            
            document.getElementById('semEmprestimos').style.display = 'none';
            document.getElementById('listaEmprestimos').style.display = 'block';
            
        } else {
            document.getElementById('listaEmprestimos').style.display = 'none';
            document.getElementById('semEmprestimos').style.display = 'block';
        }
        
        // Avançar para seleção de livro
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        
    } catch (error) {
        alunoDevolucao = null;
        if (error.message.includes('não encontrado')) {
            alunoInfoDiv.innerHTML = '<p style="color: #e74c3c;">Aluno não encontrado no sistema.</p>';
            cadastroSection.style.display = 'block';
        } else {
            alunoInfoDiv.innerHTML = '<p style="color: #e74c3c;">Erro ao buscar informações. Tente novamente.</p>';
        }
    }
}

// Selecionar empréstimo para devolução
function selecionarEmprestimo(emprestimoId) {
    const emprestimoItem = event.target.closest('.emprestimo-item');
    const emprestimoData = JSON.parse(emprestimoItem.getAttribute('data-emprestimo'));
    
    emprestimoSelecionado = emprestimoData;
    
    // Preencher confirmação
    document.getElementById('confirmaDevolucaoLivro').textContent = emprestimoData.livro_titulo;
    document.getElementById('confirmaDevolucaoAluno').textContent = alunoDevolucao.nome;
    document.getElementById('confirmaDevolucaoRA').textContent = alunoDevolucao.ra;
    document.getElementById('confirmaDataEmprestimo').textContent = formatarData(emprestimoData.dataEmprestimo);
    document.getElementById('confirmaDataDevolucao').textContent = formatarData(new Date());
    
    // Avançar para confirmação
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
}

// Confirmar devolução
async function confirmarDevolucao() {
    try {
        const resultado = await api.registrarDevolucao(emprestimoSelecionado.id);
        
        // Buscar classificação atualizada
        let classificacao = null;
        try {
            classificacao = await api.obterClassificacao(alunoDevolucao.ra);
        } catch (error) {
            console.log('Não foi possível obter classificação:', error);
        }
        
        // Preencher comprovante
        document.getElementById('comprovanteDevolucaoLivro').textContent = emprestimoSelecionado.livro_titulo;
        document.getElementById('comprovanteDevolucaoAluno').textContent = alunoDevolucao.nome;
        document.getElementById('comprovanteDevolucaoRA').textContent = alunoDevolucao.ra;
        document.getElementById('comprovanteDataDevolucao').textContent = formatarData(new Date());
        document.getElementById('codigoDevolucao').textContent = resultado.emprestimo;
        
        // Mostrar classificação atualizada se disponível
        if (classificacao) {
            document.getElementById('novaClassificacao').innerHTML = `
                <p><strong>${classificacao.descricao}</strong></p>
                <p>Total de livros lidos no semestre: ${classificacao.totalLivros || 0}</p>
            `;
            document.querySelector('.classification-update').style.display = 'block';
        } else {
            document.querySelector('.classification-update').style.display = 'none';
        }
        
        // Avançar para comprovante
        document.getElementById('step3').classList.remove('active');
        document.getElementById('step4').classList.add('active');
        
    } catch (error) {
        alert('Erro ao processar devolução: ' + error.message);
    }
}

// Funções de navegação
function voltarParaIdentificacao() {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    alunoDevolucao = null;
    emprestimoSelecionado = null;
}

function voltarParaSelecao() {
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    emprestimoSelecionado = null;
}