/**
 * Redireciona o usuário para a página especificada.
 * @param {string} page - O caminho para a página de destino.
 */

function navigateTo(page) {
  window.location.href = page;
}

// API real do backend
const API_BASE_URL = 'http://localhost:3001/api';

const api = {
  buscarExemplaresDisponiveis: async (termo = "") => {
    try {
      let url = `${API_BASE_URL}/exemplares/disponiveis`;
      
      if (termo.trim()) {
        // Buscar por título ou autor nos livros
        const livrosResponse = await fetch(`${API_BASE_URL}/livros?titulo=${encodeURIComponent(termo)}`);
        const livrosData = await livrosResponse.json();
        
        if (livrosData.success && livrosData.data.length > 0) {
          // Buscar exemplares dos livros encontrados
          const exemplaresPromises = livrosData.data.map(livro => 
            fetch(`${API_BASE_URL}/exemplares/livro/${livro.id}`)
              .then(res => res.json())
              .then(data => data.success ? data.data : [])
          );
          
          const exemplaresArrays = await Promise.all(exemplaresPromises);
          const exemplares = exemplaresArrays.flat().filter(ex => ex.status === 'disponivel');
          return exemplares;
        }
        
        return [];
      }
      
      const response = await fetch(url);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Erro ao buscar exemplares:', error);
      return [];
    }
  },
};

// Função para carregar livros no carrossel
async function carregarLivros(termo = "") {
  const carrossel = document.getElementById("carrosselLivros");
  carrossel.innerHTML = "<p>Carregando livros...</p>";

  const exemplares = await api.buscarExemplaresDisponiveis(termo);
  carrossel.innerHTML = "";

  if (exemplares.length === 0) {
    carrossel.innerHTML = "<p>Nenhum exemplar disponível encontrado.</p>";
    return;
  }

  // Agrupar exemplares por livro para mostrar apenas um card por livro
  const livrosUnicos = {};
  exemplares.forEach(exemplar => {
    const livroId = exemplar.idLivro;
    if (!livrosUnicos[livroId]) {
      livrosUnicos[livroId] = {
        id: exemplar.idLivro,
        titulo: exemplar.livro_titulo,
        autor: exemplar.autor,
        editora: exemplar.editora,
        anoPublicacao: exemplar.anoPublicacao,
        isbn: exemplar.isbn,
        exemplares: []
      };
    }
    livrosUnicos[livroId].exemplares.push(exemplar);
  });

  Object.values(livrosUnicos).forEach((livro) => {
    const card = document.createElement("div");
    card.className = "livro-card";
    card.innerHTML = `
      <div class="livro-capa">
        <div class="capa-placeholder">📚</div>
      </div>
      <h3>${livro.titulo}</h3>
      <p><strong>Autor:</strong> ${livro.autor}</p>
      <p><strong>Editora:</strong> ${livro.editora}</p>
      <p><strong>Ano:</strong> ${livro.anoPublicacao}</p>
      <p><strong>Exemplares disponíveis:</strong> ${livro.exemplares.length}</p>
      <div class="exemplares-info">
        <p><strong>Códigos:</strong> ${livro.exemplares.map(ex => ex.codigo).join(', ')}</p>
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
