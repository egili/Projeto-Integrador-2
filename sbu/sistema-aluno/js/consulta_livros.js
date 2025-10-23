/**
 * Redireciona o usuário para a página especificada.
 * @param {string} page - O caminho para a página de destino.
 */

function navigateTo(page) {
  window.location.href = page;
}

// API real do backend
const API_BASE_URL = 'http://localhost:3000/api';

const api = {
  buscarLivrosDisponiveis: async (termo = "") => {
    try {
      let url = `${API_BASE_URL}/livros/disponiveis-com-exemplares`;
      
      if (termo.trim()) {
        // Se há termo de busca, buscar por título ou autor
        const response = await fetch(`${API_BASE_URL}/livros?titulo=${encodeURIComponent(termo)}`);
        const data = await response.json();
        return data.success ? data.data : [];
      }
      
      const response = await fetch(url);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      return [];
    }
  },

  buscarExemplaresDisponiveis: async (idLivro) => {
    try {
      const response = await fetch(`${API_BASE_URL}/exemplares/disponiveis?idLivro=${idLivro}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Erro ao buscar exemplares:', error);
      return [];
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
      <div class="livro-info">
        <h3>${livro.titulo}</h3>
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Editora:</strong> ${livro.editora}</p>
        <p><strong>Ano:</strong> ${livro.anoPublicacao}</p>
        <p><strong>ISBN:</strong> ${livro.isbn || 'N/A'}</p>
        <p><strong>Exemplares disponíveis:</strong> ${livro.totalExemplares}</p>
        <div class="exemplares-info">
          <h4>Exemplares:</h4>
          <ul>
            ${livro.exemplares.map(exemplar => 
              `<li>Código: ${exemplar.codigo} - Status: ${exemplar.status}</li>`
            ).join('')}
          </ul>
        </div>
      </div>
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
