const express = require('express');
const router = express.Router();
const { Saida } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['id_produto', 'id_funcionario', 'quantidade', 'valor_unitario', 'data_saida', 'destino'];

router.get('/', asyncHandler(async (req, res) => {
    const resultado = await Saida.findAll({ raw: true });
    res.status(200).send({ saida: resultado });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const resultado = await Saida.findAll({ where: { id_saida: req.params.id }, raw: true });
    res.status(200).send({ saida: resultado });
}));

router.post('/', asyncHandler(async (req, res) => {
    const saida = await Saida.create(Object.fromEntries(
        campos.map(campo => [campo, req.body[campo] === undefined ? null : req.body[campo]])
    ));
    res.status(201).send({ mensagem: "Saída criada com sucesso!", id_saida: saida.id_saida });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    await Saida.update(values, { where: { id_saida: req.params.id } });
    res.status(202).send({ mensagem: "Saída atualizada com sucesso!" });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await Saida.destroy({ where: { id_saida: req.params.id } });
    res.status(202).send({ mensagem: "Saída removida com sucesso!" });
}));

module.exports = router;
