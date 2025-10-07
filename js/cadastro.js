document.addEventListener('DOMContentLoaded', () => {
    // --- SIMULAÇÃO DE DADOS ---
    // Em um sistema real, isso viria de um banco de dados.
    const registeredEmails = ['aluno.existente@puccampinas.edu.br'];
    const CORRECT_VERIFICATION_CODE = '123456';

    // --- ELEMENTOS DO DOM ---
    const form = document.getElementById('registration-form');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerBtn = document.getElementById('register-btn');
    const togglePassword = document.getElementById('togglePassword');

    // Elementos de erro
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirmPassword-error');

    // Etapas
    const step1 = document.getElementById('step1-form');
    const step2 = document.getElementById('step2-code');
    const step3 = document.getElementById('step3-success');
    
    // Elementos da Etapa 2
    const codeForm = document.getElementById('code-form');
    const verificationCodeInput = document.getElementById('verificationCode');
    const verifyBtn = document.getElementById('verify-btn');
    const codeError = document.getElementById('code-error');
    const userEmailDisplay = document.getElementById('user-email-display');
    
    // Elementos da Etapa 3
    const homeBtn = document.getElementById('home-btn');


    // --- FUNÇÕES DE VALIDAÇÃO ---
    const validators = {
        isEmailRegistered: (email) => registeredEmails.includes(email),
        isValidDomain: (email) => email.endsWith('@puccampinas.edu.br'),
        isPasswordStrong: (password) => password.length >= 8,
        doPasswordsMatch: () => passwordInput.value === confirmPasswordInput.value,
        areAllFieldsFilled: () => fullNameInput.value && emailInput.value && passwordInput.value && confirmPasswordInput.value
    };

    function validateForm() {
        // Validação de E-mail
        const email = emailInput.value;
        let isEmailValid = true;
        if (email) {
            if (validators.isEmailRegistered(email)) {
                emailError.textContent = 'Este e-mail já está cadastrado.';
                emailError.style.display = 'block';
                isEmailValid = false;
            } else if (!validators.isValidDomain(email)) {
                emailError.textContent = 'O e-mail deve ser do domínio @puccampinas.edu.br.';
                emailError.style.display = 'block';
                isEmailValid = false;
            } else {
                emailError.style.display = 'none';
            }
        }

        // Validação de Senha
        const password = passwordInput.value;
        let isPasswordValid = true;
        if (password && !validators.isPasswordStrong(password)) {
            passwordError.style.display = 'block';
            isPasswordValid = false;
        } else {
            passwordError.style.display = 'none';
        }

        // Validação de Confirmação de Senha
        const confirmPassword = confirmPasswordInput.value;
        let doPasswordsMatch = true;
        if (confirmPassword && !validators.doPasswordsMatch()) {
            confirmPasswordError.textContent = 'As senhas não coincidem.';
            confirmPasswordError.style.display = 'block';
            doPasswordsMatch = false;
        } else {
            confirmPasswordError.style.display = 'none';
        }

        // Habilita ou desabilita o botão de cadastro
        if (validators.areAllFieldsFilled() && isEmailValid && isPasswordValid && doPasswordsMatch) {
            registerBtn.disabled = false;
        } else {
            registerBtn.disabled = true;
        }
    }

    // --- EVENT LISTENERS ---
    
    // Adiciona validadores a todos os campos do formulário
    [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('input', validateForm);
    });

    // Lógica para mostrar/ocultar senha
    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Submissão do formulário de cadastro (Etapa 1)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Ativa o spinner e desativa o botão
        registerBtn.disabled = true;
        registerBtn.querySelector('.btn-text').style.display = 'none';
        registerBtn.querySelector('.spinner').style.display = 'inline-block';

        // Simula o envio do e-mail (1.5 segundos de espera)
        setTimeout(() => {
            userEmailDisplay.textContent = emailInput.value;
            step1.classList.remove('active');
            step2.classList.add('active');
        }, 1500);
    });

    // Submissão do código de verificação (Etapa 2)
    codeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (verificationCodeInput.value === CORRECT_VERIFICATION_CODE) {
            codeError.style.display = 'none';
            step2.classList.remove('active');
            step3.classList.add('active');
        } else {
            codeError.textContent = 'Código inválido. Tente novamente.';
            codeError.style.display = 'block';
        }
    });

    // Redirecionamento para a página inicial (Etapa 3)
    homeBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
});