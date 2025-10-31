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
    
    // Configurar navegação do carrossel
    const setaEsquerda = document.querySelector('.seta-esquerda');
    const setaDireita = document.querySelector('.seta-direita');
    const carrossel = document.getElementById('carrosselLivros');
    
    if (setaEsquerda && carrossel) {
        setaEsquerda.addEventListener('click', function() {
            carrossel.scrollBy({ left: -300, behavior: 'smooth' });
        });
    }
    
    if (setaDireita && carrossel) {
        setaDireita.addEventListener('click', function() {
            carrossel.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
});

async function carregarLivrosDisponiveis() {
    try {
        const result = await BibliotecaAPI.listarLivrosDisponiveis();
        
        // Se chegou aqui sem exceção, a busca foi bem-sucedida
        if (result && result.data) {
            exibirLivrosNoCarrossel(result.data);
        } else {
            showError('Nenhum livro disponível no momento.');
        }
    } catch (error) {
        showError('Erro ao carregar livros: ' + error.message);
    }
}

async function buscarLivros() {
    const termo = document.getElementById('campoBusca').value.trim();
    
    if (!termo) {
        carregarLivrosDisponiveis();
        return;
    }

    try {
        const result = await BibliotecaAPI.buscarLivros(termo);
        
        // Se chegou aqui sem exceção, a busca foi bem-sucedida
        if (result && result.data) {
            exibirLivrosNoCarrossel(result.data);
        } else {
            showError('Nenhum livro encontrado.');
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