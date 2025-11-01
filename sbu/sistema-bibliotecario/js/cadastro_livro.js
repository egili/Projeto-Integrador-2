document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registration-form');
    const categoriaSelect = document.getElementById('categoria');
    const outrosCategoriaGroup = document.getElementById('outros-categoria-group');

    if (categoriaSelect && outrosCategoriaGroup) {
        categoriaSelect.addEventListener('change', function() {
            if (this.value === 'Outros') {
                outrosCategoriaGroup.classList.remove('hidden');
            } else {
                outrosCategoriaGroup.classList.add('hidden');
            }
        });
    }

    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(registrationForm);
            const livroData = {
                titulo: formData.get('titulo'),
                isbn: formData.get('isbn'),
                autor: formData.get('autor'),
                editora: formData.get('editora'),
                anoPublicacao: parseInt(formData.get('anoPublicacao')),
                categoria: formData.get('categoria') === 'Outros' 
                    ? (formData.get('outros-categoria') || 'Outros')
                    : formData.get('categoria'),
                numeroExemplares: parseInt(formData.get('numeroExemplares'))
            };

            const registerBtn = document.getElementById('register-btn');
            if (registerBtn) {
                registerBtn.disabled = true;
                registerBtn.querySelector('.btn-text').textContent = 'Cadastrando...';
            }
            
            try {
                const result = await BibliotecaAPI.cadastrarLivro(livroData);
                
                if (result.success) {
                    document.getElementById('cadastro-form').style.display = 'none';
                    document.getElementById('step2-success').style.display = 'block';
                    
                    document.getElementById('new-register-btn').addEventListener('click', function() {
                        document.getElementById('step2-success').style.display = 'none';
                        document.getElementById('cadastro-form').style.display = 'block';
                        registrationForm.reset();
                        outrosCategoriaGroup.classList.add('hidden');
                    });
                } else {
                    showError(result.error);
                }
            } catch (error) {
                showError('Erro ao cadastrar livro: ' + error.message);
            } finally {
                if (registerBtn) {
                    registerBtn.disabled = false;
                    registerBtn.querySelector('.btn-text').textContent = 'Cadastrar Livro';
                }
            }
        });
    }
});