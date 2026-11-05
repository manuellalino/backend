const express = require('express');
const router = express.Router();
const { Movimentacao } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['id_produto', 'tipo', 'quantidade', 'data_movimentacao', 'observacao'];

router.get('/', asyncHandler(async (req, res) => {
    const resultado = await Movimentacao.findAll({ raw: true });
    res.status(200).send({ movimentacao: resultado });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const resultado = await Movimentacao.findAll({ where: { id_movimentacao: req.params.id }, raw: true });
    res.status(200).send({ movimentacao: resultado });
}));

router.post('/', asyncHandler(async (req, res) => {
    const movimentacao = await Movimentacao.create(Object.fromEntries(
        campos.map(campo => [campo, req.body[campo] === undefined ? null : req.body[campo]])
    ));
    res.status(201).send({ mensagem: "Movimentação criada com sucesso!", id_movimentacao: movimentacao.id_movimentacao });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    await Movimentacao.update(values, { where: { id_movimentacao: req.params.id } });
    res.status(202).send({ mensagem: "Movimentação atualizada com sucesso!" });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await Movimentacao.destroy({ where: { id_movimentacao: req.params.id } });
    res.status(202).send({ mensagem: "Movimentação removida com sucesso!" });
}));

module.exports = router;
