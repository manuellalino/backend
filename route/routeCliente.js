const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const updateStatement = require("./updateStatement");

// LISTAR CLIENTES
router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query("SELECT * FROM clientes", (error, resultado) => {
            conn.release();

            if (error) return res.status(500).send({ error });

            res.status(200).send({ cliente: resultado });
        });
    });
});

// BUSCAR CLIENTE POR ID
router.get('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: error });

        conn.query(
            "SELECT * FROM clientes WHERE id_cliente = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error: error });

                res.status(200).send({ cliente: resultado });
            }
        );
    });
});

// CADASTRAR CLIENTE
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "INSERT INTO clientes (nome, email, contato, ativo) VALUES (?, ?, ?, ?)",

            [
                req.body.nome,
                req.body.email,
                req.body.contato,
                req.body.ativo
            ],

            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(201).send({
                    mensagem: "Cliente criado com sucesso!",
                    id_cliente: resultado.insertId
                });
            }
        );
    });
});

// ATUALIZAR CLIENTE
router.patch('/:id', (req, res, next) => {
    const update = updateStatement('clientes', 'id_cliente', ['nome', 'email', 'contato', 'ativo'], req.body, req.params.id);
    if (!update) return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(update.sql, update.values,
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(202).send({
                    mensagem: "Cliente atualizado com sucesso!"
                });
            }
        );
    });
});

// REMOVER CLIENTE
router.delete('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "DELETE FROM clientes WHERE id_cliente = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(202).send({
                    mensagem: "Cliente removido com sucesso!"
                });
            }
        );
    });
});

module.exports = router;