document.addEventListener('DOMContentLoaded', () => {
    // Captura o ID do livro da URL
    const params = new URLSearchParams(window.location.search);
    const idLivro = params.get('id');

    if (!idLivro) {
        document.querySelector('main').innerHTML = '<p class="error">ID do Livro não fornecido na URL.</p>';
        return;
    }

    // Seleção dos elementos DOM
    const loadingMessage = document.getElementById('loading-message');
    const edicaoForm = document.getElementById('edicao-form');
    const livroTituloDisplay = document.getElementById('livro-titulo-display');
    const livroIdDisplay = document.getElementById('livro-id-display');
    const exemplaresList = document.getElementById('exemplares-list');
    const addExemplaresBtn = document.getElementById('add-exemplares-btn');
    const qtdExemplaresAddInput = document.getElementById('qtd-exemplares-add');
    
    // -----------------------------------------
    // Funções de Carregamento
    // -----------------------------------------
    async function carregarDadosLivro() {
        try {
            const livro = await BibliotecaAPI.buscarLivroPorId(idLivro);

            if (!livro) {
                loadingMessage.textContent = 'Livro não encontrado.';
                return;
            }
            
            // 1. Preencher Formulário Principal com os dados atuais
            livroTituloDisplay.textContent = livro.titulo;
            livroIdDisplay.textContent = `ID: ${livro.id}`;
            document.getElementById('titulo').value = livro.titulo;
            document.getElementById('isbn').value = livro.isbn || '';
            document.getElementById('autor').value = livro.autor;
            document.getElementById('editora').value = livro.editora;
            document.getElementById('anoPublicacao').value = livro.anoPublicacao;
            document.getElementById('categoria').value = livro.categoria;

            // --- AÇÃO CRÍTICA: Esconder loading e mostrar formulário principal ---
            loadingMessage.classList.add('hidden'); // Assume que .hidden existe no CSS
            edicaoForm.classList.remove('hidden');
            // -------------------------------------------------------------------
            
            // 2. Carregar Inventário de Exemplares
            carregarExemplares();

        } catch (error) {
            loadingMessage.textContent = `Erro ao carregar dados: ${error.message}`;
            console.error(error);
        }
    }
    
    async function carregarExemplares() {
        // Mensagem de loading da área de exemplares
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
    
    // -----------------------------------------
    // Funções de Ação Global (Remover Exemplar Unitário)
    // -----------------------------------------
    
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
                carregarExemplares(); // Recarrega a lista
            } else {
                showError(`Erro ao remover exemplar: ${result.error || 'Erro desconhecido.'}`);
            }

        } catch (err) {
            showError(`Erro na comunicação com a API: ${err.message}`);
            console.error('Erro ao remover exemplar:', err);
        }
    }
    
    // -----------------------------------------
    // Eventos do Formulário
    // -----------------------------------------

    // 1. Adicionar Múltiplos Exemplares
    addExemplaresBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const quantidade = parseInt(qtdExemplaresAddInput.value);
        
        if (isNaN(quantidade) || quantidade < 1) {
            alert('A quantidade a adicionar deve ser um número inteiro maior que zero.');
            return;
        }

        try {
            // Usa o método cadastrarExemplar, que agora suporta 'quantidade' no body
            const result = await BibliotecaAPI.cadastrarExemplar({ idLivro: idLivro, quantidade });
            
            if (result.success) {
                showSuccess(result.message || `Adicionadas ${result.data.totalCriados} cópias.`);
                qtdExemplaresAddInput.value = 1; // Reseta para 1
                carregarExemplares(); // Recarrega a lista
            } else {
                showError(`Erro ao adicionar exemplares: ${result.error || 'Erro desconhecido.'}`);
            }

        } catch (error) {
            showError(`Erro na comunicação com a API: ${error.message}`);
        }
    });

    // 2. Salvar Edição do Livro
    edicaoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(edicaoForm);
        const isbnValue = formData.get('isbn');
        
        // Aplica a mesma limpeza do Controller de cadastro (Garantia de integridade do Front)
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
                carregarDadosLivro(); // Recarrega os dados para atualizar o título na tela
            } else {
                showError(`Erro de validação ou servidor: ${result.error || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            showError(`Erro ao comunicar com a API: ${error.message}`);
        }
    });
    
    // Inicia o carregamento dos dados
    carregarDadosLivro();
});