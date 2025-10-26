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
        
        // Verifica se retornou dados
        if (!alunoResult || !alunoResult.data) {
            showError('Aluno não encontrado. Verifique o RA digitado.');
            return;
        }
        
        // Garante que temos o RA do aluno
        const raAluno = alunoResult.data.ra;
        if (!raAluno) {
            console.error('Dados do aluno:', alunoResult.data);
            showError('Erro: RA do aluno não encontrado nos dados retornados.');
            return;
        }
        
        console.log('Buscando classificação para o aluno RA:', raAluno);
        
        // Agora busca a classificação (a API espera RA, não ID)
        const classificacaoResult = await BibliotecaAPI.obterClassificacaoAluno(raAluno);
        
        // Verifica se retornou dados
        if (!classificacaoResult || !classificacaoResult.data) {
            showError('Erro ao buscar classificação do aluno');
            return;
        }
        
        exibirPontuacao(classificacaoResult.data);
        
    } catch (error) {
        // Trata erros HTTP e de conexão
        if (error.message.includes('não encontrado') || error.message.includes('404')) {
            showError('Aluno não encontrado. Verifique o RA digitado.');
        } else {
            showError('Erro ao buscar pontuação: ' + error.message);
        }
    }
}

function exibirPontuacao(dados) {
    const container = document.getElementById('resultadoPontuacao');
    
    console.log('Dados recebidos para exibição:', dados);
    
    // A API retorna: { aluno: {...}, estatisticas: {...} }
    const aluno = dados.aluno || dados;
    const stats = dados.estatisticas || dados;
    
    // Calcular livros lidos (livros devolvidos)
    const livrosLidos = stats.livros_devolvidos || 0;
    
    // Determinar classificação baseada em livros lidos
    let classificacao = 'Leitor Iniciante';
    if (livrosLidos > 20) {
        classificacao = 'Leitor Extremo';
    } else if (livrosLidos > 10) {
        classificacao = 'Leitor Ativo';
    } else if (livrosLidos > 5) {
        classificacao = 'Leitor Regular';
    }
    
    const nivelCores = {
        'Leitor Iniciante': 'beginner',
        'Leitor Regular': 'regular',
        'Leitor Ativo': 'active',
        'Leitor Extremo': 'extreme'
    };
    
    const corClasse = nivelCores[classificacao] || 'beginner';
    
    container.innerHTML = `
        <div class="pontuacao-card ${corClasse}">
            <div class="pontuacao-header">
                <h3>${aluno.nome}</h3>
                <span class="ra">RA: ${aluno.ra}</span>
            </div>
            <div class="pontuacao-info">
                <div class="nivel-leitor">
                    <strong>Classificação:</strong>
                    <span class="nivel ${corClasse}">${classificacao}</span>
                </div>
                <div class="livros-lidos">
                    <strong>Livros lidos:</strong>
                    <span class="quantidade">${livrosLidos}</span>
                </div>
            </div>
        </div>
    `;
}