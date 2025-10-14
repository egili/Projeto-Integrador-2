// Simula um "banco de dados" temporário
const mockLeitores = [
  { nome: "Eliseu Pereira Gili", ra: "25009281", livrosLidos: 4 },
  { nome: "Eduardo Fagundes da Silva", ra: "25008024", livrosLidos: 8 },
  { nome: "Kaue Rodrigues Seixas", ra: "23011884", livrosLidos: 15 },
  { nome: "Lucas Athanasio Bueno de Andrade", ra: "25002731", livrosLidos: 25 },
  { nome: "Pietra Façanha Bortolatto", ra: "25002436", livrosLidos: 6 },
];

// Função que determina a pontuacao
function obterPontuacao(qtdLivros) {
  if (qtdLivros <= 5)
    return { nivel: "Leitor Iniciante", classe: "tag-iniciante" };
  if (qtdLivros <= 10)
    return { nivel: "Leitor Regular", classe: "tag-regular" };
  if (qtdLivros <= 20) return { nivel: "Leitor Ativo", classe: "tag-ativo" };
  return { nivel: "Leitor Extremo", classe: "tag-extremo" };
}

// Busca e exibe o resultado
function buscarLeitor() {
  const termo = document
    .getElementById("campoBuscaLeitor")
    .value.trim()
    .toLowerCase();
  const resultadoDiv = document.getElementById("resultadoPontuacao");

  if (!termo) {
    resultadoDiv.innerHTML = "<p>Por favor, digite um nome ou RA.</p>";
    return;
  }

  const leitor = mockLeitores.find(
    (l) => l.nome.toLowerCase().includes(termo) || l.ra.includes(termo)
  );

  if (!leitor) {
    resultadoDiv.innerHTML = "<p>Nenhum leitor encontrado.</p>";
    return;
  }

  const pontuacao = obterPontuacao(leitor.livrosLidos);

  resultadoDiv.innerHTML = `
    <h3>${leitor.nome}</h3>
    <p><strong>RA:</strong> ${leitor.ra}</p>
    <p><strong>Livros lidos no semestre:</strong> ${leitor.livrosLidos}</p>
    <span class="pontuacao-tag ${pontuacao.classe}">${pontuacao.nivel}</span>
  `;
}

// Inicializa eventos
document.addEventListener("DOMContentLoaded", () => {
  const btnBuscar = document.getElementById("btnBuscarLeitor");
  const campoBusca = document.getElementById("campoBuscaLeitor");

  btnBuscar.addEventListener("click", buscarLeitor);

  campoBusca.addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarLeitor();
  });
});
