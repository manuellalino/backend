const express = require('express');
const router = express.Router();
const { HistoricoPreco } = require('../models');
const asyncHandler = require('./asyncHandler');

router.get('/:idProduto/historico-precos', asyncHandler(async (req, res) => {
    const resultado = await HistoricoPreco.findAll({
        attributes: ['id_historico', 'id_produto', 'preco', 'vigencia'],
        where: { id_produto: req.params.idProduto },
        order: [['vigencia', 'DESC'], ['id_historico', 'DESC']],
        raw: true
    });
    res.status(200).send({ historico: resultado });
}));

module.exports = router;
