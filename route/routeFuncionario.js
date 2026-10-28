const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;

const campos = ['nome', 'cargo', 'salario', 'telefone', 'email', 'data_admissao', 'ativo'];

router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query("SELECT * FROM funcionarios", (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error });
            res.status(200).send({ funcionario: resultado });
        });
    });
});

router.get('/:id', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query("SELECT * FROM funcionarios WHERE id_funcionario = ?",
            [req.params.id],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                if (resultado.length === 0) {
                    return res.status(404).send({ mensagem: "Funcionário não encontrado." });
                }
                res.status(200).send({ funcionario: resultado[0] });
            }
        );
    });
});

router.post('/', (req, res) => {
    if (!req.body.nome || !req.body.cargo || req.body.salario === undefined) {
        return res.status(400).send({ mensagem: "Nome, cargo e salário são obrigatórios." });
    }
    const camposRecebidos = campos.filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo));
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        const colunas = camposRecebidos.join(', ');
        const marcadores = camposRecebidos.map(() => '?').join(', ');
        conn.query(
            `INSERT INTO funcionarios (${colunas}) VALUES (${marcadores})`,
            camposRecebidos.map(campo => req.body[campo]),
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                res.status(201).send({
                    mensagem: "Funcionário criado com sucesso!",
                    id_funcionario: resultado.insertId
                });
            }
        );
    });
});

router.patch('/:id', (req, res) => {
    const camposAtualizados = campos.filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo));
    if (camposAtualizados.length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        const atualizacoes = camposAtualizados.map(campo => `${campo} = ?`).join(', ');
        const valores = camposAtualizados.map(campo => req.body[campo]);
        valores.push(req.params.id);
        conn.query(`UPDATE funcionarios SET ${atualizacoes} WHERE id_funcionario = ?`, valores,
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                res.status(200).send({ mensagem: "Funcionário atualizado com sucesso!" });
            }
        );
    });
});

router.delete('/:id', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query("UPDATE funcionarios SET ativo = 0 WHERE id_funcionario = ?", [req.params.id],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                if (resultado.affectedRows === 0) {
                    return res.status(404).send({ mensagem: "Funcionário não encontrado." });
                }
                res.status(200).send({ mensagem: "Funcionário desativado com sucesso!" });
            }
        );
    });
});

module.exports = router;
