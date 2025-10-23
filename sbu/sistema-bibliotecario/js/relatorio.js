// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// API functions
const api = {
    obterClassificacaoGeral: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/classificacao`);
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Erro ao obter classificação');
            }
        } catch (error) {
            console.error('Erro ao obter classificação:', error);
            throw error;
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {

    const rankingContainer = document.querySelector('.table-ranking');
    
    function initReport() {
        loadRankingData();
        addExportFunctionality();
    }

    async function loadRankingData() {
        try {
            rankingContainer.innerHTML = '<p>Carregando dados...</p>';
            
            const classificacoes = await api.obterClassificacaoGeral();
            
            if (classificacoes.length === 0) {
                rankingContainer.innerHTML = '<p>Nenhuma classificação encontrada.</p>';
                return;
            }

            // Converter dados para o formato esperado
            const readers = classificacoes.map(c => ({
                RA: c.ra,
                name: c.aluno_nome,
                booksRead: 0, // Não temos essa informação diretamente
                classification: getClassificationName(c.codigo),
                semestre: c.semestre_descricao
            }));

            const sortedReaders = readers.sort((a, b) => {
                // Ordenar por classificação (EL > BL > RL > ML > NL)
                const order = { 'Excelente': 1, 'Bom': 2, 'Regular': 3, 'Mau': 4, 'Não': 5 };
                return (order[a.classification] || 6) - (order[b.classification] || 6);
            });
            
            const table = createRankingTable(sortedReaders);
            rankingContainer.innerHTML = '';
            
            const title = document.createElement('h3');
            title.textContent = 'Ranking Geral de Classificação';
            title.style.marginBottom = 'var(--space-md)';
            title.style.color = 'var(--gray-800)';
            
            const subtitle = document.createElement('p');
            subtitle.textContent = `Total de alunos classificados: ${sortedReaders.length}`;
            subtitle.style.marginBottom = 'var(--space-md)';
            subtitle.style.color = 'var(--gray-600)';
            
            rankingContainer.appendChild(title);
            rankingContainer.appendChild(subtitle);
            rankingContainer.appendChild(table);
            
            addStatistics(sortedReaders);
            
            addExportButton();

        } catch (error) {
            rankingContainer.innerHTML = '<p>Erro ao carregar dados. Tente novamente.</p>';
            console.error('Erro:', error);
        }
    }

    function getClassificationName(codigo) {
        switch (codigo) {
            case 'EL': return 'Excelente';
            case 'BL': return 'Bom';
            case 'RL': return 'Regular';
            case 'ML': return 'Mau';
            case 'NL': return 'Não';
            default: return 'Não Classificado';
        }
    }

    function createRankingTable(readers) {
        const table = document.createElement('table');
        table.className = 'classification-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Posição', 'RA do Aluno', 'Nome', 'Classificação', 'Semestre'];
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
            
            const classificationCell = document.createElement('td');
            classificationCell.textContent = reader.classification + ' Leitor';
            classificationCell.className = getClassificationClass(reader.classification);
            row.appendChild(classificationCell);

            const semestreCell = document.createElement('td');
            semestreCell.textContent = reader.semestre || 'N/A';
            semestreCell.style.textAlign = 'center';
            row.appendChild(semestreCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        return table;
    }

    function getClassificationClass(classification) {
        switch(classification) {
            case 'Excelente':
                return 'status-extreme';
            case 'Bom':
                return 'status-active';
            case 'Regular':
                return 'status-regular';
            case 'Mau':
                return 'status-beginner';
            case 'Não':
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
        
        const excellentReaders = readers.filter(r => r.classification === 'Excelente').length;
        const goodReaders = readers.filter(r => r.classification === 'Bom').length;
        const regularReaders = readers.filter(r => r.classification === 'Regular').length;
        const badReaders = readers.filter(r => r.classification === 'Mau').length;
        const nonReaders = readers.filter(r => r.classification === 'Não').length;
        
        const statsGrid = document.createElement('div');
        statsGrid.style.display = 'grid';
        statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
        statsGrid.style.gap = 'var(--space-sm)';
        statsGrid.style.fontSize = '0.9rem';
        
        const stats = [
            { label: 'Total de Alunos', value: readers.length },
            { label: 'Excelentes Leitores', value: excellentReaders },
            { label: 'Bons Leitores', value: goodReaders },
            { label: 'Leitores Regulares', value: regularReaders },
            { label: 'Maus Leitores', value: badReaders },
            { label: 'Não Leitores', value: nonReaders }
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