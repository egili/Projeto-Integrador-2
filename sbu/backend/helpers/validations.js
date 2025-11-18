// helpers/validations.js
function validarLivro({ titulo, isbn, autor, editora, anoPublicacao, categoria, numeroExemplares }) {
    const erros = [];
    const anoAtual = new Date().getFullYear();
    
    // Regexes
    const regexApenasTexto = /^[A-Za-zÀ-ÿ\s]+$/; // Apenas letras e espaços (para Autor)
    // Para Editora: Permite letras, números, espaços, hífens, e alguns símbolos comuns (&, , . ')
    const regexEditora = /^[A-Za-zÀ-ÿ0-9\s&,\-\.'\(\)]+$/; 

    // --- 1. Título (Pode tudo, apenas checagem de obrigatoriedade e mínimo) ---
    const tituloLimpo = titulo ? titulo.trim() : '';
    if (tituloLimpo.length < 5) {
        erros.push("Título inválido (mínimo 5 caracteres obrigatórios).");
    } 
    // OBS: Restrição de caracteres removida, conforme solicitado ('pode tudo').

    // --- 2. ISBN (Pode tudo na entrada, valida 13 dígitos após limpeza) ---
    if (isbn) {
        const isbnApenasNumeros = String(isbn).replace(/[^0-9]/g, ''); // Limpa tudo que não é dígito

        if (isbnApenasNumeros.length !== 13) {
            erros.push("ISBN inválido (deve ter exatamente 13 números, desconsiderando hífens).");
        }
    }

    // --- 3. Autor (Sem números/especiais, mínimo 4) ---
    const autorLimpo = autor ? autor.trim() : '';
    if (autorLimpo.length < 4) {
        erros.push("Autor inválido (mínimo 4 caracteres obrigatórios).");
    } else if (!regexApenasTexto.test(autorLimpo)) {
        erros.push("Autor deve conter apenas letras, acentos e espaços.");
    }

    // --- 4. Editora (Aceita letras, números e símbolos comerciais, mínimo 2) ---
    const editoraLimpa = editora ? editora.trim() : '';
    if (editoraLimpa.length < 2) {
        erros.push("Editora inválida (mínimo 2 caracteres obrigatórios).");
    } else if (!regexEditora.test(editoraLimpa)) { 
        erros.push("Editora contém caracteres inválidos. Use apenas letras, números, espaços, hífens, vírgulas ou '&'.");
    }

    // --- 5. Ano de Publicação (Apenas número, faixa de 0 até ano atual) ---
    if (anoPublicacao === undefined || 
        anoPublicacao === null || 
        isNaN(anoPublicacao) ||          
        anoPublicacao > anoAtual ||      
        anoPublicacao < 0                
    ) {
        erros.push(`Ano de publicação inválido. Deve ser um número entre 0 e ${anoAtual}.`);
    }
    
    // --- 6. Categoria (Obrigatório, checa se algo foi selecionado) ---
    // A validação de "sem letra" é ignorada, pois a categoria é texto no Front-end (SELECT).
    if (!categoria || String(categoria).trim().length === 0 || categoria === 'Selecione uma categoria') {
        erros.push("Categoria é obrigatória e deve ser selecionada.");
    }

    // --- 7. Número de Exemplares (Obrigatório, >= 0) ---
    if (numeroExemplares == null || numeroExemplares < 0) {
        erros.push("Número de exemplares deve ser 0 ou maior.");
    }

    return erros;
}

module.exports = { validarLivro };