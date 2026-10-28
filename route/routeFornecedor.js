const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const updateStatement = require("./updateStatement");

// LISTAR FORNECEDORES
router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query("SELECT * FROM fornecedores", (error, resultado) => {
            conn.release();

            if (error) return res.status(500).send({ error });

            res.status(200).send({ fornecedor: resultado });
        });
    });
});

// BUSCAR FORNECEDOR POR ID
router.get('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: error });

        conn.query(
            "SELECT * FROM fornecedores WHERE id_fornecedor = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error: error });

                res.status(200).send({ fornecedor: resultado });
            }
        );
    });
});

// CADASTRAR FORNECEDOR
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "INSERT INTO fornecedores (nome, empresa, email, telefone, cidade, estado, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)",

            [
                req.body.nome,
                req.body.empresa,
                req.body.email,
                req.body.telefone,
                req.body.cidade,
                req.body.estado,
                req.body.ativo
            ],

            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(201).send({
                    mensagem: "Fornecedor criado com sucesso!",
                    id_fornecedor: resultado.insertId
                });
            }
        );
    });
});

// ATUALIZAR FORNECEDOR
router.patch('/:id', (req, res, next) => {
    const update = updateStatement(
        'fornecedores',
        'id_fornecedor',
        ['nome', 'empresa', 'email', 'telefone', 'cidade', 'estado', 'ativo'],
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
                    mensagem: "Fornecedor atualizado com sucesso!"
                });
            }
        );
    });
});

// REMOVER FORNECEDOR
router.delete('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "DELETE FROM fornecedores WHERE id_fornecedor = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(202).send({
                    mensagem: "Fornecedor removido com sucesso!"
                });
            }
        );
    });
});

module.exports = router;