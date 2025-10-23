const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    
    try {
        // Conectar sem especificar o banco de dados primeiro
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'cc20669',
            multipleStatements: true // Permitir múltiplas declarações
        });

        console.log('Conectado ao MySQL');

        // Criar banco de dados se não existir
        await connection.query('CREATE DATABASE IF NOT EXISTS biblioteca');
        console.log('Banco de dados "biblioteca" verificado/criado');

        // Fechar conexão inicial
        await connection.end();

        // Conectar agora ao banco de dados específico
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'cc20669',
            database: 'biblioteca',
            multipleStatements: true
        });

        console.log('Conectado ao banco de dados "biblioteca"');

        // Executar cada comando de criação de tabela separadamente
        console.log('Criando tabelas...');

        // Tabela bibliotecario
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bibliotecario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL
            )
        `);

        // Tabela semestre
        await connection.query(`
            CREATE TABLE IF NOT EXISTS semestre (
                id INT AUTO_INCREMENT PRIMARY KEY,
                descricao VARCHAR(20) NOT NULL UNIQUE,
                dataInicio DATE,
                dataFim DATE
            )
        `);

        // Tabela aluno
        await connection.query(`
            CREATE TABLE IF NOT EXISTS aluno (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                ra VARCHAR(20) UNIQUE NOT NULL
            )
        `);

        // Tabela livro
        await connection.query(`
            CREATE TABLE IF NOT EXISTS livro (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(200) NOT NULL,
                isbn VARCHAR(20) UNIQUE,
                autor VARCHAR(100) NOT NULL,
                editora VARCHAR(100) NOT NULL,
                anoPublicacao INT NOT NULL
            )
        `);

        // Tabela exemplar
        await connection.query(`
            CREATE TABLE IF NOT EXISTS exemplar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                idLivro INT NOT NULL,
                codigo VARCHAR(50) UNIQUE NOT NULL,
                status ENUM('disponivel', 'emprestado', 'manutencao') DEFAULT 'disponivel',
                observacoes TEXT,
                data_aquisicao DATE,
                FOREIGN KEY (idLivro) REFERENCES livro(id) ON DELETE CASCADE
            )
        `);

        // Tabela emprestimo
        await connection.query(`
            CREATE TABLE IF NOT EXISTS emprestimo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                idAluno INT NOT NULL,
                idExemplar INT NOT NULL,
                dataEmprestimo DATE NOT NULL,
                dataDevolucaoPrevista DATE NOT NULL,
                dataDevolucaoReal DATE,
                FOREIGN KEY (idAluno) REFERENCES aluno(id),
                FOREIGN KEY (idExemplar) REFERENCES exemplar(id) 
            )
        `);

        // Tabela classificacao
        await connection.query(`
            CREATE TABLE IF NOT EXISTS classificacao (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo VARCHAR(20) UNIQUE NOT NULL,
                descricao TEXT,
                idSemestre INT,
                idAluno INT,
                FOREIGN KEY (idSemestre) REFERENCES semestre(id),
                FOREIGN KEY (idAluno) REFERENCES aluno(id)
            )
        `);

        // Tabela log
        await connection.query(`
            CREATE TABLE IF NOT EXISTS log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tipo ENUM('excecao', 'erro', 'sucesso') NOT NULL,
                dataHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                descricao TEXT NOT NULL
            )
        `);

        console.log('Todas as tabelas criadas/verificadas');

        // Inserir dados iniciais
        console.log('Inserindo dados iniciais...');

        // Bibliotecário
        await connection.query(`INSERT IGNORE INTO bibliotecario (nome) VALUES ('Bibliotecário Principal')`);

        // Semestres
        await connection.query(`
            INSERT IGNORE INTO semestre (descricao, dataInicio, dataFim) VALUES 
            ('2025-1', '2025-02-01', '2025-07-31'),
            ('2025-2', '2025-08-01', '2025-12-20')
        `);

        // Alunos
        await connection.query(`
            INSERT IGNORE INTO aluno (nome, ra) VALUES 
            ('João Silva', '25009281'),
            ('Maria Santos', '25008024'),
            ('Pedro Costa', '23011884'),
            ('Eliseu Gili', '250099281'),
            ('Lucas Pereira', '22004567')
        `);

        // Livros
        await connection.query(`
            INSERT IGNORE INTO livro (titulo, isbn, autor, editora, anoPublicacao) VALUES 
            ('Introdução à Programação', '978-85-12345-01-1', 'João Silva', 'Tecnologia Press', 2023),
            ('Banco de Dados Relacional', '978-85-12345-02-2', 'Maria Santos', 'Data Books', 2022),
            ('Desenvolvimento Web Moderno', '978-85-12345-03-3', 'Pedro Costa', 'Web Publishing', 2024),
            ('Algoritmos e Estruturas de Dados', '978-85-12345-04-4', 'Ana Oliveira', 'Computação Ltda', 2023),
            ('Engenharia de Software', '978-85-12345-05-5', 'Carlos Mendes', 'SoftPress', 2022)
        `);

        // Exemplares
        await connection.query(`
            INSERT IGNORE INTO exemplar (idLivro, codigo, status, data_aquisicao) VALUES
            (1, 'EX-001-01', 'disponivel', '2024-01-15'),
            (1, 'EX-001-02', 'disponivel', '2024-01-15'),
            (2, 'EX-002-01', 'disponivel', '2024-02-01'),
            (3, 'EX-003-01', 'disponivel', '2024-03-10'),
            (3, 'EX-003-02', 'emprestado', '2024-03-10'),
            (4, 'EX-004-01', 'disponivel', '2024-01-20'),
            (5, 'EX-005-01', 'manutencao', '2024-04-05')
        `);

        console.log('✅ Banco de dados inicializado com sucesso!');

        // Verificar os dados inseridos
        console.log('\n📊 Resumo dos dados inseridos:');
        
        const [alunos] = await connection.query('SELECT COUNT(*) as total FROM aluno');
        console.log(`👥 Alunos: ${alunos[0].total}`);
        
        const [livros] = await connection.query('SELECT COUNT(*) as total FROM livro');
        console.log(`📚 Livros: ${livros[0].total}`);
        
        const [exemplares] = await connection.query('SELECT COUNT(*) as total FROM exemplar');
        console.log(`🔢 Exemplares: ${exemplares[0].total}`);

    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error.message);
        console.error('Detalhes:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Conexão com o MySQL fechada.');
        }
    }
}

// Executar a inicialização
initializeDatabase();