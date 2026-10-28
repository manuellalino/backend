const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;

// LISTAR USUÁRIOS
router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query("SELECT id_usu, nome, email, contato, genero, ativo, criado_em, atualizado_em FROM usuarios", (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error });
            res.status(200).send({ usuario: resultado });
        });
    });
});

// BUSCAR USUÁRIO POR ID
router.get('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: error });
        conn.query("SELECT id_usu, nome, email, contato, genero, ativo, criado_em, atualizado_em FROM usuarios WHERE id_usu = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error: error });
                if (resultado.length === 0) return res.status(404).send({ mensagem: "Usuário não encontrado." });
                res.status(200).send({ usuario: resultado[0] });
            }
        );
    });
});

// CADASTRAR USUÁRIO
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query("INSERT INTO usuarios (nome, email, senha, contato, genero, ativo) VALUES (?, ?, ?, ?, ?, ?)",

            [
                req.body.nome,
                req.body.email,
                req.body.senha,
                req.body.contato || null,
                req.body.genero || null,
                req.body.ativo === undefined ? 1 : req.body.ativo
            ],

            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                res.status(201).send({
                    mensagem: "Usuário criado com sucesso!",
                    id_usu: resultado.insertId
                });
            }
        );
    });
});

// ATUALIZAR USUÁRIO
router.patch('/:id', (req, res, next) => {
    const campos = ['nome', 'email', 'senha', 'contato', 'genero', 'ativo'];
    const atualizados = campos.filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo));
    if (atualizados.length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        const sets = atualizados.map(campo => `${campo} = ?`).join(', ');
        const valores = atualizados.map(campo => req.body[campo]);
        valores.push(req.params.id);
        conn.query(`UPDATE usuarios SET ${sets} WHERE id_usu = ?`, valores, (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                res.status(200).send({ mensagem: "Usuário atualizado com sucesso!" });
            }
        );
    });
});

// REMOVER USUÁRIO
router.delete('/:id', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            "DELETE FROM usuarios WHERE id_usu = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                if (resultado.affectedRows === 0) return res.status(404).send({ mensagem: "Usuário não encontrado." });
                res.status(200).send({ mensagem: "Usuário removido com sucesso!" });
            }
        );
    });
});

module.exports = router;