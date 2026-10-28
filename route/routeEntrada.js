const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const updateStatement = require("./updateStatement");

// LISTAR ENTRADAS
router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query("SELECT * FROM entradas", (error, resultado) => {
            conn.release();

            if (error) return res.status(500).send({ error });

            res.status(200).send({ entrada: resultado });
        });
    });
});

// BUSCAR ENTRADA POR ID
router.get('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: error });

        conn.query(
            "SELECT * FROM entradas WHERE id_entrada = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error: error });

                res.status(200).send({ entrada: resultado });
            }
        );
    });
});

// CADASTRAR ENTRADA
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "INSERT INTO entradas (id_produto, id_fornecedor, quantidade, valor_unitario, data_entrada, observacao) VALUES (?, ?, ?, ?, ?, ?)",

            [
                req.body.id_produto,
                req.body.id_fornecedor,
                req.body.quantidade,
                req.body.valor_unitario,
                req.body.data_entrada,
                req.body.observacao
            ],

            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(201).send({
                    mensagem: "Entrada criada com sucesso!",
                    id_entrada: resultado.insertId
                });
            }
        );
    });
});

// ATUALIZAR ENTRADA
router.patch('/:id', (req, res, next) => {
    const update = updateStatement(
        'entradas',
        'id_entrada',
        ['id_produto', 'id_fornecedor', 'quantidade', 'valor_unitario', 'data_entrada', 'observacao'],
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
                    mensagem: "Entrada atualizada com sucesso!"
                });
            }
        );
    });
});

// REMOVER ENTRADA
router.delete('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "DELETE FROM entradas WHERE id_entrada = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(202).send({
                    mensagem: "Entrada removida com sucesso!"
                });
            }
        );
    });
});

module.exports = router;