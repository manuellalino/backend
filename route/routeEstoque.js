const express = require('express');
const router = express.Router();
const { Produto, Estoque } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['estoque_minimo', 'estoque_maximo', 'localizacao'];

async function obterEstoque(idProduto) {
    const produto = await Produto.findByPk(idProduto, {
        attributes: ['id_produto', 'nome'],
        include: [{
            association: 'estoque',
            attributes: ['id_estoque', 'quantidade', 'estoque_minimo', 'estoque_maximo', 'localizacao'],
            required: false
        }]
    });
    if (!produto) return null;
    const estoque = produto.estoque;
    return {
        id_estoque: estoque ? estoque.id_estoque : null,
        id_produto: produto.id_produto,
        quantidade: estoque && estoque.quantidade !== null ? estoque.quantidade : 0,
        estoque_minimo: estoque && estoque.estoque_minimo !== null ? estoque.estoque_minimo : 0,
        estoque_maximo: estoque && estoque.estoque_maximo !== null ? estoque.estoque_maximo : 0,
        localizacao: estoque ? estoque.localizacao : null,
        produto: produto.nome
    };
}

router.get('/', asyncHandler(async (req, res) => {
    const produtos = await Produto.findAll({
        attributes: ['id_produto', 'nome'],
        include: [{
            association: 'estoque',
            attributes: ['id_estoque', 'quantidade', 'estoque_minimo', 'estoque_maximo', 'localizacao'],
            required: false
        }],
        order: [['nome', 'ASC']]
    });
    const estoque = produtos.map(produto => {
        const item = produto.get({ plain: true });
        const quantidade = item.estoque;
        return {
            id_estoque: quantidade ? quantidade.id_estoque : null,
            id_produto: item.id_produto,
            quantidade: quantidade && quantidade.quantidade !== null ? quantidade.quantidade : 0,
            estoque_minimo: quantidade && quantidade.estoque_minimo !== null ? quantidade.estoque_minimo : 0,
            estoque_maximo: quantidade && quantidade.estoque_maximo !== null ? quantidade.estoque_maximo : 0,
            localizacao: quantidade ? quantidade.localizacao : null,
            produto: item.nome
        };
    });
    res.status(200).send({ estoque });
}));

router.get('/:idProduto', asyncHandler(async (req, res) => {
    const estoque = await obterEstoque(req.params.idProduto);
    if (!estoque) return res.status(404).send({ mensagem: "Produto não encontrado." });
    res.status(200).send({ estoque });
}));

router.patch('/:idProduto', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe limites ou localização para atualizar; quantidade é gerenciada pelas entradas e saídas." });
    }
    for (const campo of ['estoque_minimo', 'estoque_maximo']) {
        if (Object.prototype.hasOwnProperty.call(values, campo) &&
            (!Number.isInteger(Number(values[campo])) || Number(values[campo]) < 0)) {
            return res.status(400).send({ mensagem: `${campo} deve ser um inteiro não negativo.` });
        }
    }
    await Estoque.upsert({
        id_produto: req.params.idProduto,
        ...values
    }, {
        updateOnDuplicate: Object.keys(values)
    });
    res.status(200).send({ mensagem: "Configurações de estoque atualizadas com sucesso!" });
}));

module.exports = router;
