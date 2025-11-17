// helpers/validations.js
function validarLivro({ titulo, isbn, autor, editora, anoPublicacao, numeroExemplares }) {
    const erros = [];

    // Título: letras, espaços, acentos, mínimo 5 caracteres
    if (!titulo || !/^[A-Za-zÀ-ÿ\s]{5,}$/.test(titulo)) {
        erros.push("Título inválido (mínimo 5 letras, apenas letras e espaços).");
    }

    // ISBN: apenas 13 dígitos ou formato com "-"
    if (isbn && !/^\d{13}$|^\d{3}-\d{1,5}-\d{1,7}-\d{1,7}-\d{1}$/.test(isbn)) {
        erros.push("ISBN inválido (deve ter 13 números ou formato com '-').");
    }

    // Autor: letras, espaços, acentos, mínimo 5 caracteres
    if (!autor || !/^[A-Za-zÀ-ÿ\s]{5,}$/.test(autor)) {
        erros.push("Autor inválido (mínimo 5 letras).");
    }

    // Editora: letras, espaços, acentos, mínimo 2 caracteres
    if (!editora || !/^[A-Za-zÀ-ÿ\s]{2,}$/.test(editora)) {
        erros.push("Editora inválida (mínimo 2 letras).");
    }

    // Ano: não pode ser futuro
    const anoAtual = new Date().getFullYear();
    if (!anoPublicacao || !/^\d{4}$/.test(anoPublicacao) || anoPublicacao > anoAtual) {
        erros.push(`Ano de publicação inválido. Deve ter 4 dígitos e não pode ser maior que ${anoAtual}.`);
}


    // Número de exemplares: apenas inteiro >= 0
    if (numeroExemplares == null || numeroExemplares < 0) {
        erros.push("Número de exemplares deve ser 0 ou maior.");
    }

    return erros;
}

module.exports = { validarLivro };
