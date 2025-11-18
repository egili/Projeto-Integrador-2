// helpers/validations.js
function validarLivro({ titulo, isbn, autor, editora, anoPublicacao, numeroExemplares }) {
    const erros = [];
    const anoAtual = new Date().getFullYear();
    const regexApenasTexto = /^[A-Za-zÀ-ÿ\s]+$/;

    // Título: letras, espaços, acentos, mínimo 5 caracteres
    const tituloLimpo = titulo ? titulo.trim() : '';
    if (tituloLimpo.length < 5) {
        erros.push("Título inválido (mínimo 5 caracteres obrigatórios).");
    } else if (!regexApenasTexto.test(tituloLimpo)) {
        erros.push("Título deve conter apenas letras, acentos e espaços.");
    }

    // ISBN: apenas 13 dígitos ou formato com "-"
    if (isbn) {
        const isbnApenasNumeros = String(isbn).replace(/[^0-9]/g, ''); // Limpa qualquer coisa que não seja dígito (hífens, espaços, etc.)

        if (isbnApenasNumeros.length !== 13) {
            erros.push("ISBN inválido (deve ter exatamente 13 números, desconsiderando hífens).");
        }
    }

    // Autor: letras, espaços, acentos, mínimo 5 caracteres
    const autorLimpo = autor ? autor.trim() : '';
    if (autorLimpo.length < 4) {
        erros.push("Autor inválido (mínimo 4 caracteres obrigatórios).");
    } else if (!regexApenasTexto.test(autorLimpo)) {
        erros.push("Autor deve conter apenas letras, acentos e espaços.");
    }

    // Editora: letras, espaços, acentos, mínimo 2 caracteres
    const editoraLimpa = editora ? editora.trim() : '';
    if (editoraLimpa.length < 2) {
        erros.push("Editora inválida (mínimo 2 caracteres obrigatórios).");
    } else if (!regexApenasTexto.test(editoraLimpa)) {
        erros.push("Editora deve conter apenas letras, acentos e espaços.");
    }

    // Ano: não pode ser futuro
    if (anoPublicacao === undefined || 
        anoPublicacao === null || 
        isNaN(anoPublicacao) ||          
        anoPublicacao > anoAtual ||      
        anoPublicacao < 0                
    ) {
        erros.push(`Ano de publicação inválido. Não pode ser maior que ${anoAtual}.`);
}


    // Número de exemplares: apenas inteiro >= 0
    if (numeroExemplares == null || numeroExemplares < 0) {
        erros.push("Número de exemplares deve ser 0 ou maior.");
    }

    return erros;
}

module.exports = { validarLivro };
