const express = require('express');
const router = express.Router();
const { literal } = require('sequelize');
const { PedidoItem } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['id_produto', 'quantidade', 'valor_unitario'];

router.get('/:idPedido/itens', asyncHandler(async (req, res) => {
    const resultado = await PedidoItem.findAll({
        attributes: ['id_item', 'id_pedido', 'id_produto', 'quantidade', 'valor_unitario', 'subtotal'],
        where: { id_pedido: req.params.idPedido },
        include: [{ association: 'produto', attributes: ['nome'], required: false }],
        order: [['id_item', 'ASC']]
    });
    const itens = resultado.map(item => {
        const plain = item.get({ plain: true });
        return { ...plain, produto: plain.produto ? plain.produto.nome : null };
    });
    res.status(200).send({ itens });
}));

router.post('/:idPedido/itens', asyncHandler(async (req, res) => {
    const { id_produto, quantidade, valor_unitario } = req.body;
    if (!id_produto || !Number.isInteger(Number(quantidade)) || Number(quantidade) <= 0 ||
        !Number.isFinite(Number(valor_unitario)) || Number(valor_unitario) < 0) {
        return res.status(400).send({ mensagem: "Informe produto, quantidade positiva e valor unitário válido." });
    }
    const subtotal = literal(`ROUND(${Number(quantidade)} * ${Number(valor_unitario)}, 2)`);
    const item = await PedidoItem.create({
        id_pedido: req.params.idPedido,
        id_produto,
        quantidade,
        valor_unitario,
        subtotal
    });
    res.status(201).send({ mensagem: "Item adicionado ao pedido!", id_item: item.id_item });
}));

router.patch('/:idPedido/itens/:idItem', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'quantidade') &&
        (!Number.isInteger(Number(req.body.quantidade)) || Number(req.body.quantidade) <= 0)) {
        return res.status(400).send({ mensagem: "A quantidade deve ser um inteiro positivo." });
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'valor_unitario') &&
        (!Number.isFinite(Number(req.body.valor_unitario)) || Number(req.body.valor_unitario) < 0)) {
        return res.status(400).send({ mensagem: "O valor unitário deve ser válido e não negativo." });
    }
    await PedidoItem.update({
        ...values,
        subtotal: literal('ROUND(quantidade * valor_unitario, 2)')
    }, {
        where: { id_pedido: req.params.idPedido, id_item: req.params.idItem }
    });
    res.status(200).send({ mensagem: "Item do pedido atualizado com sucesso!" });
}));

router.delete('/:idPedido/itens/:idItem', asyncHandler(async (req, res) => {
    const removidos = await PedidoItem.destroy({
        where: { id_pedido: req.params.idPedido, id_item: req.params.idItem }
    });
    if (removidos === 0) return res.status(404).send({ mensagem: "Item não encontrado neste pedido." });
    res.status(200).send({ mensagem: "Item removido do pedido com sucesso!" });
}));

module.exports = router;
