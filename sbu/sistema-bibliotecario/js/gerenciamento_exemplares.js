// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    const exemplarForm = document.getElementById('exemplar-form');
    const cadastrarBtn = document.getElementById('cadastrar-exemplar-btn');
    const formFields = exemplarForm.querySelectorAll('.form-input[required]');
    const exemplaresContainer = document.getElementById('exemplares-container');
    const successMessage = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    const closeSuccessBtn = document.getElementById('close-success');

    // Carregar livros no select
    async function carregarLivros() {
        try {
            const response = await fetch(`${API_BASE_URL}/livros/todos`);
            const result = await response.json();
            
            const livroSelect = document.getElementById('livroSelect');
            livroSelect.innerHTML = '<option value="">Selecione um livro</option>';
            
            if (result.success) {
                result.data.forEach(livro => {
                    const option = document.createElement('option');
                    option.value = livro.id;
                    option.textContent = `${livro.titulo} - ${livro.autor}`;
                    livroSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar livros:', error);
        }
    }

    // Carregar exemplares
    async function carregarExemplares() {
        try {
            const response = await fetch(`${API_BASE_URL}/exemplares`);
            const result = await response.json();
            
            exemplaresContainer.innerHTML = '';
            
            if (result.success && result.data.length > 0) {
                result.data.forEach(exemplar => {
                    const exemplarDiv = document.createElement('div');
                    exemplarDiv.className = 'exemplar-item';
                    exemplarDiv.innerHTML = `
                        <div class="exemplar-info">
                            <h3>${exemplar.codigo}</h3>
                            <p><strong>Livro:</strong> ${exemplar.livro_titulo}</p>
                            <p><strong>Autor:</strong> ${exemplar.autor}</p>
                            <p><strong>Status:</strong> <span class="status-${exemplar.status}">${exemplar.status}</span></p>
                            <p><strong>Data de Aquisição:</strong> ${new Date(exemplar.data_aquisicao).toLocaleDateString('pt-BR')}</p>
                            ${exemplar.observacoes ? `<p><strong>Observações:</strong> ${exemplar.observacoes}</p>` : ''}
                        </div>
                        <div class="exemplar-actions">
                            <button onclick="editarExemplar(${exemplar.id})" class="btn-secondary">Editar</button>
                            <button onclick="alterarStatusExemplar(${exemplar.id}, '${exemplar.status}')" class="btn-secondary">Alterar Status</button>
                            ${exemplar.status !== 'emprestado' ? `<button onclick="excluirExemplar(${exemplar.id})" class="btn-danger">Excluir</button>` : ''}
                        </div>
                    `;
                    exemplaresContainer.appendChild(exemplarDiv);
                });
            } else {
                exemplaresContainer.innerHTML = '<p>Nenhum exemplar encontrado.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar exemplares:', error);
            exemplaresContainer.innerHTML = '<p>Erro ao carregar exemplares.</p>';
        }
    }

    // Verificar validade do formulário
    function checkFormValidity() {
        let allValid = true;
        formFields.forEach(input => {
            if (input.hasAttribute('required') && input.value.trim() === '') {
                allValid = false;
            }
        });
        cadastrarBtn.disabled = !allValid;
    }

    // Event listeners
    formFields.forEach(input => {
        input.addEventListener('input', checkFormValidity);
    });

    // Definir data atual como padrão
    document.getElementById('dataAquisicao').value = new Date().toISOString().split('T')[0];

    // Submit do formulário
    exemplarForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        cadastrarBtn.disabled = true;
        const btnText = cadastrarBtn.querySelector('.btn-text');
        const spinner = cadastrarBtn.querySelector('.spinner');
        
        btnText.textContent = 'Cadastrando...';
        spinner.style.display = 'inline-block';

        try {
            const exemplarData = {
                idLivro: parseInt(document.getElementById('livroSelect').value),
                codigo: document.getElementById('codigoExemplar').value,
                observacoes: document.getElementById('observacoes').value || null,
                data_aquisicao: document.getElementById('dataAquisicao').value
            };
            
            const response = await fetch(`${API_BASE_URL}/exemplares`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(exemplarData)
            });

            const result = await response.json();

            if (result.success) {
                successText.textContent = 'Exemplar cadastrado com sucesso!';
                successMessage.style.display = 'block';
                exemplarForm.reset();
                document.getElementById('dataAquisicao').value = new Date().toISOString().split('T')[0];
                carregarExemplares();
            } else {
                alert('Erro ao cadastrar exemplar: ' + result.error);
            }

        } catch (error) {
            console.error('Erro ao cadastrar exemplar:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            cadastrarBtn.disabled = false;
            btnText.textContent = 'Cadastrar Exemplar';
            spinner.style.display = 'none';
        }
    });

    // Fechar mensagem de sucesso
    closeSuccessBtn.addEventListener('click', function() {
        successMessage.style.display = 'none';
    });

    // Inicialização
    carregarLivros();
    carregarExemplares();
    checkFormValidity();
});

// Funções globais para ações dos exemplares
async function editarExemplar(id) {
    // Implementar edição de exemplar
    alert('Funcionalidade de edição será implementada em breve.');
}

async function alterarStatusExemplar(id, statusAtual) {
    const novoStatus = prompt(`Status atual: ${statusAtual}\nNovo status (disponivel, emprestado, manutencao):`, statusAtual);
    
    if (novoStatus && novoStatus !== statusAtual && ['disponivel', 'emprestado', 'manutencao'].includes(novoStatus)) {
        try {
            const response = await fetch(`${API_BASE_URL}/exemplares/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: novoStatus })
            });

            const result = await response.json();

            if (result.success) {
                alert('Status atualizado com sucesso!');
                location.reload();
            } else {
                alert('Erro ao atualizar status: ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao conectar com o servidor.');
        }
    }
}

async function excluirExemplar(id) {
    if (confirm('Tem certeza que deseja excluir este exemplar?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/exemplares/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                alert('Exemplar excluído com sucesso!');
                location.reload();
            } else {
                alert('Erro ao excluir exemplar: ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao excluir exemplar:', error);
            alert('Erro ao conectar com o servidor.');
        }
    }
}