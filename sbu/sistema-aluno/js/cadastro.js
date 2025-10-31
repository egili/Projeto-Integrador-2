document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registration-form');
    
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('fullName').value.trim();
            const ra = document.getElementById('ra').value.trim();
            
            // Validações básicas
            if (!nome) {
                showError('Por favor, digite seu nome completo');
                return;
            }

            if (!ra) {
                showError('Por favor, digite seu RA');
                return;
            }

            if (ra.length < 5) {
                showError('O RA deve ter pelo menos 5 caracteres');
                return;
            }

            const alunoData = {
                nome: nome,
                ra: ra
            };

            const registerBtn = document.getElementById('register-btn');
            if (registerBtn) {
                registerBtn.disabled = true;
                registerBtn.querySelector('.btn-text').textContent = 'Cadastrando...';
            }
            
            try {
                const result = await BibliotecaAPI.cadastrarAluno(alunoData);
                
                // Se chegou aqui sem exceção, o cadastro foi bem-sucedido
                // Mostrar tela de sucesso
                document.getElementById('step1-form').classList.remove('active');
                document.getElementById('step2-success').classList.add('active');
                
                // Preencher dados de sucesso
                document.getElementById('success-nome').textContent = nome;
                document.getElementById('success-ra').textContent = ra;
                
                // Configurar botões de sucesso
                document.getElementById('home-btn').addEventListener('click', function() {
                    window.location.href = '../index.html';
                });
                
                document.getElementById('new-cadastro-btn').addEventListener('click', function() {
                    document.getElementById('step2-success').classList.remove('active');
                    document.getElementById('step1-form').classList.add('active');
                    registrationForm.reset();
                });
                
            } catch (error) {
                // Trata erros específicos
                if (error.message.includes('já cadastrado')) {
                    showError('Este RA já está cadastrado no sistema.');
                } else {
                    showError('Erro ao cadastrar: ' + error.message);
                }
            } finally {
                if (registerBtn) {
                    registerBtn.disabled = false;
                    registerBtn.querySelector('.btn-text').textContent = 'Cadastrar';
                }
            }
        });
    }

    // Validação em tempo real do RA
    const raInput = document.getElementById('ra');
    if (raInput) {
        raInput.addEventListener('input', function() {
            // Permite apenas números e letras no RA
            this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
        });
    }
});