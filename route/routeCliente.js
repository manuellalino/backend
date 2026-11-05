const express = require('express');
const router = express.Router();
const { Cliente } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['nome', 'email', 'contato', 'ativo'];

router.get('/', asyncHandler(async (req, res) => {
    const resultado = await Cliente.findAll({ raw: true });
    res.status(200).send({ cliente: resultado });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const resultado = await Cliente.findAll({ where: { id_cliente: req.params.id }, raw: true });
    res.status(200).send({ cliente: resultado });
}));

router.post('/', asyncHandler(async (req, res) => {
    const cliente = await Cliente.create(Object.fromEntries(
        ['nome', 'email', 'contato', 'ativo'].map(campo => [campo, req.body[campo] === undefined ? null : req.body[campo]])
    ));
    res.status(201).send({ mensagem: "Cliente criado com sucesso!", id_cliente: cliente.id_cliente });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    await Cliente.update(values, { where: { id_cliente: req.params.id } });
    res.status(202).send({ mensagem: "Cliente atualizado com sucesso!" });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await Cliente.destroy({ where: { id_cliente: req.params.id } });
    res.status(202).send({ mensagem: "Cliente removido com sucesso!" });
}));

module.exports = router;
