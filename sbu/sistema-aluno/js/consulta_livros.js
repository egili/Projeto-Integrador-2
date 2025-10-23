document.addEventListener('DOMContentLoaded', function() {
    carregarLivrosDisponiveis();
    
    // Configurar busca
    const botaoBuscar = document.getElementById('botaoBuscar');
    const campoBusca = document.getElementById('campoBusca');
    
    if (botaoBuscar) {
        botaoBuscar.addEventListener('click', buscarLivros);
    }
    
    if (campoBusca) {
        campoBusca.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarLivros();
            }
        });
    }
});

async function carregarLivrosDisponiveis() {
    try {
        const result = await BibliotecaAPI.listarLivrosDisponiveis();
        
        if (result.success) {
            exibirLivrosNoCarrossel(result.data);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Erro ao carregar livros: ' + error.message);
    }
}

async function buscarLivros() {
    const termo = document.getElementById('campoBusca').value;
    
    if (!termo) {
        carregarLivrosDisponiveis();
        return;
    }

    try {
        const result = await BibliotecaAPI.buscarLivros(termo);
        
        if (result.success) {
            exibirLivrosNoCarrossel(result.data);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Erro ao buscar livros: ' + error.message);
    }
}

function exibirLivrosNoCarrossel(livros) {
    const carrossel = document.getElementById('carrosselLivros');
    
    if (livros.length === 0) {
        carrossel.innerHTML = '<div class="no-results">Nenhum livro encontrado</div>';
        return;
    }

    carrossel.innerHTML = livros.map(livro => `
        <div class="livro-card">
            <h3>${livro.titulo}</h3>
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>Editora:</strong> ${livro.editora}</p>
            <p><strong>Ano:</strong> ${livro.anoPublicacao}</p>
            <p><strong>ISBN:</strong> ${livro.isbn || 'N/A'}</p>
            <p><strong>Exemplares disponíveis:</strong> ${livro.exemplares_disponiveis || 0}</p>
        </div>
    `).join('');
}