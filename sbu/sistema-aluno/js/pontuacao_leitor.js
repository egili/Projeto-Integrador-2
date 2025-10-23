// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// API real
const api = {
  buscarAluno: async (ra) => {
    try {
      const response = await fetch(`${API_BASE_URL}/alunos/${ra}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Aluno não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      throw error;
    }
  },

  obterClassificacao: async (ra) => {
    try {
      const response = await fetch(`${API_BASE_URL}/classificacao/${ra}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Classificação não encontrada');
      }
    } catch (error) {
      console.error('Erro ao obter classificação:', error);
      throw error;
    }
  }
};

// Função que determina a classe CSS baseada no código da classificação
function obterClasseCSS(codigo) {
  switch (codigo) {
    case 'EL': return 'tag-extremo';
    case 'BL': return 'tag-ativo';
    case 'RL': return 'tag-regular';
    case 'ML': return 'tag-iniciante';
    case 'NL': return 'tag-iniciante';
    default: return 'tag-regular';
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
    // Buscar aluno
    const aluno = await api.buscarAluno(termo);
    
    // Buscar classificação
    let classificacao = null;
    try {
      classificacao = await api.obterClassificacao(termo);
    } catch (error) {
      console.log('Classificação não encontrada para este aluno');
    }

    if (classificacao) {
      const classeCSS = obterClasseCSS(classificacao.codigo);
      
      resultadoDiv.innerHTML = `
        <h3>${aluno.nome}</h3>
        <p><strong>RA:</strong> ${aluno.ra}</p>
        <p><strong>Classificação:</strong> ${classificacao.descricao}</p>
        <p><strong>Semestre:</strong> ${classificacao.semestre_descricao}</p>
        <span class="pontuacao-tag ${classeCSS}">${classificacao.descricao}</span>
      `;
    } else {
      resultadoDiv.innerHTML = `
        <h3>${aluno.nome}</h3>
        <p><strong>RA:</strong> ${aluno.ra}</p>
        <p><strong>Status:</strong> Sem classificação no semestre atual</p>
        <span class="pontuacao-tag tag-iniciante">Não Classificado</span>
      `;
    }

  } catch (error) {
    if (error.message.includes('não encontrado')) {
      resultadoDiv.innerHTML = "<p>Aluno não encontrado. Verifique o RA informado.</p>";
    } else {
      resultadoDiv.innerHTML = "<p>Erro ao buscar informações. Tente novamente.</p>";
    }
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
