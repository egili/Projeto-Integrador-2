// Lógica específica para a tela de retirada de livros

let livroSelecionado = null;
let alunoVerificado = null;

// Pesquisar livros disponíveis
async function pesquisarLivros() {
    const termo = document.getElementById('searchInput').value;
    const resultadosDiv = document.getElementById('resultadosLivros');
    
    resultadosDiv.innerHTML = '<p>Pesquisando livros...</p>';
    
    try {
        const livros = await api.buscarLivrosDisponiveis(termo);
        
        if (livros.length === 0) {
            resultadosDiv.innerHTML = '<p class="no-results">Nenhum livro encontrado.</p>';
            return;
        }
        
        resultadosDiv.innerHTML = livros.map(livro => `
            <div class="livro-item" onclick="selecionarLivro(${livro.id})" data-livro='${JSON.stringify(livro)}'>
                <h4>${livro.titulo}</h4>
                <p><strong>Autor:</strong> ${livro.autor}</p>
                <p><strong>Editora:</strong> ${livro.editora} (${livro.anoPublicacao})</p>
                <p><strong>ISBN:</strong> ${livro.isbn || 'N/A'}</p>
                <p><strong>Status:</strong> <span style="color: #27ae60;">Disponível</span></p>
            </div>
        `).join('');
        
    } catch (error) {
        resultadosDiv.innerHTML = '<p class="no-results">Erro ao buscar livros. Tente novamente.</p>';
        console.error('Erro:', error);
    }
}

// Selecionar livro para empréstimo
function selecionarLivro(livroId) {
    const livroItem = event.target.closest('.livro-item');
    const livroData = JSON.parse(livroItem.getAttribute('data-livro'));
    
    livroSelecionado = livroData;
    
    document.getElementById('livroSelecionadoInfo').innerHTML = `
        <strong>${livroData.titulo}</strong><br>
        <em>${livroData.autor}</em><br>
        <small>${livroData.editora} (${livroData.anoPublicacao})</small>
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
        const aluno = await api.buscarAluno(ra);
        
        alunoVerificado = aluno;
        alunoInfoDiv.innerHTML = `
            <div style="color: #27ae60;">
                <h4>Aluno encontrado:</h4>
                <p><strong>Nome:</strong> ${aluno.nome}</p>
                <p><strong>RA:</strong> ${aluno.ra}</p>
            </div>
        `;
        cadastroSection.style.display = 'none';
        
        // Preparar confirmação
        document.getElementById('confirmaLivroTitulo').textContent = livroSelecionado.titulo;
        document.getElementById('confirmaAlunoNome').textContent = aluno.nome;
        document.getElementById('confirmaAlunoRA').textContent = aluno.ra;
        document.getElementById('dataRetirada').textContent = formatarData(new Date());
        
        // Avançar para confirmação
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step3').classList.add('active');
        
    } catch (error) {
        alunoVerificado = null;
        if (error.message.includes('não encontrado')) {
            alunoInfoDiv.innerHTML = '<p style="color: #e74c3c;">Aluno não encontrado no sistema.</p>';
            cadastroSection.style.display = 'block';
        } else {
            alunoInfoDiv.innerHTML = '<p style="color: #e74c3c;">Erro ao verificar aluno. Tente novamente.</p>';
        }
    }
}

// Confirmar empréstimo
async function confirmarEmprestimo() {
    try {
        const resultado = await api.realizarEmprestimo(alunoVerificado.ra, livroSelecionado.id);
        
        // Preencher mensagem de sucesso
        document.getElementById('sucessoLivro').textContent = livroSelecionado.titulo;
        document.getElementById('sucessoAluno').textContent = alunoVerificado.nome;
        document.getElementById('sucessoData').textContent = formatarData(new Date());
        
        // Avançar para sucesso
        document.getElementById('step3').classList.remove('active');
        document.getElementById('step4').classList.add('active');
        
    } catch (error) {
        alert('Erro ao processar empréstimo: ' + error.message);
    }
}

// Voltar para pesquisa
function voltarParaPesquisa() {
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    livroSelecionado = null;
    alunoVerificado = null;
}