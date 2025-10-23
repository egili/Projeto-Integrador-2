document.addEventListener('DOMContentLoaded', function() {
    carregarClassificacaoGeral();
});

async function carregarClassificacaoGeral() {
    try {
        const result = await BibliotecaAPI.obterClassificacaoGeral();
        
        if (result.success) {
            exibirClassificacaoGeral(result.data);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Erro ao carregar classificação: ' + error.message);
    }
}

function exibirClassificacaoGeral(classificacao) {
    const container = document.querySelector('.table-ranking');
    
    if (classificacao.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum dado de classificação disponível</p>';
        return;
    }

    const nivelCores = {
        'Leitor Iniciante': 'beginner',
        'Leitor Regular': 'regular', 
        'Leitor Ativo': 'active',
        'Leitor Extremo': 'extreme'
    };

    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Posição</th>
                    <th>Aluno</th>
                    <th>RA</th>
                    <th>Livros Lidos</th>
                    <th>Classificação</th>
                </tr>
            </thead>
            <tbody>
                ${classificacao.map((aluno, index) => {
                    const corClasse = nivelCores[aluno.classificacao] || 'beginner';
                    return `
                        <tr>
                            <td>${index + 1}º</td>
                            <td>${aluno.nome}</td>
                            <td>${aluno.ra}</td>
                            <td>${aluno.livros_lidos}</td>
                            <td>
                                <span class="status-${corClasse}">
                                    ${aluno.classificacao}
                                </span>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}