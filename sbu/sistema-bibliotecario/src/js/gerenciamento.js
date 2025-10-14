document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search');
    
    const sampleBooks = [
        { id: 1, title: "Entendendo Algoritmos", author: "Aditya Y. Bhargava ", publisher: "Editora A", status: "Disponível" },
        { id: 2, title: "Algoritmos E Lógica Da Programação", author: "Marco A. Furlan de Souza ", publisher: "Editora B", status: "Emprestado" },
        { id: 3, title: "Lógica de Programação e Algoritmos com Javascript", author: "Edécio Fernando Iepsen  ", publisher: "Editora A", status: "Disponível" },
        { id: 4, title: "Estruturas De Dados E Algoritmos Com Javascript", author: " Loiane Groner", publisher: "Editora C", status: "Emprestado" },
        { id: 5, title: "Introdução à Linguagem SQL", author: " Thomas Nield  ", publisher: "Editora A", status: "Disponível" },
        { id: 6, title: "Microsoft Power bi Para Leigos", author: " Jack Hyman", publisher: "Editora D", status: "Disponível" },
        { id: 7, title: "A Cor dos Dados: Um guia para o uso de cores em storytelling de dados", author: "Kate Strachnyi", publisher: "Editora C", status: "Disponível" }
    ];
    
    const sampleLoans = [
        { id: 1, title: "Algoritmos E Lógica Da Programação", student: "Eduardo", loanDate: "2025-01-15", returnDate: "2025-02-15" },
        { id: 2, title: "Estruturas De Dados E Algoritmos Com Javascript", student: "Eliseu", loanDate: "2025-01-20", returnDate: "2025-02-20" },
        { id: 3, title: "Entendendo Algoritmos", student: "Lucas", loanDate: "2025-01-10", returnDate: "2025-02-10" }
    ];
    
    const sampleHistory = [
        { id: 1, title: "Entendendo Algoritmos", student: "Joãozinho", transaction: "Empréstimo", date: "2025-01-05" },
        { id: 2, title: "Algoritmos E Lógica Da Programação", student: "Kaue", transaction: "Empréstimo", date: "2025-01-08" },
        { id: 3, title: "Lógica de Programação e Algoritmos com Javascript", student: "Luis", transaction: "Empréstimo", date: "2025-01-12" },
        { id: 4, title: "Entendendo Algoritmos", student: "Brenda", transaction: "Devolução", date: "2025-01-20" },
        { id: 5, title: "Estruturas De Dados E Algoritmos Com Javascript", student: "Caio", transaction: "Empréstimo", date: "2025-01-25" }
    ];

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

    function loadTabData(tabId) {
        const dataView = document.querySelector(`#${tabId} .data-view`);
        
        switch(tabId) {
            case 'todos-livros':
                loadAllBooks(dataView);
                break;
            case 'pendentes':
                loadPendingBooks(dataView);
                break;
            case 'historico':
                loadHistory(dataView);
                break;
        }
    }

    function loadAllBooks(container) {
        const table = createBooksTable(sampleBooks, ['Título', 'Autor', 'Editora', 'Status']);
        container.innerHTML = '';
        container.appendChild(table);
    }

    function loadPendingBooks(container) {
        const table = createLoansTable(sampleLoans, ['Título', 'Aluno', 'Data de Empréstimo', 'Data de Devolução']);
        container.innerHTML = '';
        container.appendChild(table);
    }

    function loadHistory(container) {
        const table = createHistoryTable(sampleHistory, ['Título', 'Aluno', 'Transação', 'Data']);
        container.innerHTML = '';
        container.appendChild(table);
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
        
        data.forEach(book => {
            const row = document.createElement('tr');
            
            const cells = [
                book.title,
                book.author,
                book.publisher,
                book.status
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
        
        data.forEach(loan => {
            const row = document.createElement('tr');
            
            const cells = [
                loan.title,
                loan.student,
                formatDate(loan.loanDate),
                formatDate(loan.returnDate)
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
                markAsReturned(loan.id);
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

    function markAsReturned(loanId) {
        if (confirm('Deseja marcar este livro como devolvido?')) {
            console.log(`Livro ${loanId} marcado como devolvido`);
            alert('Livro marcado como devolvido com sucesso!');
            
            loadTabData('pendentes');
            loadTabData('todos-livros');
        }
    }

    function init() {
        initTabs();
        initSearch();
        loadTabData('todos-livros');
    }

    init();
});