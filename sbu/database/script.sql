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

CREATE TABLE IF NOT EXISTS classificacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao TEXT,
    idSemestre INT,
    idAluno INT,
    FOREIGN KEY (idSemestre) REFERENCES semestre(id),
    FOREIGN KEY (idAluno) REFERENCES aluno(id)
);

CREATE TABLE IF NOT EXISTS livro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
);

CREATE TABLE IF NOT EXISTS aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ra VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS emprestimo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idAluno INT NOT NULL,
    idLivro INT NOT NULL,
    dataEmprestimo DATE NOT NULL,
    dataDevolucaoPrevista DATE NOT NULL,
    dataDevolucaoReal DATE,
    FOREIGN KEY (idAluno) REFERENCES aluno(id),
    FOREIGN KEY (idLivro) REFERENCES livro(id)
);

CREATE TABLE IF NOT EXISTS log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('excecao', 'erro', 'sucesso') NOT NULL,
    dataHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descricao TEXT NOT NULL
);