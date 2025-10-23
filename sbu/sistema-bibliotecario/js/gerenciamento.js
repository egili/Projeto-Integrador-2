// Configuração da API
const API_BASE_URL = 'http://localhost:3001/api';

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search');

    function initTabs() {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.style.display = 'none');
                
                this.classList.add('active');
                
                const targetPane = document.getElementById(targetTab);
                if (targetPane) {
                    targetPane.style.display = 'block';
                    targetPane.classList.add('active');
                    
                    loadTabData(targetTab);
                }
            });
        });
    }

    function initSearch() {
        searchButton.addEventListener('click', function() {
            performSearch();
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        clearSearchButton.addEventListener('click', function() {
            clearSearch();
        });
    }
    
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            alert('Por favor, digite um termo para pesquisar.');
            return;
        }
        
        const filteredBooks = sampleBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.publisher.toLowerCase().includes(searchTerm)
        );
        
        const dataView = document.querySelector('#todos-livros .data-view');
        if (filteredBooks.length > 0) {
            const table = createBooksTable(filteredBooks, ['Título', 'Autor', 'Editora', 'Status']);
            dataView.innerHTML = '';
            dataView.appendChild(table);
            
            const resultsInfo = document.createElement('p');
            resultsInfo.textContent = `Foram encontrados ${filteredBooks.length} livro(s) para "${searchTerm}"`;
            resultsInfo.style.marginBottom = 'var(--space-sm)';
            resultsInfo.style.fontWeight = '600';
            dataView.insertBefore(resultsInfo, table);
            
            clearSearchButton.style.display = 'inline-block';
        } else {
            dataView.innerHTML = `<p>Nenhum livro encontrado para "${searchTerm}".</p>`;
            
            clearSearchButton.style.display = 'inline-block';
        }
    }
    
    function clearSearch() {
        searchInput.value = '';
        clearSearchButton.style.display = 'none';
        loadTabData('todos-livros');
    }

    async function loadTabData(tabId) {
        const dataView = document.querySelector(`#${tabId} .data-view`);
        dataView.innerHTML = '<p>Carregando dados...</p>';
        
        try {
            switch(tabId) {
                case 'todos-livros':
                    await loadAllBooks(dataView);
                    break;
                case 'pendentes':
                    await loadPendingBooks(dataView);
                    break;
                case 'historico':
                    await loadHistory(dataView);
                    break;
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            dataView.innerHTML = '<p>Erro ao carregar dados. Tente novamente.</p>';
        }
    }

    async function loadAllBooks(container) {
        try {
            const response = await fetch(`${API_BASE_URL}/exemplares`);
            const data = await response.json();
            
            if (data.success) {
                const exemplares = data.data;
                
                // Agrupar exemplares por livro
                const livrosMap = new Map();
                exemplares.forEach(exemplar => {
                    const livroId = exemplar.idLivro;
                    if (!livrosMap.has(livroId)) {
                        livrosMap.set(livroId, {
                            id: exemplar.idLivro,
                            titulo: exemplar.livro_titulo,
                            autor: exemplar.autor,
                            editora: exemplar.editora,
                            anoPublicacao: exemplar.anoPublicacao,
                            exemplares: []
                        });
                    }
                    livrosMap.get(livroId).exemplares.push(exemplar);
                });
                
                const livros = Array.from(livrosMap.values());
                const table = createBooksTable(livros, ['Título', 'Autor', 'Editora', 'Ano', 'Exemplares', 'Status']);
                container.innerHTML = '';
                container.appendChild(table);
            } else {
                throw new Error(data.error || 'Erro ao carregar livros');
            }
        } catch (error) {
            console.error('Erro ao carregar livros:', error);
            container.innerHTML = '<p>Erro ao carregar livros. Tente novamente.</p>';
        }
    }

    async function loadPendingBooks(container) {
        try {
            const response = await fetch(`${API_BASE_URL}/emprestimos/ativos`);
            const data = await response.json();
            
            if (data.success) {
                const emprestimos = data.data;
                const table = createLoansTable(emprestimos, ['Título', 'Exemplar', 'Aluno', 'RA', 'Data de Empréstimo', 'Prazo de Devolução']);
                container.innerHTML = '';
                container.appendChild(table);
            } else {
                throw new Error(data.error || 'Erro ao carregar empréstimos');
            }
        } catch (error) {
            console.error('Erro ao carregar empréstimos:', error);
            container.innerHTML = '<p>Erro ao carregar empréstimos. Tente novamente.</p>';
        }
    }

    async function loadHistory(container) {
        // Por enquanto, mostrar uma mensagem já que não temos histórico implementado
        container.innerHTML = '<p>Funcionalidade de histórico em desenvolvimento.</p>';
    }

    function createBooksTable(data, headers) {
        const table = document.createElement('table');
        table.className = 'classification-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        data.forEach(livro => {
            const row = document.createElement('tr');
            
            const exemplaresDisponiveis = livro.exemplares.filter(ex => ex.status === 'disponivel').length;
            const exemplaresEmprestados = livro.exemplares.filter(ex => ex.status === 'emprestado').length;
            const exemplaresManutencao = livro.exemplares.filter(ex => ex.status === 'manutencao').length;
            
            const statusText = exemplaresDisponiveis > 0 ? 'Disponível' : 
                              exemplaresEmprestados > 0 ? 'Emprestado' : 'Manutenção';
            
            const cells = [
                livro.titulo,
                livro.autor,
                livro.editora,
                livro.anoPublicacao,
                `${exemplaresDisponiveis} disp. / ${exemplaresEmprestados} emp. / ${exemplaresManutencao} man.`,
                statusText
            ];
            
            cells.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                
                if (cell === 'Emprestado') {
                    td.style.color = '#dc2626';
                    td.style.fontWeight = '600';
                } else if (cell === 'Disponível') {
                    td.style.color = '#16a34a';
                    td.style.fontWeight = '600';
                } else if (cell === 'Manutenção') {
                    td.style.color = '#f59e0b';
                    td.style.fontWeight = '600';
                }
                
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        return table;
    }

    function createLoansTable(data, headers) {
        const table = document.createElement('table');
        table.className = 'classification-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        data.forEach(emprestimo => {
            const row = document.createElement('tr');
            
            const cells = [
                emprestimo.livro_titulo,
                emprestimo.exemplar_codigo,
                emprestimo.aluno_nome,
                emprestimo.ra,
                formatDate(emprestimo.dataEmprestimo),
                formatDate(emprestimo.dataDevolucaoPrevista)
            ];
            
            cells.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                row.appendChild(td);
            });
            
            const actionCell = document.createElement('td');
            const returnBtn = document.createElement('button');
            returnBtn.textContent = 'Marcar Devolvido';
            returnBtn.className = 'btn-primary';
            returnBtn.style.padding = 'var(--space-xs) var(--space-sm)';
            returnBtn.style.fontSize = '0.875rem';
            returnBtn.addEventListener('click', function() {
                markAsReturned(emprestimo.id);
            });
            actionCell.appendChild(returnBtn);
            row.appendChild(actionCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        return table;
    }

    function createHistoryTable(data, headers) {
        const table = document.createElement('table');
        table.className = 'classification-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        data.forEach(record => {
            const row = document.createElement('tr');
            
            const cells = [
                record.title,
                record.student,
                record.transaction,
                formatDate(record.date)
            ];
            
            cells.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                
                if (cell === 'Empréstimo') {
                    td.style.color = '#dc2626';
                    td.style.fontWeight = '600';
                } else if (cell === 'Devolução') {
                    td.style.color = '#16a34a';
                    td.style.fontWeight = '600';
                }
                
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        return table;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    async function markAsReturned(emprestimoId) {
        if (confirm('Deseja marcar este empréstimo como devolvido?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/emprestimos/devolucao`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idEmprestimo: emprestimoId
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Empréstimo marcado como devolvido com sucesso!');
                    loadTabData('pendentes');
                    loadTabData('todos-livros');
                } else {
                    throw new Error(data.error || 'Erro ao marcar como devolvido');
                }
            } catch (error) {
                console.error('Erro ao marcar como devolvido:', error);
                alert('Erro ao marcar como devolvido: ' + error.message);
            }
        }
    }

    function init() {
        initTabs();
        initSearch();
        loadTabData('todos-livros');
    }

    init();
});