/**
 * Redireciona o usuário para a página especificada.
 * @param {string} page - O caminho para a página de destino.
 */

function navigateTo(page) {
  window.location.href = page;
}

// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Função que gera uma capa aleatória
const gerarCapa = (id) => `https://picsum.photos/seed/livro${id}/200/300`;

// API real
const api = {
  buscarLivrosDisponiveis: async (termo = "") => {
    try {
      let url = `${API_BASE_URL}/livros/disponiveis`;
      if (termo) {
        url = `${API_BASE_URL}/livros?titulo=${encodeURIComponent(termo)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        // Adicionar capas aleatórias aos livros
        return data.data.map(livro => ({
          ...livro,
          capa: gerarCapa(livro.id)
        }));
      } else {
        throw new Error(data.error || 'Erro ao buscar livros');
      }
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    }
  }
};

// Função para carregar livros no carrossel
async function carregarLivros(termo = "") {
  const carrossel = document.getElementById("carrosselLivros");
  carrossel.innerHTML = "<p>Carregando livros...</p>";

  const livros = await api.buscarLivrosDisponiveis(termo);
  carrossel.innerHTML = "";

  if (livros.length === 0) {
    carrossel.innerHTML = "<p>Nenhum livro encontrado.</p>";
    return;
  }

  livros.forEach((livro) => {
    const card = document.createElement("div");
    card.className = "livro-card";
    card.innerHTML = `
      <img src="${livro.capa}" alt="${livro.titulo}">
      <h3>${livro.titulo}</h3>
      <p>${livro.autor}</p>
    `;
    carrossel.appendChild(card);
  });
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
