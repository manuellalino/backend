const express = require('express');
const router = express.Router();
const { Categoria } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['nome', 'descricao', 'ativo'];

router.get('/', asyncHandler(async (req, res) => {
    const resultado = await Categoria.findAll({ raw: true });
    res.status(200).send({ categoria: resultado });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const categoria = await Categoria.findByPk(req.params.id, { raw: true });
    if (!categoria) return res.status(404).send({ mensagem: "Categoria não encontrada." });
    res.status(200).send({ categoria });
}));

router.post('/', asyncHandler(async (req, res) => {
    if (!req.body.nome) return res.status(400).send({ mensagem: "O campo nome é obrigatório." });
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    const categoria = await Categoria.create(values);
    res.status(201).send({ mensagem: "Categoria criada com sucesso!", id_categoria: categoria.id_categoria });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    await Categoria.update(values, { where: { id_categoria: req.params.id } });
    res.status(200).send({ mensagem: "Categoria atualizada com sucesso!" });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    const removidos = await Categoria.destroy({ where: { id_categoria: req.params.id } });
    if (removidos === 0) return res.status(404).send({ mensagem: "Categoria não encontrada." });
    res.status(200).send({ mensagem: "Categoria removida com sucesso!" });
}));

module.exports = router;
