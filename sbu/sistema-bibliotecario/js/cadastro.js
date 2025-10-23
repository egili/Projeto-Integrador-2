// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// API functions
const api = {
    cadastrarLivro: async (livro) => {
        try {
            const response = await fetch(`${API_BASE_URL}/livros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(livro)
            });
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Erro ao cadastrar livro');
            }
        } catch (error) {
            console.error('Erro ao cadastrar livro:', error);
            throw error;
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registration-form');
    const registerBtn = document.getElementById('register-btn');
    const formFields = registrationForm.querySelectorAll('.form-input[required]');
    
    const cadastroFormDiv = document.getElementById('cadastro-form');
    const step2SuccessDiv = document.getElementById('step2-success');
    const btnText = registerBtn.querySelector('.btn-text');
    const spinner = registerBtn.querySelector('.spinner');

    function checkFormValidity() {
        let allValid = true;
        formFields.forEach(input => {
            if (input.hasAttribute('required') && input.value.trim() === '') {
                allValid = false;
            }
        });
        registerBtn.disabled = !allValid;
    }

    formFields.forEach(input => {
        input.addEventListener('input', checkFormValidity);
    });

    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        registerBtn.disabled = true;
        btnText.textContent = 'Cadastrando...';
        spinner.style.display = 'inline-block';

        try {
            const bookData = {
                titulo: document.getElementById('bookTitle').value.trim(),
                autor: document.getElementById('authorName').value.trim(),
                editora: document.getElementById('publisher').value.trim(),
                anoPublicacao: new Date().getFullYear(), // Ano atual como padrão
                isbn: null // Pode ser adicionado posteriormente
            };
            
            const result = await api.cadastrarLivro(bookData);
            console.log("Livro cadastrado com sucesso:", result);

            cadastroFormDiv.style.display = 'none';
            step2SuccessDiv.style.display = 'block';

        } catch (error) {
            alert('Erro ao cadastrar livro: ' + error.message);
            registerBtn.disabled = false;
            btnText.textContent = 'Cadastrar livro';
            spinner.style.display = 'none';
        }
    });

    checkFormValidity();
});