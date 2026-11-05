const express = require('express');
const router = express.Router();
const { Entrada } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['id_produto', 'id_fornecedor', 'quantidade', 'valor_unitario', 'data_entrada', 'observacao'];

router.get('/', asyncHandler(async (req, res) => {
    const resultado = await Entrada.findAll({ raw: true });
    res.status(200).send({ entrada: resultado });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const resultado = await Entrada.findAll({ where: { id_entrada: req.params.id }, raw: true });
    res.status(200).send({ entrada: resultado });
}));

router.post('/', asyncHandler(async (req, res) => {
    const entrada = await Entrada.create(Object.fromEntries(
        campos.map(campo => [campo, req.body[campo] === undefined ? null : req.body[campo]])
    ));
    res.status(201).send({ mensagem: "Entrada criada com sucesso!", id_entrada: entrada.id_entrada });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    await Entrada.update(values, { where: { id_entrada: req.params.id } });
    res.status(202).send({ mensagem: "Entrada atualizada com sucesso!" });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await Entrada.destroy({ where: { id_entrada: req.params.id } });
    res.status(202).send({ mensagem: "Entrada removida com sucesso!" });
}));

module.exports = router;
