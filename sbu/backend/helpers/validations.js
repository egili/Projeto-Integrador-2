function validarLivro({ titulo, isbn, autor, editora, anoPublicacao, categoria, numeroExemplares }) {
    const erros = [];
    const anoAtual = new Date().getFullYear();
    
    const regexApenasTexto = /^[A-Za-zÀ-ÿ\s]+$/;
    const regexEditora = /^[A-Za-zÀ-ÿ0-9\s&,\-\.'\(\)]+$/; 

    const tituloLimpo = titulo ? titulo.trim() : '';
    if (tituloLimpo.length < 5) {
        erros.push("Título inválido (mínimo 5 caracteres obrigatórios).");
    }

    if (isbn) {
        const isbnApenasNumeros = String(isbn).replace(/[^0-9]/g, '');

        if (isbnApenasNumeros.length !== 13) {
            erros.push("ISBN inválido (deve ter exatamente 13 números, desconsiderando hífens).");
        }
    }

    const autorLimpo = autor ? autor.trim() : '';
    if (autorLimpo.length < 4) {
        erros.push("Autor inválido (mínimo 4 caracteres obrigatórios).");
    } else if (!regexApenasTexto.test(autorLimpo)) {
        erros.push("Autor deve conter apenas letras, acentos e espaços.");
    }

    const editoraLimpa = editora ? editora.trim() : '';
    if (editoraLimpa.length < 2) {
        erros.push("Editora inválida (mínimo 2 caracteres obrigatórios).");
    } else if (!regexEditora.test(editoraLimpa)) { 
        erros.push("Editora contém caracteres inválidos. Use apenas letras, números, espaços, hífens, vírgulas ou '&'.");
    }

    if (anoPublicacao === undefined || 
        anoPublicacao === null || 
        isNaN(anoPublicacao) ||          
        anoPublicacao > anoAtual ||      
        anoPublicacao < 0                
    ) {
        erros.push(`Ano de publicação inválido. Deve ser um número entre 0 e ${anoAtual}.`);
    }
    
    if (!categoria || String(categoria).trim().length === 0 || categoria === 'Selecione uma categoria') {
        erros.push("Categoria é obrigatória e deve ser selecionada.");
    }

    if (numeroExemplares == null || numeroExemplares < 0) {
        erros.push("Número de exemplares deve ser 0 ou maior.");
    }

    return erros;
}

module.exports = { validarLivro };