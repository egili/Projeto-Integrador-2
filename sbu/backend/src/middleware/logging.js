const Log = require('../models/log');

// Middleware para log de requisições
const logRequest = async (req, res, next) => {
    const startTime = Date.now();
    
    // Interceptar o res.json para capturar a resposta
    const originalJson = res.json;
    res.json = function(data) {
        const duration = Date.now() - startTime;
        
        // Log da requisição
        const logData = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent') || 'Unknown',
            ip: req.ip || req.connection.remoteAddress
        };

        // Determinar tipo de log baseado no status code
        let tipo = 'sucesso';
        if (res.statusCode >= 400 && res.statusCode < 500) {
            tipo = 'erro';
        } else if (res.statusCode >= 500) {
            tipo = 'excecao';
        }

        // Criar descrição do log
        const descricao = `${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duração: ${duration}ms - IP: ${logData.ip}`;
        
        // Salvar log de forma assíncrona (não bloquear a resposta)
        Log.criar(tipo, descricao).catch(err => {
            console.error('Erro ao salvar log:', err);
        });

        // Chamar o método original
        return originalJson.call(this, data);
    };

    next();
};

// Função para log de operações específicas
const logOperation = async (tipo, descricao) => {
    try {
        await Log.criar(tipo, descricao);
    } catch (error) {
        console.error('Erro ao salvar log de operação:', error);
    }
};

// Função para log de erros
const logError = async (error, context = '') => {
    try {
        const descricao = `ERRO: ${error.message} - Contexto: ${context} - Stack: ${error.stack}`;
        await Log.criar('excecao', descricao);
    } catch (logError) {
        console.error('Erro ao salvar log de erro:', logError);
    }
};

// Função para log de sucesso
const logSuccess = async (operation, details = '') => {
    try {
        const descricao = `SUCESSO: ${operation} - ${details}`;
        await Log.criar('sucesso', descricao);
    } catch (error) {
        console.error('Erro ao salvar log de sucesso:', error);
    }
};

module.exports = {
    logRequest,
    logOperation,
    logError,
    logSuccess
};