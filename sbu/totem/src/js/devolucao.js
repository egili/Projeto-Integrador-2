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
        const aluno = await mockAPI.buscarAluno(ra);
        
        if (aluno) {
            alunoDevolucao = aluno;
            alunoInfoDiv.innerHTML = `
                <div style="color: #27ae60;">
                    <h4>Aluno encontrado:</h4>
                    <p><strong>Nome:</strong> ${aluno.nome}</p>
                    <p><strong>RA:</strong> ${aluno.ra}</p>
                    <p><strong>Curso:</strong> ${aluno.curso}</p>
                </div>
            `;
            cadastroSection.style.display = 'none';
            
            // Buscar empréstimos ativos
            const emprestimos = await mockAPI.buscarEmprestimosAtivos(ra);
            
            if (emprestimos.length > 0) {
                document.getElementById('alunoSelecionadoInfo').innerHTML = `
                    <h4>Aluno: ${aluno.nome}</h4>
                    <p><strong>RA:</strong> ${aluno.ra}</p>
                    <p><strong>Livros em empréstimo:</strong> ${emprestimos.length}</p>
                `;
                
                document.getElementById('listaEmprestimos').innerHTML = emprestimos.map(emp => `
                    <div class="emprestimo-item" onclick="selecionarEmprestimo(${emp.id})">
                        <h4>${emp.livroTitulo}</h4>
                        <p><strong>Autor:</strong> ${emp.livroAutor}</p>
                        <p><strong>Data do empréstimo:</strong> ${formatarData(emp.dataEmprestimo)}</p>
                        <p><strong>Prazo de devolução:</strong> ${formatarData(emp.prazoDevolucao)}</p>
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
            
        } else {
            alunoDevolucao = null;
            alunoInfoDiv.innerHTML = '<p style="color: #e74c3c;">Aluno não encontrado no sistema.</p>';
            cadastroSection.style.display = 'block';
        }
        
    } catch (error) {
        alunoInfoDiv.innerHTML = '<p style="color: #e74c3c;">Erro ao buscar informações. Tente novamente.</p>';
    }
}

// Selecionar empréstimo para devolução
function selecionarEmprestimo(emprestimoId) {
    const emprestimoItem = event.target.closest('.emprestimo-item');
    const titulo = emprestimoItem.querySelector('h4').textContent;
    const autor = emprestimoItem.querySelector('p').textContent.replace('Autor: ', '');
    const dataEmprestimo = emprestimoItem.querySelectorAll('p')[2].textContent.replace('Data do empréstimo: ', '');
    
    emprestimoSelecionado = {
        id: emprestimoId,
        livroTitulo: titulo,
        livroAutor: autor,
        dataEmprestimo: dataEmprestimo
    };
    
    // Preencher confirmação
    document.getElementById('confirmaDevolucaoLivro').textContent = titulo;
    document.getElementById('confirmaDevolucaoAluno').textContent = alunoDevolucao.nome;
    document.getElementById('confirmaDevolucaoRA').textContent = alunoDevolucao.ra;
    document.getElementById('confirmaDataEmprestimo').textContent = dataEmprestimo;
    document.getElementById('confirmaDataDevolucao').textContent = formatarData(new Date());
    
    // Avançar para confirmação
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
}

// Confirmar devolução
async function confirmarDevolucao() {
    try {
        const resultado = await mockAPI.registrarDevolucao(emprestimoSelecionado.id);
        
        if (resultado.success) {
            // Preencher comprovante
            document.getElementById('comprovanteDevolucaoLivro').textContent = emprestimoSelecionado.livroTitulo;
            document.getElementById('comprovanteDevolucaoAluno').textContent = alunoDevolucao.nome;
            document.getElementById('comprovanteDevolucaoRA').textContent = alunoDevolucao.ra;
            document.getElementById('comprovanteDataDevolucao').textContent = formatarData(resultado.dataDevolucao);
            document.getElementById('codigoDevolucao').textContent = resultado.codigo;
            
            // Mostrar classificação atualizada
            document.getElementById('novaClassificacao').innerHTML = `
                <p><strong>${resultado.classificacaoAtual}</strong></p>
                <p>Total de livros lidos no semestre: ${resultado.livrosLidosSemestre}</p>
            `;
            
            // Avançar para comprovante
            document.getElementById('step3').classList.remove('active');
            document.getElementById('step4').classList.add('active');
        } else {
            alert('Erro ao registrar devolução. Tente novamente.');
        }
        
    } catch (error) {
        alert('Erro ao processar devolução. Tente novamente.');
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