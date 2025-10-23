// Configuração da API
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Redireciona o usuário para a página especificada.
 * @param {string} page - O caminho para a página de destino.
 */
function navigateTo(page) {
  window.location.href = page;
}

document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENTOS DO DOM ---
  const form = document.getElementById("registration-form");
  const fullNameInput = document.getElementById("fullName");
  const raInput = document.getElementById("ra");
  const registerBtn = document.getElementById("register-btn");

  // Elementos de erro
  const raError = document.getElementById("ra-error");

  // Etapas
  const step1 = document.getElementById("step1-form");
  const step2 = document.getElementById("step2-success");

  // Elementos da Etapa 2
  const homeBtn = document.getElementById("home-btn");

  // --- FUNÇÕES DE VALIDAÇÃO ---
  const validators = {
    isValidRA: (ra) => /^\d{8}$/.test(ra),
    areAllFieldsFilled: () =>
      fullNameInput.value.trim() &&
      raInput.value.trim(),
  };

  function validateForm() {
    // Validação de RA
    const ra = raInput.value.trim();
    let isRAValid = true;
    if (ra) {
      if (!validators.isValidRA(ra)) {
        raError.textContent = "O RA deve ter exatamente 8 dígitos numéricos.";
        raError.style.display = "block";
        isRAValid = false;
      } else {
        raError.style.display = "none";
      }
    }

    // Habilita ou desabilita o botão de cadastro
    if (validators.areAllFieldsFilled() && isRAValid) {
      registerBtn.disabled = false;
    } else {
      registerBtn.disabled = true;
    }
  }

  // --- EVENT LISTENERS ---

  // Adiciona validadores a todos os campos do formulário
  [fullNameInput, raInput].forEach((input) => {
    input.addEventListener("input", validateForm);
  });

  // Submissão do formulário de cadastro
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ativa o spinner e desativa o botão
    registerBtn.disabled = true;
    registerBtn.querySelector(".btn-text").textContent = "Cadastrando...";
    registerBtn.querySelector(".spinner").style.display = "inline-block";

    try {
      const alunoData = {
        nome: fullNameInput.value.trim(),
        ra: raInput.value.trim()
      };

      const response = await fetch(`${API_BASE_URL}/alunos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alunoData)
      });

      const result = await response.json();

      if (result.success) {
        step1.classList.remove("active");
        step2.classList.add("active");
      } else {
        throw new Error(result.error || 'Erro ao cadastrar aluno');
      }

    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao cadastrar aluno: ' + error.message);
      
      registerBtn.disabled = false;
      registerBtn.querySelector(".btn-text").textContent = "Cadastrar";
      registerBtn.querySelector(".spinner").style.display = "none";
    }
  });

  // Redirecionamento para a página inicial
  homeBtn.addEventListener("click", () => {
    window.location.href = "../index.html";
  });
});
