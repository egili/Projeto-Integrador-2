const Log = require('../models/log');

exports.listarLogs = async (req, res) => {
    try {
        const { tipo, dataInicio, dataFim, limit } = req.query;
        
        const filtros = {};
        if (tipo) filtros.tipo = tipo;
        if (dataInicio) filtros.dataInicio = dataInicio;
        if (dataFim) filtros.dataFim = dataFim;
        if (limit) filtros.limit = parseInt(limit);

        const logs = await Log.listar(filtros);

        res.json({
            success: true,
            data: logs,
            total: logs.length
        });

    } catch (error) {
        console.error('Erro ao listar logs:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarLogsPorTipo = async (req, res) => {
    try {
        const { tipo } = req.params;
        const { limit = 100 } = req.query;

        const logs = await Log.listarPorTipo(tipo, parseInt(limit));

        res.json({
            success: true,
            data: logs,
            total: logs.length
        });

    } catch (error) {
        console.error('Erro ao listar logs por tipo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarLogsRecentes = async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const logs = await Log.listarRecentes(parseInt(limit));

        res.json({
            success: true,
            data: logs,
            total: logs.length
        });

    } catch (error) {
        console.error('Erro ao listar logs recentes:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.obterEstatisticasLogs = async (req, res) => {
    try {
        const estatisticas = await Log.contarPorTipo();

        res.json({
            success: true,
            data: estatisticas
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas de logs:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};