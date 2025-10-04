// Lógica específica para a tela de retirada de livros

let livroSelecionado = null;
let alunoVerificado = null;

// Pesquisar livros disponíveis
async function pesquisarLivros() {
    const termo = document.getElementById('searchInput').value;
    const resultadosDiv = document.getElementById('resultadosLivros');
    
    resultadosDiv.innerHTML = '<p>Pesquisando livros...</p>';
    
    try {
        const livros = await mockAPI.buscarLivrosDisponiveis(termo);
        
        if (livros.length === 0) {
            resultadosDiv.innerHTML = '<p class="no-results">Nenhum livro encontrado.</p>';
            return;
        }
        
        resultadosDiv.innerHTML = livros.map(livro => `
            <div class="livro-item" onclick="selecionarLivro(${livro.id})">
                <h4>${livro.titulo}</h4>
                <p><strong>Autor:</strong> ${livro.autor}</p>
                <p><strong>Editora:</strong> ${livro.editora} (${livro.ano})</p>
                <p><strong>Status:</strong> <span style="color: #27ae60;">Disponível</span></p>
            </div>
        `).join('');
        
    } catch (error) {
        resultadosDiv.innerHTML = '<p class="no-results">Erro ao buscar livros. Tente novamente.</p>';
    }
}

// Selecionar livro para empréstimo
function selecionarLivro(livroId) {
    // Em um sistema real, buscaria os detalhes completos do livro
    const livroItem = event.target.closest('.livro-item');
    const titulo = livroItem.querySelector('h4').textContent;
    const autor = livroItem.querySelector('p').textContent.replace('Autor: ', '');
    
    livroSelecionado = {
        id: livroId,
        titulo: titulo,
        autor: autor
    };
    
    document.getElementById('livroSelecionadoInfo').innerHTML = `
        <strong>${titulo}</strong><br>
        <em>${autor}</em>
    `;
    
    // Avançar para o próximo passo
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    
    // Limpar campos anteriores
    document.getElementById('raInput').value = '';
    document.getElementById('alunoInfo').innerHTML = '';
    document.getElementById('cadastroSection').style.display = 'none';
}

// Verificar aluno pelo RA
async function verificarAluno() {
    const ra = document.getElementById('raInput').value.trim();
    const alunoInfoDiv = document.getElementById('alunoInfo');
    const cadastroSection = document.getElementById('cadastroSection');
    
    if (!ra) {
        alert('Por favor, informe o RA.');
        return;
    }
    
    alunoInfoDiv.innerHTML = '<p>Verificando cadastro...</p>';
    
    try {
        const aluno = await mockAPI.buscarAluno(ra);
        
        if (aluno) {
            alunoVerificado = aluno;
            alunoInfoDiv.innerHTML = `
                <div style="color: #27ae60;">
                    <h4>Aluno encontrado:</h4>
                    <p><strong>Nome:</strong> ${aluno.nome}</p>
                    <p><strong>RA:</strong> ${aluno.ra}</p>
                    <p><strong>Curso:</strong> ${aluno.curso}</p>
                    <p><strong>E-mail:</strong> ${aluno.email}</p>
                </div>
            `;
            cadastroSection.style.display = 'none';
            
            // Preparar confirmação
            document.getElementById('confirmaLivroTitulo').textContent = livroSelecionado.titulo;
            document.getElementById('confirmaAlunoNome').textContent = aluno.nome;
            document.getElementById('confirmaAlunoRA').textContent = aluno.ra;
            document.getElementById('dataRetirada').textContent = formatarData(new Date());
            document.getElementById('prazoDevolucao').textContent = formatarData(calcularPrazoDevolucao());
            
            // Avançar para confirmação
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.add('active');
            
        } else {
            alunoVerificado = null;
            alunoInfoDiv.innerHTML = '<p style="color: #e74c3c;">Aluno não encontrado no sistema.</p>';
            cadastroSection.style.display = 'block';
        }
        
    } catch (error) {
        alunoInfoDiv.innerHTML = '<p style="color: #e74c3c;">Erro ao verificar aluno. Tente novamente.</p>';
    }
}

// Confirmar empréstimo
async function confirmarEmprestimo() {
    try {
        const resultado = await mockAPI.registrarEmprestimo(alunoVerificado.ra, livroSelecionado.id);
        
        if (resultado.success) {
            // Preencher comprovante
            document.getElementById('comprovanteLivro').textContent = livroSelecionado.titulo;
            document.getElementById('comprovanteAluno').textContent = alunoVerificado.nome;
            document.getElementById('comprovanteRA').textContent = alunoVerificado.ra;
            document.getElementById('comprovanteDataRetirada').textContent = formatarData(resultado.dataRetirada);
            document.getElementById('comprovantePrazo').textContent = formatarData(resultado.prazoDevolucao);
            document.getElementById('codigoEmprestimo').textContent = resultado.codigo;
            
            // Avançar para comprovante
            document.getElementById('step3').classList.remove('active');
            document.getElementById('step4').classList.add('active');
        } else {
            alert('Erro ao registrar empréstimo. Tente novamente.');
        }
        
    } catch (error) {
        alert('Erro ao processar empréstimo. Tente novamente.');
    }
}

// Voltar para pesquisa
function voltarParaPesquisa() {
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    livroSelecionado = null;
    alunoVerificado = null;
}