CREATE DATABASE IF NOT EXISTS biblioteca;
USE biblioteca;

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
    status ENUM('disponivel', 'emprestado') DEFAULT 'disponivel',
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
    idAluno INT,
    FOREIGN KEY (idAluno) REFERENCES aluno(id)
);

select * from biblioteca.livro;
select * from biblioteca.exemplar;
select * from biblioteca.emprestimo;
select * from biblioteca.aluno;