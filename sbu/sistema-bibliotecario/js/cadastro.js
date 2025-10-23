// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

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
                titulo: document.getElementById('bookTitle').value,
                autor: document.getElementById('authorName').value,
                editora: document.getElementById('publisher').value,
                isbn: document.getElementById('isbn').value || null,
                anoPublicacao: parseInt(document.getElementById('anoPublicacao').value)
            };
            
            const response = await fetch(`${API_BASE_URL}/livros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });

            const result = await response.json();

            if (result.success) {
                cadastroFormDiv.style.display = 'none';
                step2SuccessDiv.style.display = 'block';
            } else {
                alert('Erro ao cadastrar livro: ' + result.error);
                registerBtn.disabled = false;
                btnText.textContent = 'Cadastrar livro';
                spinner.style.display = 'none';
            }

        } catch (error) {
            console.error('Erro ao cadastrar livro:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
            registerBtn.disabled = false;
            btnText.textContent = 'Cadastrar livro';
            spinner.style.display = 'none';
        }
    });

    checkFormValidity();
});