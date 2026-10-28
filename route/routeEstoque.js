const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const campos = ['estoque_minimo', 'estoque_maximo', 'localizacao'];

router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            `SELECT e.id_estoque, p.id_produto,
                    COALESCE(e.quantidade, 0) AS quantidade,
                    COALESCE(e.estoque_minimo, 0) AS estoque_minimo,
                    COALESCE(e.estoque_maximo, 0) AS estoque_maximo,
                    e.localizacao, p.nome AS produto
             FROM produtos p
             LEFT JOIN estoque e ON e.id_produto = p.id_produto
             ORDER BY p.nome`,
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                res.status(200).send({ estoque: resultado });
            }
        );
    });
});

router.get('/:idProduto', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            `SELECT e.id_estoque, p.id_produto,
                    COALESCE(e.quantidade, 0) AS quantidade,
                    COALESCE(e.estoque_minimo, 0) AS estoque_minimo,
                    COALESCE(e.estoque_maximo, 0) AS estoque_maximo,
                    e.localizacao, p.nome AS produto
             FROM produtos p
             LEFT JOIN estoque e ON e.id_produto = p.id_produto
             WHERE p.id_produto = ?`,
            [req.params.idProduto],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                if (resultado.length === 0) return res.status(404).send({ mensagem: "Produto não encontrado." });
                res.status(200).send({ estoque: resultado[0] });
            }
        );
    });
});

router.patch('/:idProduto', (req, res) => {
    const atualizados = campos.filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo));
    if (atualizados.length === 0) {
        return res.status(400).send({ mensagem: "Informe limites ou localização para atualizar; quantidade é gerenciada pelas entradas e saídas." });
    }
    for (const campo of ['estoque_minimo', 'estoque_maximo']) {
        if (Object.prototype.hasOwnProperty.call(req.body, campo) &&
            (!Number.isInteger(Number(req.body[campo])) || Number(req.body[campo]) < 0)) {
            return res.status(400).send({ mensagem: `${campo} deve ser um inteiro não negativo.` });
        }
    }
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        const colunas = ['id_produto', ...atualizados];
        const valores = [req.params.idProduto, ...atualizados.map(campo => req.body[campo])];
        const atualizacoes = atualizados.map(campo => `${campo} = VALUES(${campo})`).join(', ');
        const marcadores = colunas.map(() => '?').join(', ');
        conn.query(
            `INSERT INTO estoque (${colunas.join(', ')}) VALUES (${marcadores})
             ON DUPLICATE KEY UPDATE ${atualizacoes}`,
            valores,
            (error) => {
            conn.release();
            if (error) return res.status(500).send({ error });
            res.status(200).send({ mensagem: "Configurações de estoque atualizadas com sucesso!" });
            }
        );
    });
});

module.exports = router;
