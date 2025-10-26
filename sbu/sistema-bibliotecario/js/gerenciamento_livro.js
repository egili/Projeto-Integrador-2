document.addEventListener('DOMContentLoaded', function() {
    // Configurar abas
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Carregar dados iniciais
    carregarTodosLivros();

    // Configurar busca
    const searchButton = document.getElementById('search-button');
    const clearSearch = document.getElementById('clear-search');
    const searchInput = document.getElementById('search-input');

    if (searchButton) {
        searchButton.addEventListener('click', buscarLivros);
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', function() {
            searchInput.value = '';
            carregarTodosLivros();
            clearSearch.style.display = 'none';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarLivros();
            }
        });
    }
});

function switchTab(tabId) {
    // Atualizar botões das abas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Atualizar conteúdo das abas
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';

    // Carregar dados específicos da aba
    switch(tabId) {
        case 'todos-livros':
            carregarTodosLivros();
            break;
        case 'pendentes':
            carregarEmprestimosPendentes();
            break;
        case 'historico':
            carregarHistoricoEmprestimos();
            break;
    }
}

async function carregarTodosLivros() {
    try {
        const result = await BibliotecaAPI.listarTodosLivros();
        
        if (result.success) {
            exibirTodosLivros(result.data);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Erro ao carregar livros: ' + error.message);
    }
}

async function carregarEmprestimosPendentes() {
    try {
        const result = await BibliotecaAPI.listarEmprestimosPendentes();
        
        if (result.success) {
            exibirEmprestimosPendentes(result.data);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Erro ao carregar empréstimos pendentes: ' + error.message);
    }
}

async function carregarHistoricoEmprestimos() {
    try {
        const result = await BibliotecaAPI.listarHistoricoEmprestimos();
        
        if (result.success) {
            exibirHistoricoEmprestimos(result.data);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Erro ao carregar histórico: ' + error.message);
    }
}

async function buscarLivros() {
    const termo = document.getElementById('search-input').value;
    
    if (!termo) {
        carregarTodosLivros();
        return;
    }

    try {
        const result = await BibliotecaAPI.buscarLivros(termo);
        
        if (result.success) {
            exibirTodosLivros(result.data);
            document.getElementById('clear-search').style.display = 'inline-block';
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Erro ao buscar livros: ' + error.message);
    }
}

function exibirTodosLivros(livros) {
    const container = document.querySelector('#todos-livros .data-view');
    
    if (livros.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum livro encontrado</p>';
        return;
    }

    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Editora</th>
                    <th>Ano</th>
                    <th>ISBN</th>
                    <th>Exemplares</th>
                    <th>Disponíveis</th>
                </tr>
            </thead>
            <tbody>
                ${livros.map(livro => `
                    <tr>
                        <td>${livro.titulo}</td>
                        <td>${livro.autor}</td>
                        <td>${livro.editora}</td>
                        <td>${livro.anoPublicacao}</td>
                        <td>${livro.isbn || 'N/A'}</td>
                        <td>${livro.total_exemplares || 0}</td>
                        <td>${livro.exemplares_disponiveis || 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function exibirEmprestimosPendentes(emprestimos) {
    const container = document.querySelector('#pendentes .data-view');
    
    if (emprestimos.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum empréstimo pendente</p>';
        return;
    }

    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Aluno</th>
                    <th>RA</th>
                    <th>Livro</th>
                    <th>Exemplar</th>
                    <th>Data Empréstimo</th>
                </tr>
            </thead>
            <tbody>
                ${emprestimos.map(emp => `
                    <tr>
                        <td>${emp.aluno_nome}</td>
                        <td>${emp.ra}</td>
                        <td>${emp.titulo}</td>
                        <td>${emp.codigo_exemplar}</td>
                        <td>${formatDate(emp.dataEmprestimo)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function exibirHistoricoEmprestimos(historico) {
    const container = document.querySelector('#historico .data-view');
    
    if (historico.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum registro no histórico</p>';
        return;
    }

    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Aluno</th>
                    <th>RA</th>
                    <th>Livro</th>
                    <th>Exemplar</th>
                    <th>Data Empréstimo</th>
                    <th>Data Devolução</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${historico.map(emp => `
                    <tr>
                        <td>${emp.aluno_nome}</td>
                        <td>${emp.ra}</td>
                        <td>${emp.titulo}</td>
                        <td>${emp.codigo_exemplar}</td>
                        <td>${formatDate(emp.dataEmprestimo)}</td>
                        <td>${emp.dataDevolucaoReal ? formatDate(emp.dataDevolucaoReal) : 'Pendente'}</td>
                        <td>
                            <span class="status ${emp.dataDevolucaoReal ? 'devolvido' : 'pendente'}">
                                ${emp.dataDevolucaoReal ? 'Devolvido' : 'Pendente'}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}