const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const updateStatement = require("./updateStatement");

// LISTAR MOVIMENTAÇÕES
router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query("SELECT * FROM movimentacoes", (error, resultado) => {
            conn.release();

            if (error) return res.status(500).send({ error });

            res.status(200).send({ movimentacao: resultado });
        });
    });
});

// BUSCAR MOVIMENTAÇÃO POR ID
router.get('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: error });

        conn.query(
            "SELECT * FROM movimentacoes WHERE id_movimentacao = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error: error });

                res.status(200).send({ movimentacao: resultado });
            }
        );
    });
});

// CADASTRAR MOVIMENTAÇÃO
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "INSERT INTO movimentacoes (id_produto, tipo, quantidade, data_movimentacao, observacao) VALUES (?, ?, ?, ?, ?)",
            [
                req.body.id_produto,
                req.body.tipo,
                req.body.quantidade,
                req.body.data_movimentacao,
                req.body.observacao
            ],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(201).send({
                    mensagem: "Movimentação criada com sucesso!",
                    id_movimentacao: resultado.insertId
                });
            }
        );
    });
});

// ATUALIZAR MOVIMENTAÇÃO
router.patch('/:id', (req, res, next) => {
    const update = updateStatement(
        'movimentacoes',
        'id_movimentacao',
        ['id_produto', 'tipo', 'quantidade', 'data_movimentacao', 'observacao'],
        req.body,
        req.params.id
    );
    if (!update) return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(update.sql, update.values,
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(202).send({
                    mensagem: "Movimentação atualizada com sucesso!"
                });
            }
        );
    });
});

// REMOVER MOVIMENTAÇÃO
router.delete('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "DELETE FROM movimentacoes WHERE id_movimentacao = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(202).send({
                    mensagem: "Movimentação removida com sucesso!"
                });
            }
        );
    });
});

module.exports = router;