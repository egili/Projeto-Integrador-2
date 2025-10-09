document.addEventListener('DOMContentLoaded', function() {
    const sampleReaders = [
        { RA: '25009281', name: 'Eliseu Gili', booksRead: 25, classification: 'Extremo' },
        { RA: '25008024', name: 'Eduardo Faundes', booksRead: 18, classification: 'Ativo' },
        { RA: '23011884', name: 'Kaue Rodrigues', booksRead: 12, classification: 'Ativo' },
        { RA: '25002731', name: 'Lucas Athanasio', booksRead: 8, classification: 'Regular' },
        { RA: '25001011', name: 'Patrícia Nunes', booksRead: 22, classification: 'Extremo' },
        { RA: '25001006', name: 'Ricardo Alves', booksRead: 15, classification: 'Ativo' },
        { RA: '25001007', name: 'Juliana Lima', booksRead: 6, classification: 'Regular' },
        { RA: '25001008', name: 'Pedro Mendes', booksRead: 3, classification: 'Iniciante' },
        { RA: '25001009', name: 'Camila Rocha', booksRead: 19, classification: 'Ativo' },
        { RA: '25001010', name: 'Lucas Ferreira', booksRead: 9, classification: 'Regular' },
        { RA: '25002436', name: 'Pietra Bortolato', booksRead: 28, classification: 'Extremo' },
        { RA: '25001012', name: 'Roberto Dias', booksRead: 4, classification: 'Iniciante' }
    ];

    const rankingContainer = document.querySelector('.table-ranking');
    
    function initReport() {
        loadRankingData();
        addExportFunctionality();
    }

    function loadRankingData() {
        const sortedReaders = [...sampleReaders].sort((a, b) => b.booksRead - a.booksRead);
        
        const table = createRankingTable(sortedReaders);
        rankingContainer.innerHTML = '';
        
        const title = document.createElement('h3');
        title.textContent = 'Ranking Geral (Último Semestre)';
        title.style.marginBottom = 'var(--space-md)';
        title.style.color = 'var(--gray-800)';
        
        const subtitle = document.createElement('p');
        subtitle.textContent = `Total de alunos no ranking: ${sortedReaders.length}`;
        subtitle.style.marginBottom = 'var(--space-md)';
        subtitle.style.color = 'var(--gray-600)';
        
        rankingContainer.appendChild(title);
        rankingContainer.appendChild(subtitle);
        rankingContainer.appendChild(table);
        
        addStatistics(sortedReaders);
        
        addExportButton();
    }

    function createRankingTable(readers) {
        const table = document.createElement('table');
        table.className = 'classification-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Posição', 'RA do Aluno', 'Nome', 'Livros Lidos', 'Classificação'];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        readers.forEach((reader, index) => {
            const row = document.createElement('tr');
            
            const positionCell = document.createElement('td');
            positionCell.style.fontWeight = '600';
            positionCell.style.textAlign = 'center';
            
            if (index === 0) {
                positionCell.innerHTML = '🥇 1º';
                positionCell.style.color = '#f59e0b';
            } else if (index === 1) {
                positionCell.innerHTML = '🥈 2º';
                positionCell.style.color = '#6b7280';
            } else if (index === 2) {
                positionCell.innerHTML = '🥉 3º';
                positionCell.style.color = '#92400e';
            } else {
                positionCell.textContent = `${index + 1}º`;
            }
            
            row.appendChild(positionCell);
            

            const idCell = document.createElement('td');
            idCell.textContent = reader.RA;
            idCell.style.fontFamily = 'monospace';
            row.appendChild(idCell);
            
            const nameCell = document.createElement('td');
            nameCell.textContent = reader.name;
            row.appendChild(nameCell);
            
            const booksCell = document.createElement('td');
            booksCell.textContent = reader.booksRead;
            booksCell.style.textAlign = 'center';
            booksCell.style.fontWeight = '600';
            row.appendChild(booksCell);
            
            const classificationCell = document.createElement('td');
            classificationCell.textContent = reader.classification;
            classificationCell.className = getClassificationClass(reader.classification);
            row.appendChild(classificationCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        return table;
    }

    function getClassificationClass(classification) {
        switch(classification) {
            case 'Extremo':
                return 'status-extreme';
            case 'Ativo':
                return 'status-active';
            case 'Regular':
                return 'status-regular';
            case 'Iniciante':
                return 'status-beginner';
            default:
                return '';
        }
    }

    function addStatistics(readers) {
        const statsContainer = document.createElement('div');
        statsContainer.style.marginTop = 'var(--space-lg)';
        statsContainer.style.padding = 'var(--space-md)';
        statsContainer.style.background = 'var(--gray-50)';
        statsContainer.style.borderRadius = 'var(--radius-md)';
        statsContainer.style.border = '1px solid var(--gray-200)';
        
        const statsTitle = document.createElement('h4');
        statsTitle.textContent = '📊 Estatísticas do Semestre';
        statsTitle.style.marginBottom = 'var(--space-sm)';
        statsTitle.style.color = 'var(--gray-800)';
        
        statsContainer.appendChild(statsTitle);
        
        const totalBooks = readers.reduce((sum, reader) => sum + reader.booksRead, 0);
        const averageBooks = (totalBooks / readers.length).toFixed(1);
        const extremeReaders = readers.filter(r => r.classification === 'Extremo').length;
        const activeReaders = readers.filter(r => r.classification === 'Ativo').length;
        const regularReaders = readers.filter(r => r.classification === 'Regular').length;
        const beginnerReaders = readers.filter(r => r.classification === 'Iniciante').length;
        
        const statsGrid = document.createElement('div');
        statsGrid.style.display = 'grid';
        statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
        statsGrid.style.gap = 'var(--space-sm)';
        statsGrid.style.fontSize = '0.9rem';
        
        const stats = [
            { label: 'Total de Alunos', value: readers.length },
            { label: 'Total de Livros Lidos', value: totalBooks },
            { label: 'Média por Aluno', value: averageBooks },
            { label: 'Leitores Extremos', value: extremeReaders },
            { label: 'Leitores Ativos', value: activeReaders },
            { label: 'Leitores Regulares', value: regularReaders },
            { label: 'Leitores Iniciantes', value: beginnerReaders }
        ];
        
        stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.style.padding = 'var(--space-xs)';
            
            const statLabel = document.createElement('div');
            statLabel.textContent = stat.label;
            statLabel.style.color = 'var(--gray-600)';
            statLabel.style.fontSize = '0.85rem';
            
            const statValue = document.createElement('div');
            statValue.textContent = stat.value;
            statValue.style.fontWeight = '600';
            statValue.style.color = 'var(--primary-dark)';
            statValue.style.fontSize = '1.1rem';
            
            statItem.appendChild(statLabel);
            statItem.appendChild(statValue);
            statsGrid.appendChild(statItem);
        });
        
        statsContainer.appendChild(statsGrid);
        rankingContainer.appendChild(statsContainer);
    }

    function addExportButton() {
        const exportContainer = document.createElement('div');
        exportContainer.style.marginTop = 'var(--space-md)';
        exportContainer.style.textAlign = 'center';
        
        const exportButton = document.createElement('button');
        exportButton.textContent = '📥 Exportar Relatório (PDF)';
        exportButton.className = 'btn-primary';
        exportButton.style.margin = '0 auto';
        exportButton.addEventListener('click', exportToPDF);
        
        exportContainer.appendChild(exportButton);
        rankingContainer.appendChild(exportContainer);
    }

    function addExportFunctionality() {
        console.log('Funcionalidade de exportação preparada');
    }

    function exportToPDF() {
        alert('📊 Relatório exportado com sucesso!\n\nEm uma aplicação real, um arquivo PDF seria gerado com todos os dados do ranking.');
        
        console.log('Iniciando exportação do relatório...');
        console.log('Dados exportados:', sampleReaders);
        
        const successMsg = document.createElement('div');
        successMsg.textContent = '✅ Relatório exportado com sucesso!';
        successMsg.style.background = '#dcfce7';
        successMsg.style.color = '#166534';
        successMsg.style.padding = 'var(--space-sm)';
        successMsg.style.borderRadius = 'var(--radius-md)';
        successMsg.style.marginTop = 'var(--space-sm)';
        successMsg.style.textAlign = 'center';
        successMsg.style.border = '1px solid #bbf7d0';
        
        const exportButton = document.querySelector('.btn-primary');
        exportButton.parentNode.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
    }

    initReport();
});