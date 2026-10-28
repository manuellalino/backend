const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const updateStatement = require("./updateStatement");

// LISTAR SAÍDAS
router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query("SELECT * FROM saidas", (error, resultado) => {
            conn.release();

            if (error) return res.status(500).send({ error });

            res.status(200).send({ saida: resultado });
        });
    });
});

// BUSCAR SAÍDA POR ID
router.get('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: error });

        conn.query(
            "SELECT * FROM saidas WHERE id_saida = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error: error });

                res.status(200).send({ saida: resultado });
            }
        );
    });
});

// CADASTRAR SAÍDA
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "INSERT INTO saidas (id_produto, id_funcionario, quantidade, valor_unitario, data_saida, destino) VALUES (?, ?, ?, ?, ?, ?)",
            [
                req.body.id_produto,
                req.body.id_funcionario,
                req.body.quantidade,
                req.body.valor_unitario,
                req.body.data_saida,
                req.body.destino
            ],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(201).send({
                    mensagem: "Saída criada com sucesso!",
                    id_saida: resultado.insertId
                });
            }
        );
    });
});

// ATUALIZAR SAÍDA
router.patch('/:id', (req, res, next) => {
    const update = updateStatement(
        'saidas',
        'id_saida',
        ['id_produto', 'id_funcionario', 'quantidade', 'valor_unitario', 'data_saida', 'destino'],
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
                    mensagem: "Saída atualizada com sucesso!"
                });
            }
        );
    });
});

// REMOVER SAÍDA
router.delete('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "DELETE FROM saidas WHERE id_saida = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(202).send({
                    mensagem: "Saída removida com sucesso!"
                });
            }
        );
    });
});

module.exports = router;