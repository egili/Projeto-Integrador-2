document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const idLivro = params.get('id');

    if (!idLivro) {
        document.querySelector('main').innerHTML = '<p class="error">ID do Livro não fornecido na URL.</p>';
        return;
    }

    const loadingMessage = document.getElementById('loading-message');
    const edicaoForm = document.getElementById('edicao-form');
    const livroTituloDisplay = document.getElementById('livro-titulo-display');
    const livroIdDisplay = document.getElementById('livro-id-display');
    const exemplaresList = document.getElementById('exemplares-list');
    const addExemplaresBtn = document.getElementById('add-exemplares-btn');
    const qtdExemplaresAddInput = document.getElementById('qtd-exemplares-add');
    
    async function carregarDadosLivro() {
        try {
            const livro = await BibliotecaAPI.buscarLivroPorId(idLivro);

            if (!livro) {
                loadingMessage.textContent = 'Livro não encontrado.';
                return;
            }
            
            livroTituloDisplay.textContent = livro.titulo;
            livroIdDisplay.textContent = `ID: ${livro.id}`;
            document.getElementById('titulo').value = livro.titulo;
            document.getElementById('isbn').value = livro.isbn || '';
            document.getElementById('autor').value = livro.autor;
            document.getElementById('editora').value = livro.editora;
            document.getElementById('anoPublicacao').value = livro.anoPublicacao;
            document.getElementById('categoria').value = livro.categoria;

            loadingMessage.classList.add('hidden');
            edicaoForm.classList.remove('hidden');
            
            carregarExemplares();

        } catch (error) {
            loadingMessage.textContent = `Erro ao carregar dados: ${error.message}`;
            console.error(error);
        }
    }
    
    async function carregarExemplares() {
        exemplaresList.innerHTML = '<p>Carregando inventário de exemplares...</p>'; 
        try {
            const exemplares = await BibliotecaAPI.listarExemplaresPorLivro(idLivro);
            renderizarExemplares(exemplares);
        } catch (error) {
            exemplaresList.innerHTML = `<p class="error">Erro ao carregar exemplares: ${error.message}</p>`;
        }
    }

    function renderizarExemplares(exemplares) {
        if (!exemplares || exemplares.length === 0) {
            exemplaresList.innerHTML = '<p>Nenhum exemplar cadastrado para este livro.</p>';
            return;
        }

        let html = `
            <table class="table-ranking">
                <thead>
                    <tr>
                        <th>ID Exemplar</th>
                        <th>Status</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        exemplares.forEach(e => {
            const isEmprestado = e.status === 'emprestado';
            
            html += `
                <tr>
                    <td>${e.id}</td>
                    <td><span class="${isEmprestado ? 'status-red' : 'status-green'}">${e.status.toUpperCase()}</span></td>
                    <td>
                        <button class="btn-secondary-editar" 
                            ${isEmprestado ? 'disabled title="Exemplar não pode ser removido enquanto estiver emprestado"' : ''}
                            onclick="removerExemplarUnitario(${e.id}, '${e.status}')">
                            Remover
                        </button>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        exemplaresList.innerHTML = html;
    }
    
    window.removerExemplarUnitario = async function(idExemplar, status) {
        if (status === 'emprestado') {
             showError('Não é possível remover um exemplar que está emprestado.');
             return;
        }
        if (!confirm(`Tem certeza que deseja remover o exemplar ID ${idExemplar} de forma permanente?`)) {
            return;
        }

        try {
            const result = await BibliotecaAPI.removerExemplar(idExemplar); 

            if (result.success) {
                showSuccess(result.message || `Exemplar ID ${idExemplar} removido.`);
                carregarExemplares();
            } else {
                showError(`Erro ao remover exemplar: ${result.error || 'Erro desconhecido.'}`);
            }

        } catch (err) {
            showError(`Erro na comunicação com a API: ${err.message}`);
            console.error('Erro ao remover exemplar:', err);
        }
    }
    
    addExemplaresBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const quantidade = parseInt(qtdExemplaresAddInput.value);
        
        if (isNaN(quantidade) || quantidade < 1) {
            alert('A quantidade a adicionar deve ser um número inteiro maior que zero.');
            return;
        }

        try {
            const result = await BibliotecaAPI.cadastrarExemplar({ idLivro: idLivro, quantidade });
            
            if (result.success) {
                showSuccess(result.message || `Adicionadas ${result.data.totalCriados} cópias.`);
                qtdExemplaresAddInput.value = 1;
                carregarExemplares();
            } else {
                showError(`Erro ao adicionar exemplares: ${result.error || 'Erro desconhecido.'}`);
            }

        } catch (error) {
            showError(`Erro na comunicação com a API: ${error.message}`);
        }
    });

    edicaoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(edicaoForm);
        const isbnValue = formData.get('isbn');
        
        const normalizedIsbn = isbnValue ? String(isbnValue).replace(/[^0-9]/g, '') : null;

        const livroData = {
            titulo: formData.get('titulo'),
            isbn: normalizedIsbn,
            autor: formData.get('autor'),
            editora: formData.get('editora'),
            anoPublicacao: parseInt(formData.get('anoPublicacao')),
            categoria: formData.get('categoria'),
        };
        
        try {
            const result = await BibliotecaAPI.atualizarLivro(idLivro, livroData);
            
            if (result.success) {
                showSuccess('Dados do livro atualizados com sucesso!');
                carregarDadosLivro();
            } else {
                showError(`Erro de validação ou servidor: ${result.error || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            showError(`Erro ao comunicar com a API: ${error.message}`);
        }
    });
    
    carregarDadosLivro();
});