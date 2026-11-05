const express = require('express');
const router = express.Router();
const { Pedido } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['status', 'data_pedido', 'id_cliente'];

router.get('/', asyncHandler(async (req, res) => {
    const resultado = await Pedido.findAll({ raw: true });
    res.status(200).send({ pedido: resultado });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const resultado = await Pedido.findAll({ where: { id_pedido: req.params.id }, raw: true });
    res.status(200).send({ pedido: resultado });
}));

router.post('/', asyncHandler(async (req, res) => {
    const pedido = await Pedido.create({
        status: req.body.status,
        data_pedido: req.body.data_pedido,
        id_cliente: req.body.id_cliente
    });
    res.status(201).send({ mensagem: "Pedido criado com sucesso!", id_pedido: pedido.id_pedido });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    await Pedido.update(values, { where: { id_pedido: req.params.id } });
    res.status(202).send({ mensagem: "Pedido atualizado com sucesso!" });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await Pedido.destroy({ where: { id_pedido: req.params.id } });
    res.status(202).send({ mensagem: "Pedido removido com sucesso!" });
}));

module.exports = router;
