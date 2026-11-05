const express = require('express');
const router = express.Router();
const { Funcionario } = require('../models');
const asyncHandler = require('./asyncHandler');
const campos = ['nome', 'cargo', 'salario', 'telefone', 'email', 'data_admissao', 'ativo'];

router.get('/', asyncHandler(async (req, res) => {
    const resultado = await Funcionario.findAll({ raw: true });
    res.status(200).send({ funcionario: resultado });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const funcionario = await Funcionario.findByPk(req.params.id, { raw: true });
    if (!funcionario) return res.status(404).send({ mensagem: "Funcionário não encontrado." });
    res.status(200).send({ funcionario });
}));

router.post('/', asyncHandler(async (req, res) => {
    if (!req.body.nome || !req.body.cargo || req.body.salario === undefined) {
        return res.status(400).send({ mensagem: "Nome, cargo e salário são obrigatórios." });
    }
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    const funcionario = await Funcionario.create(values);
    res.status(201).send({ mensagem: "Funcionário criado com sucesso!", id_funcionario: funcionario.id_funcionario });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    await Funcionario.update(values, { where: { id_funcionario: req.params.id } });
    res.status(200).send({ mensagem: "Funcionário atualizado com sucesso!" });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    const atualizados = await Funcionario.update(
        { ativo: 0 },
        { where: { id_funcionario: req.params.id } }
    );
    if (atualizados[0] === 0) {
        return res.status(404).send({ mensagem: "Funcionário não encontrado." });
    }
    res.status(200).send({ mensagem: "Funcionário desativado com sucesso!" });
}));

module.exports = router;
