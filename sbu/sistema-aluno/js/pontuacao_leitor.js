// Função que determina a classe CSS baseado no código
function obterClassePontuacao(codigo) {
  switch(codigo) {
    case 'INICIANTE':
      return 'tag-iniciante';
    case 'REGULAR':
      return 'tag-regular';
    case 'ATIVO':
      return 'tag-ativo';
    case 'EXTREMO':
      return 'tag-extremo';
    default:
      return 'tag-iniciante';
  }
}

// Busca e exibe o resultado
async function buscarLeitor() {
  const termo = document
    .getElementById("campoBuscaLeitor")
    .value.trim();
  const resultadoDiv = document.getElementById("resultadoPontuacao");

  if (!termo) {
    resultadoDiv.innerHTML = "<p>Por favor, digite um RA.</p>";
    return;
  }

  resultadoDiv.innerHTML = "<p>Buscando informações...</p>";

  try {
    const aluno = await api.buscarAluno(termo);
    const classificacao = await api.obterClassificacao(termo);

    const classe = obterClassePontuacao(classificacao.codigo);

    resultadoDiv.innerHTML = `
      <h3>${aluno.nome}</h3>
      <p><strong>RA:</strong> ${aluno.ra}</p>
      <p><strong>Livros lidos no semestre:</strong> ${classificacao.totalLivros || 0}</p>
      <span class="pontuacao-tag ${classe}">${classificacao.descricao}</span>
    `;
  } catch (error) {
    console.error('Erro ao buscar leitor:', error);
    resultadoDiv.innerHTML = "<p>Aluno não encontrado ou não possui classificação no semestre atual.</p>";
  }
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
