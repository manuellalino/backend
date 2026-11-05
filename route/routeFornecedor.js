const express = require('express');
const router = express.Router();
const { Fornecedor } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['nome', 'empresa', 'email', 'telefone', 'cidade', 'estado', 'ativo'];

router.get('/', asyncHandler(async (req, res) => {
    const resultado = await Fornecedor.findAll({ raw: true });
    res.status(200).send({ fornecedor: resultado });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const resultado = await Fornecedor.findAll({ where: { id_fornecedor: req.params.id }, raw: true });
    res.status(200).send({ fornecedor: resultado });
}));

router.post('/', asyncHandler(async (req, res) => {
    const fornecedor = await Fornecedor.create(Object.fromEntries(
        campos.map(campo => [campo, req.body[campo] === undefined ? null : req.body[campo]])
    ));
    res.status(201).send({ mensagem: "Fornecedor criado com sucesso!", id_fornecedor: fornecedor.id_fornecedor });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    await Fornecedor.update(values, { where: { id_fornecedor: req.params.id } });
    res.status(202).send({ mensagem: "Fornecedor atualizado com sucesso!" });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await Fornecedor.destroy({ where: { id_fornecedor: req.params.id } });
    res.status(202).send({ mensagem: "Fornecedor removido com sucesso!" });
}));

module.exports = router;
