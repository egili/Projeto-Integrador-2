document.addEventListener("DOMContentLoaded", function () {
  const campoBusca = document.getElementById("campoBusca");
  const botaoBuscar = document.getElementById("botaoBuscar");

  console.log("Página carregada - iniciando consulta de livros");

  carregarLivrosDisponiveis();

  if (botaoBuscar) {
    botaoBuscar.addEventListener("click", buscarLivros);
  }

  if (campoBusca) {
    campoBusca.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        buscarLivros();
      }
    });
  }
});

async function carregarLivrosDisponiveis() {
  try {
    console.log("Buscando livros disponíveis...");
    const response = await BibliotecaAPI.buscarLivrosDisponiveis();
    console.log("Resposta recebida:", response);

    let livros = response.data || [];

    console.log("Livros processados:", livros);
    popularTabelaLivros(livros);
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
    showError("Erro ao carregar lista de livros: " + error.message);
  }
}

async function buscarLivros() {
  const termo = document.getElementById("campoBusca").value.trim();
  console.log("Buscando por:", termo);

  try {
    let response;
    if (termo) {
      response = await BibliotecaAPI.buscarLivros(termo);
    } else {
      response = await BibliotecaAPI.buscarLivrosDisponiveis();
    }

    let livros = response.data || [];

    popularTabelaLivros(livros);
  } catch (error) {
    console.error("Erro na busca:", error);
    showError("Erro ao buscar livros: " + error.message);
  }
}

function popularTabelaLivros(livros) {
  const tbody = document.getElementById("lista-livros-disponiveis");
  const semLivros = document.getElementById("sem-livros");
  const containerTabela = document.getElementById("container-tabela");

  tbody.innerHTML = "";

  if (!livros || !Array.isArray(livros) || livros.length === 0) {
    semLivros.classList.remove("hidden");
    containerTabela.classList.add("hidden");
    return;
  }

  semLivros.classList.add("hidden");
  containerTabela.classList.remove("hidden");

  livros.forEach((livro) => {
    const disponivel = calcularDisponibilidade(livro);

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${livro.titulo || "Não informado"}</td>
            <td>${livro.autor || "Não informado"}</td>
            <td>${livro.editora || "Não informado"}</td>
            <td>${livro.anoPublicacao || "Não informado"}</td>
            <td>${livro.categoria || "Não informado"}</td>
            <td>${livro.isbn || "Não informado"}</td>
            <td>
                <span class="status-${
                  disponivel ? "disponivel" : "indisponivel"
                }">
                    ${disponivel ? "Disponível" : "Indisponível"}
                </span>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function calcularDisponibilidade(livro) {
  const exemplares = Number(livro.exemplares_disponiveis);
  console.log(`📚 ${livro.titulo}: ${exemplares} exemplares disponíveis`);
  return exemplares > 0;
}

function showError(message) {
  console.error("Erro:", message);

  const errorDiv = document.createElement("div");
  errorDiv.className = "alert alert-error";
  errorDiv.textContent = message;

  const consultaSection = document.querySelector(".consulta-section");
  if (consultaSection) {
    const searchBar = consultaSection.querySelector(".search-bar");
    if (searchBar) {
      consultaSection.insertBefore(errorDiv, searchBar.nextSibling);
    } else {
      consultaSection.insertBefore(errorDiv, consultaSection.firstChild);
    }

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}
