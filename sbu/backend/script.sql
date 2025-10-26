CREATE DATABASE IF NOT EXISTS biblioteca;
USE biblioteca;

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
    anoPublicacao INT NOT NULL,
    categoria VARCHAR(100)
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

-- Inserir dados iniciais
INSERT INTO semestre (descricao, dataInicio, dataFim) VALUES 
('2025-1', '2025-02-01', '2025-07-31'),
('2025-2', '2025-08-01', '2025-12-20');

INSERT INTO aluno (nome, ra) VALUES 
('Eduardo Fagundes Silva', '25008024'),
('Lucas Athanasio Bueno de Andrade', '25002731'),
('Pietra Façanha Bortolatto', '25002436'),
('Eliseu Gili', '25009281');

INSERT INTO livro (titulo, isbn, autor, editora, anoPublicacao, categoria) VALUES 
('Introdução à Programação', '978-85-12345-01-1', 'João Silva', 'Tecnologia Press', 2023, 'Programação'),
('Banco de Dados Relacional', '978-85-12345-02-2', 'Maria Santos', 'Data Books', 2022, 'Banco de Dados'),
('Desenvolvimento Web Moderno', '978-85-12345-03-3', 'Pedro Costa', 'Web Publishing', 2024, 'Desenvolvimento Web'),
('Algoritmos e Estruturas de Dados', '978-85-12345-04-4', 'Ana Oliveira', 'Computação Ltda', 2023, 'Algoritmos'),
('Engenharia de Software', '978-85-12345-05-5', 'Carlos Mendes', 'SoftPress', 2022, 'Engenharia de Software');

INSERT INTO exemplar (idLivro, codigo, status) VALUES
(1, 'EX-001-01', 'disponivel'),
(1, 'EX-001-02', 'disponivel'),
(1, 'EX-001-03', 'disponivel'),
(2, 'EX-002-01', 'disponivel'),
(2, 'EX-002-02', 'disponivel'),
(2, 'EX-002-03', 'disponivel'),
(3, 'EX-003-01', 'disponivel'),
(3, 'EX-003-02', 'disponivel'),
(3, 'EX-003-03', 'emprestado'),
(4, 'EX-004-01', 'disponivel'),
(4, 'EX-004-02', 'disponivel'),
(4, 'EX-004-03', 'disponivel'),
(5, 'EX-005-01', 'disponivel'),
(5, 'EX-005-02', 'disponivel'),
(5, 'EX-005-03', 'manutencao');

select * from livro;
select * from exemplar;
select * from emprestimo;
select * from aluno;