document.addEventListener('DOMContentLoaded', function() {
    carregarLivrosDisponiveis();
    
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
        
        if (result && result.success && Array.isArray(result.data)) {
            exibirLivrosNoCarrossel(result.data, 'Nenhum livro disponível no momento.');
        } else {
            exibirLivrosNoCarrossel([], 'Nenhum livro disponível no momento.');
        }
    } catch (error) {
        exibirLivrosNoCarrossel([], 'Erro ao carregar livros disponíveis.');
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
        
        if (result && result.success && Array.isArray(result.data)) {
            exibirLivrosNoCarrossel(result.data, 'Nenhum livro encontrado.');
        } else {
            exibirLivrosNoCarrossel([], 'Nenhum livro encontrado para sua busca.');
        }
    } catch (error) {
        exibirLivrosNoCarrossel([], 'Erro ao buscar livros.');
        showError('Erro ao buscar livros: ' + error.message);
    }
}

function exibirLivrosNoCarrossel(livros, mensagemVazia = 'Nenhum livro encontrado') {
    const carrossel = document.getElementById('carrosselLivros');
    
    if (livros.length === 0) {
        carrossel.innerHTML = `<div class="no-results">${mensagemVazia}</div>`;
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