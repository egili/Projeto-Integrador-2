const Aluno = require('../models/aluno');

exports.cadastrarAluno = async (req, res) => {
    try {
        const { nome, ra } = req.body;

        if (!nome || !ra) {
            return res.status(400).json({ 
                success: false,
                error: 'Nome e RA são obrigatórios' 
            });
        }

        // Verifica se RA já existe
        const alunoExistente = await Aluno.buscarPorRa(ra);
        if (alunoExistente) {
            return res.status(400).json({
                success: false,
                error: 'RA já cadastrado'
            });
        }

        const result = await Aluno.criar({ nome, ra });
        
        res.status(201).json({
            success: true,
            message: 'Aluno cadastrado com sucesso',
            data: { id: result.insertId, nome, ra }
        });

    } catch (error) {
        console.error('Erro ao cadastrar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarAlunoPorRa = async (req, res) => {
    try {
        const { ra } = req.params;

        const aluno = await Aluno.buscarPorRa(ra);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data: aluno
        });

    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarAlunos = async (req, res) => {
    try {
        const alunos = await Aluno.listar();

        res.json({
            success: true,
            data: alunos,
            total: alunos.length
        });

    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};