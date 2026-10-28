const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;
const campos = ['id_produto', 'quantidade', 'valor_unitario'];

router.get('/:idPedido/itens', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            `SELECT i.*, p.nome AS produto
             FROM pedido_itens i
             LEFT JOIN produtos p ON p.id_produto = i.id_produto
             WHERE i.id_pedido = ?
             ORDER BY i.id_item`,
            [req.params.idPedido],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                res.status(200).send({ itens: resultado });
            }
        );
    });
});

router.post('/:idPedido/itens', (req, res) => {
    const { id_produto, quantidade, valor_unitario } = req.body;
    if (!id_produto || !Number.isInteger(Number(quantidade)) || Number(quantidade) <= 0 ||
        !Number.isFinite(Number(valor_unitario)) || Number(valor_unitario) < 0) {
        return res.status(400).send({ mensagem: "Informe produto, quantidade positiva e valor unitário válido." });
    }
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            `INSERT INTO pedido_itens (id_pedido, id_produto, quantidade, valor_unitario, subtotal)
             VALUES (?, ?, ?, ?, ROUND(? * ?, 2))`,
            [req.params.idPedido, id_produto, quantidade, valor_unitario, quantidade, valor_unitario],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                res.status(201).send({ mensagem: "Item adicionado ao pedido!", id_item: resultado.insertId });
            }
        );
    });
});

router.patch('/:idPedido/itens/:idItem', (req, res) => {
    const atualizados = campos.filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo));
    if (atualizados.length === 0) return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    if (Object.prototype.hasOwnProperty.call(req.body, 'quantidade') &&
        (!Number.isInteger(Number(req.body.quantidade)) || Number(req.body.quantidade) <= 0)) {
        return res.status(400).send({ mensagem: "A quantidade deve ser um inteiro positivo." });
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'valor_unitario') &&
        (!Number.isFinite(Number(req.body.valor_unitario)) || Number(req.body.valor_unitario) < 0)) {
        return res.status(400).send({ mensagem: "O valor unitário deve ser válido e não negativo." });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        const sets = atualizados.map(campo => `${campo} = ?`);
        const valores = atualizados.map(campo => req.body[campo]);
        sets.push('subtotal = ROUND(quantidade * valor_unitario, 2)');
        valores.push(req.params.idPedido, req.params.idItem);
        conn.query(
            `UPDATE pedido_itens SET ${sets.join(', ')} WHERE id_pedido = ? AND id_item = ?`,
            valores,
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                res.status(200).send({ mensagem: "Item do pedido atualizado com sucesso!" });
            }
        );
    });
});

router.delete('/:idPedido/itens/:idItem', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            "DELETE FROM pedido_itens WHERE id_pedido = ? AND id_item = ?",
            [req.params.idPedido, req.params.idItem],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                if (resultado.affectedRows === 0) return res.status(404).send({ mensagem: "Item não encontrado neste pedido." });
                res.status(200).send({ mensagem: "Item removido do pedido com sucesso!" });
            }
        );
    });
});

module.exports = router;
