// Configuração da API
const API_BASE_URL = 'http://localhost:3001/api';

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
            const livroData = {
                titulo: document.getElementById('bookTitle').value,
                autor: document.getElementById('authorName').value,
                editora: document.getElementById('publisher').value,
                isbn: document.getElementById('isbn').value || null,
                anoPublicacao: parseInt(document.getElementById('anoPublicacao').value)
            };

            // Cadastrar livro
            const livroResponse = await fetch(`${API_BASE_URL}/livros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(livroData)
            });

            const livroResult = await livroResponse.json();

            if (!livroResult.success) {
                throw new Error(livroResult.error || 'Erro ao cadastrar livro');
            }

            // Cadastrar exemplares
            const quantidadeExemplares = parseInt(document.getElementById('quantidadeExemplares').value);
            const exemplaresPromises = [];

            for (let i = 1; i <= quantidadeExemplares; i++) {
                const codigoExemplar = `EX-${livroResult.data.id.toString().padStart(3, '0')}-${i.toString().padStart(2, '0')}`;
                
                const exemplarData = {
                    idLivro: livroResult.data.id,
                    codigo: codigoExemplar,
                    observacoes: `Exemplar ${i} de ${quantidadeExemplares}`,
                    data_aquisicao: new Date().toISOString().split('T')[0]
                };

                exemplaresPromises.push(
                    fetch(`${API_BASE_URL}/exemplares`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(exemplarData)
                    })
                );
            }

            const exemplaresResponses = await Promise.all(exemplaresPromises);
            const exemplaresResults = await Promise.all(exemplaresResponses.map(res => res.json()));

            // Verificar se todos os exemplares foram cadastrados
            const exemplaresComErro = exemplaresResults.filter(result => !result.success);
            if (exemplaresComErro.length > 0) {
                console.warn('Alguns exemplares não foram cadastrados:', exemplaresComErro);
            }

            console.log("LIVRO E EXEMPLARES CADASTRADOS:", {
                livro: livroResult.data,
                exemplares: exemplaresResults.length
            });

            cadastroFormDiv.style.display = 'none';
            step2SuccessDiv.style.display = 'block';

        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            alert('Erro ao cadastrar livro: ' + error.message);
            
            registerBtn.disabled = false;
            btnText.textContent = 'Cadastrar livro';
            spinner.style.display = 'none';
        }
    });

    checkFormValidity();
});