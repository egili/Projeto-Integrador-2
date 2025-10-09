/**
 * Redireciona o usuário para a página especificada.
 * @param {string} page - O caminho para a página de destino.
 */

function navigateTo(page) {
  window.location.href = page;
}

// Simulação de mockAPI reutilizando o padrão do totem
const mockAPI = {
  buscarLivrosDisponiveis: async (termo = "") => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Função que gera uma capa aleatória
    const gerarCapa = (id) => `https://picsum.photos/seed/livro${id}/200/300`;

    const livros = [
      {
        id: 1,
        titulo: "Introdução à Programação",
        autor: "João Silva",
        capa: gerarCapa(1),
      },
      {
        id: 2,
        titulo: "Banco de Dados Relacional",
        autor: "Maria Santos",
        capa: gerarCapa(2),
      },
      {
        id: 3,
        titulo: "Desenvolvimento Web Moderno",
        autor: "Pedro Costa",
        capa: gerarCapa(3),
      },
      {
        id: 4,
        titulo: "Algoritmos e Estruturas de Dados",
        autor: "Ana Oliveira",
        capa: gerarCapa(4),
      },
      {
        id: 5,
        titulo: "Engenharia de Software",
        autor: "Carlos Mendes",
        capa: gerarCapa(5),
      },
      {
        id: 6,
        titulo: "Inteligência Artificial Aplicada",
        autor: "Fernanda Souza",
        capa: gerarCapa(6),
      },
      {
        id: 7,
        titulo: "Sistemas Operacionais",
        autor: "Ricardo Lima",
        capa: gerarCapa(7),
      },
    ];

    if (!termo.trim()) return livros;

    const termoLower = termo.toLowerCase();
    return livros.filter(
      (livro) =>
        livro.titulo.toLowerCase().includes(termoLower) ||
        livro.autor.toLowerCase().includes(termoLower)
    );
  },
};

// Função para carregar livros no carrossel
async function carregarLivros(termo = "") {
  const carrossel = document.getElementById("carrosselLivros");
  carrossel.innerHTML = "<p>Carregando livros...</p>";

  const livros = await mockAPI.buscarLivrosDisponiveis(termo);
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
