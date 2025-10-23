/**
 * Redireciona o usuário para a página especificada.
 * @param {string} page - O caminho para a página de destino.
 */

function navigateTo(page) {
  window.location.href = page;
}

// Função que gera uma capa aleatória
const gerarCapa = (id) => `https://picsum.photos/seed/livro${id}/200/300`;

// Função para carregar livros no carrossel
async function carregarLivros(termo = "") {
  const carrossel = document.getElementById("carrosselLivros");
  carrossel.innerHTML = "<p>Carregando livros...</p>";

  try {
    const livros = await api.buscarLivrosDisponiveis(termo);
    carrossel.innerHTML = "";

    if (livros.length === 0) {
      carrossel.innerHTML = "<p>Nenhum livro encontrado.</p>";
      return;
    }

    livros.forEach((livro) => {
      const card = document.createElement("div");
      card.className = "livro-card";
      const disponibilidade = livro.exemplares_disponiveis > 0 
        ? `<span style="color: #27ae60;">${livro.exemplares_disponiveis} disponível(is)</span>`
        : `<span style="color: #e74c3c;">Indisponível</span>`;
      
      card.innerHTML = `
        <img src="${gerarCapa(livro.id)}" alt="${livro.titulo}">
        <h3>${livro.titulo}</h3>
        <p>${livro.autor}</p>
        <p style="font-size: 0.9em; margin-top: 5px;">${disponibilidade}</p>
      `;
      carrossel.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar livros:', error);
    carrossel.innerHTML = "<p>Erro ao carregar livros. Verifique se o servidor está rodando.</p>";
  }
}

// Inicialização da página
document.addEventListener("DOMContentLoaded", () => {
  const setaEsquerda = document.querySelector(".seta-esquerda");
  const setaDireita = document.querySelector(".seta-direita");
  const carrossel = document.getElementById("carrosselLivros");
  const campoBusca = document.getElementById("campoBusca");
  const botaoBuscar = document.getElementById("botaoBuscar");

  // Mostra todos os livros ao carregar a página
  carregarLivros();

  // Navegação pelas setas
  setaEsquerda.addEventListener("click", () => {
    carrossel.scrollBy({ left: -300, behavior: "smooth" });
  });

  setaDireita.addEventListener("click", () => {
    carrossel.scrollBy({ left: 300, behavior: "smooth" });
  });

  // Busca por botão
  botaoBuscar.addEventListener("click", () => {
    const termo = campoBusca.value.trim();
    carregarLivros(termo);
  });

  // Busca ao pressionar Enter
  campoBusca.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const termo = campoBusca.value.trim();
      carregarLivros(termo);
    }
  });
});
