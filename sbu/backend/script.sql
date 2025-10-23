CREATE DATABASE IF NOT EXISTS biblioteca;
USE biblioteca;

CREATE TABLE IF NOT EXISTS bibliotecario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS semestre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(20) NOT NULL UNIQUE,
    dataInicio DATE,
    dataFim DATE
);

CREATE TABLE IF NOT EXISTS aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ra VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS livro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    autor VARCHAR(100) NOT NULL,
    editora VARCHAR(100) NOT NULL,
    anoPublicacao INT NOT NULL
);

CREATE TABLE IF NOT EXISTS exemplar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idLivro INT NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('disponivel', 'emprestado', 'manutencao') DEFAULT 'disponivel',
    observacoes TEXT,
    FOREIGN KEY (idLivro) REFERENCES livro(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emprestimo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idAluno INT NOT NULL,
    idExemplar INT NOT NULL,
    dataEmprestimo DATE NOT NULL,
    dataDevolucaoPrevista DATE NOT NULL,
    dataDevolucaoReal DATE,
    FOREIGN KEY (idAluno) REFERENCES aluno(id),
    FOREIGN KEY (idExemplar) REFERENCES exemplar(id) 
);

CREATE TABLE IF NOT EXISTS classificacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao TEXT,
    idSemestre INT,
    idAluno INT,
    FOREIGN KEY (idSemestre) REFERENCES semestre(id),
    FOREIGN KEY (idAluno) REFERENCES aluno(id)
);

CREATE TABLE IF NOT EXISTS log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('excecao', 'erro', 'sucesso') NOT NULL,
    dataHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descricao TEXT NOT NULL
);

-- Inserir dados iniciais
INSERT INTO bibliotecario (nome) VALUES ('Bibliotecário Principal');

INSERT INTO semestre (descricao, dataInicio, dataFim) VALUES 
('2025-1', '2025-02-01', '2025-07-31'),
('2025-2', '2025-08-01', '2025-12-20');

INSERT INTO aluno (nome, ra) VALUES 
('João Silva', '25009281'),
('Maria Santos', '25008024'),
('Pedro Costa', '23011884'),
('Eliseu Gili', '250099281'),
('Lucas Pereira', '22004567');

INSERT INTO livro (titulo, isbn, autor, editora, anoPublicacao) VALUES 
('Introdução à Programação', '978-85-12345-01-1', 'João Silva', 'Tecnologia Press', 2023),
('Banco de Dados Relacional', '978-85-12345-02-2', 'Maria Santos', 'Data Books', 2022),
('Desenvolvimento Web Moderno', '978-85-12345-03-3', 'Pedro Costa', 'Web Publishing', 2024),
('Algoritmos e Estruturas de Dados', '978-85-12345-04-4', 'Ana Oliveira', 'Computação Ltda', 2023),
('Engenharia de Software', '978-85-12345-05-5', 'Carlos Mendes', 'SoftPress', 2022);

INSERT INTO exemplar (idLivro, codigo, status, data_aquisicao) VALUES
(1, 'EX-001-01', 'disponivel', '2024-01-15'),
(1, 'EX-001-02', 'disponivel', '2024-01-15'),
(2, 'EX-002-01', 'disponivel', '2024-02-01'),
(3, 'EX-003-01', 'disponivel', '2024-03-10'),
(3, 'EX-003-02', 'emprestado', '2024-03-10'),
(4, 'EX-004-01', 'disponivel', '2024-01-20'),
(5, 'EX-005-01', 'manutencao', '2024-04-05');