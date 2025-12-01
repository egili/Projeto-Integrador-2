CREATE DATABASE IF NOT EXISTS biblioteca;
USE biblioteca;

CREATE TABLE IF NOT EXISTS aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ra VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS livro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    autor VARCHAR(255) NOT NULL,
    editora VARCHAR(255),
    anoPublicacao INT,
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
    dataEmprestimo DATETIME NOT NULL,
    dataDevolucaoReal DATETIME,
    FOREIGN KEY (idAluno) REFERENCES aluno(id) ON DELETE CASCADE,
    FOREIGN KEY (idExemplar) REFERENCES exemplar(id) ON DELETE CASCADE
);