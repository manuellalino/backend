const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const campos = ['nome', 'descricao', 'ativo'];

router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query("SELECT * FROM categorias", (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error });
            res.status(200).send({ categoria: resultado });
        });
    });
});

router.get('/:id', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query("SELECT * FROM categorias WHERE id_categoria = ?", [req.params.id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error });
            if (resultado.length === 0) return res.status(404).send({ mensagem: "Categoria não encontrada." });
            res.status(200).send({ categoria: resultado[0] });
        });
    });
});

router.post('/', (req, res) => {
    const camposRecebidos = campos.filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo));
    if (!req.body.nome) return res.status(400).send({ mensagem: "O campo nome é obrigatório." });
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        const colunas = camposRecebidos.join(', ');
        const marcadores = camposRecebidos.map(() => '?').join(', ');
        conn.query(
            `INSERT INTO categorias (${colunas}) VALUES (${marcadores})`,
            camposRecebidos.map(campo => req.body[campo]),
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                res.status(201).send({ mensagem: "Categoria criada com sucesso!", id_categoria: resultado.insertId });
            }
        );
    });
});

router.patch('/:id', (req, res) => {
    const atualizados = campos.filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo));
    if (atualizados.length === 0) return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        const sets = atualizados.map(campo => `${campo} = ?`).join(', ');
        const valores = atualizados.map(campo => req.body[campo]);
        valores.push(req.params.id);
        conn.query(`UPDATE categorias SET ${sets} WHERE id_categoria = ?`, valores, (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error });
            res.status(200).send({ mensagem: "Categoria atualizada com sucesso!" });
        });
    });
});

router.delete('/:id', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query("DELETE FROM categorias WHERE id_categoria = ?", [req.params.id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error });
            if (resultado.affectedRows === 0) return res.status(404).send({ mensagem: "Categoria não encontrada." });
            res.status(200).send({ mensagem: "Categoria removida com sucesso!" });
        });
    });
});

module.exports = router;
