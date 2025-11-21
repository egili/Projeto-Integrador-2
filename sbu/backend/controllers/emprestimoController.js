const db = require('../database/connection');
const Exemplar = require('../models/exemplar');

exports.registrarEmprestimo = async (req, res) => {
    try {
        const { idExemplar, idAluno } = req.body;

        if (!idExemplar || !idAluno) {
            return res.status(400).json({
                success: false,
                error: "idExemplar e idAluno são obrigatórios"
            });
        }

        // verifica exemplar
        const [exemplar] = await db.promise().query(
            'SELECT * FROM exemplar WHERE id = ? AND status = "disponivel"',
            [idExemplar]
        );

        if (exemplar.length === 0) {
            return res.status(404).json({ success: false, error: "Exemplar não encontrado ou não disponível" });
        }

        // registra empréstimo
        const [result] = await db.promise().query(
            "INSERT INTO emprestimo (idExemplar, idAluno, dataEmprestimo, dataDevolucaoReal) VALUES (?, ?, NOW(), NULL)",
            [idExemplar, idAluno]
        );

        // atualiza status
        await db.promise().query(
            'UPDATE exemplar SET status = "emprestado" WHERE id = ?',
            [idExemplar]
        );

        res.json({
            success: true,
            message: "Empréstimo registrado com sucesso",
            data: {
                id: result.insertId,
                idExemplar,
                idAluno
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
};

exports.registrarDevolucao = async (req, res) => {
    try {
        const { id } = req.params;

        const [emp] = await db.promise().query(
            "SELECT * FROM emprestimo WHERE id = ? AND dataDevolucaoReal IS NULL",
            [id]
        );

        if (emp.length === 0) {
            return res.status(404).json({ success: false, error: "Empréstimo não encontrado ou já devolvido" });
        }

        const emprestimo = emp[0];

        await db.promise().query(
            "UPDATE emprestimo SET dataDevolucaoReal = NOW() WHERE id = ?",
            [id]
        );

        // libera exemplar
        await db.promise().query(
            'UPDATE exemplar SET status = "disponivel" WHERE id = ?',
            [emprestimo.idExemplar]
        );

        res.json({
            success: true,
            message: "Devolução registrada com sucesso"
        });

    } catch (error) {
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
};

exports.listarPendentes = async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT 
                e.id,
                l.titulo AS livro,
                a.nome AS aluno,
                DATE_FORMAT(e.dataEmprestimo, '%Y-%m-%dT%H:%i:%s') AS data,
                ex.id AS id_exemplar
            FROM emprestimo e
            JOIN exemplar ex ON ex.id = e.idExemplar
            JOIN livro l ON l.id = ex.idLivro
            JOIN aluno a ON a.id = e.idAluno
            WHERE e.dataDevolucaoReal IS NULL
            ORDER BY e.dataEmprestimo DESC
        `);

        console.log('Empréstimos pendentes:', rows.length, 'registros');
        res.json({ success: true, data: rows, total: rows.length });

    } catch (error) {
        console.error('Erro ao carregar pendentes:', error);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
};

exports.listarHistorico = async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT 
                e.id,
                l.titulo AS livro,
                a.nome AS aluno,
                DATE_FORMAT(e.dataEmprestimo, '%Y-%m-%d %H:%i:%s') AS data_emprestimo,
                DATE_FORMAT(e.dataDevolucaoReal, '%Y-%m-%d %H:%i:%s') AS data_devolucao -- CORREÇÃO: Padronizando para data_devolucao
            FROM emprestimo e
            JOIN exemplar ex ON ex.id = e.idExemplar
            JOIN livro l ON l.id = ex.idLivro
            JOIN aluno a ON a.id = e.idAluno
            WHERE e.dataDevolucaoReal IS NOT NULL
            ORDER BY e.dataEmprestimo DESC
        `);

        console.log('Histórico carregado:', rows.length, 'registros');
        res.json({ success: true, data: rows, total: rows.length });

    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
};