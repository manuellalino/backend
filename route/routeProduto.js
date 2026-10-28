const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const updateStatement = require("./updateStatement");

// LISTAR PRODUTOS
router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query("SELECT * FROM produtos", (error, resultado) => {
            conn.release();

            if (error) return res.status(500).send({ error });

            res.status(200).send({ produto: resultado });
        });
    });
});

// BUSCAR PRODUTO POR ID
router.get('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: error });

        conn.query(
            "SELECT * FROM produtos WHERE id_produto = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error: error });

                res.status(200).send({ produto: resultado });
            }
        );
    });
});

// CADASTRAR PRODUTO
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "INSERT INTO produtos (nome, descricao, preco, imagem_produto, id_categoria) VALUES (?, ?, ?, ?, ?)",

            [
                req.body.nome,
                req.body.descricao,
                req.body.preco,
                req.body.imagem_produto,
                req.body.id_categoria
            ],

            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(201).send({
                    mensagem: "Produto criado com sucesso!",
                    id_produto: resultado.insertId
                });
            }
        );
    });
});

// ATUALIZAR PRODUTO
router.patch('/:id', (req, res, next) => {
    const update = updateStatement(
        'produtos',
        'id_produto',
        ['nome', 'descricao', 'preco', 'imagem_produto', 'id_categoria'],
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
                    mensagem: "Produto atualizado com sucesso!"
                });
            }
        );
    });
});

// REMOVER PRODUTO
router.delete('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });

        conn.query(
            "DELETE FROM produtos WHERE id_produto = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();

                if (error) return res.status(500).send({ error });

                res.status(202).send({
                    mensagem: "Produto removido com sucesso!"
                });
            }
        );
    });
});

module.exports = router;