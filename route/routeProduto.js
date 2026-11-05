const express = require('express');
const router = express.Router();
const { Produto } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['nome', 'descricao', 'preco', 'imagem_produto', 'id_categoria'];

router.get('/', asyncHandler(async (req, res) => {
    const resultado = await Produto.findAll({ raw: true });
    res.status(200).send({ produto: resultado });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const resultado = await Produto.findAll({ where: { id_produto: req.params.id }, raw: true });
    res.status(200).send({ produto: resultado });
}));

router.post('/', asyncHandler(async (req, res) => {
    const produto = await Produto.create({
        nome: req.body.nome,
        descricao: req.body.descricao,
        preco: req.body.preco,
        imagem_produto: req.body.imagem_produto,
        id_categoria: req.body.id_categoria
    });
    res.status(201).send({ mensagem: "Produto criado com sucesso!", id_produto: produto.id_produto });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    await Produto.update(values, { where: { id_produto: req.params.id } });
    res.status(202).send({ mensagem: "Produto atualizado com sucesso!" });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await Produto.destroy({ where: { id_produto: req.params.id } });
    res.status(202).send({ mensagem: "Produto removido com sucesso!" });
}));

module.exports = router;
