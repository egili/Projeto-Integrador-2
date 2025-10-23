document.addEventListener('DOMContentLoaded', function() {
    const btnBuscarLeitor = document.getElementById('btnBuscarLeitor');
    const campoBuscaLeitor = document.getElementById('campoBuscaLeitor');
    
    if (btnBuscarLeitor) {
        btnBuscarLeitor.addEventListener('click', buscarPontuacao);
    }
    
    if (campoBuscaLeitor) {
        campoBuscaLeitor.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarPontuacao();
            }
        });
        
        // Focar no campo de busca quando a página carregar
        campoBuscaLeitor.focus();
    }
});

async function buscarPontuacao() {
    const ra = document.getElementById('campoBuscaLeitor').value.trim();
    
    if (!ra) {
        showError('Por favor, digite o RA do aluno');
        return;
    }

    try {
        // Primeiro busca o aluno por RA
        const alunoResult = await BibliotecaAPI.buscarAlunoPorRA(ra);
        
        if (alunoResult.success) {
            // Agora busca a classificação
            const classificacaoResult = await BibliotecaAPI.obterClassificacaoAluno(alunoResult.data.id);
            
            if (classificacaoResult.success) {
                exibirPontuacao(classificacaoResult.data);
            } else {
                showError('Erro ao buscar classificação do aluno');
            }
        } else {
            showError('Aluno não encontrado. Verifique o RA digitado.');
        }
    } catch (error) {
        showError('Erro ao buscar pontuação: ' + error.message);
    }
}

function exibirPontuacao(dados) {
    const container = document.getElementById('resultadoPontuacao');
    
    const nivelCores = {
        'Leitor Iniciante': 'beginner',
        'Leitor Regular': 'regular',
        'Leitor Ativo': 'active',
        'Leitor Extremo': 'extreme'
    };
    
    const corClasse = nivelCores[dados.classificacao] || 'beginner';
    
    container.innerHTML = `
        <div class="pontuacao-card ${corClasse}">
            <div class="pontuacao-header">
                <h3>${dados.nome}</h3>
                <span class="ra">RA: ${dados.ra}</span>
            </div>
            <div class="pontuacao-info">
                <div class="nivel-leitor">
                    <strong>Classificação:</strong>
                    <span class="nivel ${corClasse}">${dados.classificacao}</span>
                </div>
                <div class="livros-lidos">
                    <strong>Livros lidos no semestre:</strong>
                    <span class="quantidade">${dados.livros_lidos}</span>
                </div>
            </div>
            <div class="pontuacao-dica">
                <p>💡 <strong>Dica:</strong> Continue lendo para melhorar sua classificação!</p>
            </div>
        </div>
    `;
}