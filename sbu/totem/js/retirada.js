// Lógica específica para a tela de retirada de livros

let exemplarSelecionado = null;
let alunoVerificado = null;

// Pesquisar exemplares disponíveis
async function pesquisarLivros() {
    const termo = document.getElementById('searchInput').value;
    const resultadosDiv = document.getElementById('resultadosLivros');
    
    resultadosDiv.innerHTML = '<p>Pesquisando exemplares...</p>';
    
    try {
        let exemplares;
        if (termo) {
            // Se há termo de busca, buscar livros primeiro e depois seus exemplares
            const livros = await api.buscarLivrosDisponiveis(termo);
            exemplares = [];
            for (const livro of livros) {
                const exemplaresLivro = await api.buscarExemplaresDisponiveis();
                const exemplaresDoLivro = exemplaresLivro.filter(ex => ex.idLivro === livro.id);
                exemplares.push(...exemplaresDoLivro);
            }
        } else {
            exemplares = await api.buscarExemplaresDisponiveis();
        }
        
        if (exemplares.length === 0) {
            resultadosDiv.innerHTML = '<p class="no-results">Nenhum exemplar disponível encontrado.</p>';
            return;
        }
        
        resultadosDiv.innerHTML = exemplares.map(exemplar => `
            <div class="livro-item" onclick="selecionarExemplar(${exemplar.id})" data-exemplar='${JSON.stringify(exemplar)}'>
                <h4>${exemplar.titulo}</h4>
                <p><strong>Autor:</strong> ${exemplar.autor}</p>
                <p><strong>Editora:</strong> ${exemplar.editora} (${exemplar.anoPublicacao})</p>
                <p><strong>ISBN:</strong> ${exemplar.isbn || 'N/A'}</p>
                <p><strong>Código:</strong> ${exemplar.codigo}</p>
                <p><strong>Status:</strong> <span style="color: #27ae60;">Disponível</span></p>
            </div>
        `).join('');
        
    } catch (error) {
        resultadosDiv.innerHTML = '<p class="no-results">Erro ao buscar exemplares. Tente novamente.</p>';
        console.error('Erro:', error);
    }
}

// Selecionar exemplar para empréstimo
function selecionarExemplar(exemplarId) {
    const exemplarItem = event.target.closest('.livro-item');
    const exemplarData = JSON.parse(exemplarItem.getAttribute('data-exemplar'));
    
    exemplarSelecionado = exemplarData;
    
    document.getElementById('livroSelecionadoInfo').innerHTML = `
        <strong>${exemplarData.titulo}</strong><br>
        <em>${exemplarData.autor}</em><br>
        <small>${exemplarData.editora} (${exemplarData.anoPublicacao})</small><br>
        <small><strong>Código:</strong> ${exemplarData.codigo}</small>
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
        document.getElementById('confirmaLivroTitulo').textContent = exemplarSelecionado.titulo;
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
        const resultado = await api.realizarEmprestimo(alunoVerificado.ra, exemplarSelecionado.id);
        
        // Preencher mensagem de sucesso
        document.getElementById('sucessoLivro').textContent = exemplarSelecionado.titulo;
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
    exemplarSelecionado = null;
    alunoVerificado = null;
}