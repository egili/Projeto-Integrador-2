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

    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();

        registerBtn.disabled = true;
        btnText.textContent = 'Cadastrando...';
        setTimeout(() => {
            
            const bookData = {
                title: document.getElementById('bookTitle').value,
                author: document.getElementById('authorName').value,
                publisher: document.getElementById('publisher').value
            };
            
            console.log("DADOS CADASTRADOS (Simulação):", bookData);

            cadastroFormDiv.style.display = 'none';
            step2SuccessDiv.style.display = 'block';

        }, 1500);
    });

    checkFormValidity();
});