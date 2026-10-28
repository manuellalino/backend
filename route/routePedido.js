const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const updateStatement = require("./updateStatement");

// LISTAR PEDIDOS
router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query("SELECT * FROM pedidos", (error, resultado) => {
            conn.release();

            if (error) return res.status(500).send({ error });

            res.status(200).send({ pedido: resultado });
        });
    });
});

// BUSCAR PEDIDO POR ID
router.get('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: error });

        conn.query(
            "SELECT * FROM pedidos WHERE id_pedido = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error: error });

                res.status(200).send({ pedido: resultado });
            }
        );
    });
});

// CADASTRAR PEDIDO
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "INSERT INTO pedidos (status, data_pedido, id_cliente) VALUES (?, ?, ?)",

            [
                req.body.status,
                req.body.data_pedido,
                req.body.id_cliente
            ],

            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(201).send({
                    mensagem: "Pedido criado com sucesso!",
                    id_pedido: resultado.insertId
                });
            }
        );
    });
});

// ATUALIZAR PEDIDO
router.patch('/:id', (req, res, next) => {
    const update = updateStatement('pedidos', 'id_pedido', ['status', 'data_pedido', 'id_cliente'], req.body, req.params.id);
    if (!update) return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(update.sql, update.values,
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(202).send({
                    mensagem: "Pedido atualizado com sucesso!"
                });
            }
        );
    });
});

// REMOVER PEDIDO
router.delete('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "DELETE FROM pedidos WHERE id_pedido = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(202).send({
                    mensagem: "Pedido removido com sucesso!"
                });
            }
        );
    });
});

module.exports = router;