const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Usuario } = require('../models');
const asyncHandler = require('./asyncHandler');
const atributosPublicos = ['id_usu', 'nome', 'email', 'contato', 'genero', 'ativo', 'criado_em', 'atualizado_em'];
const campos = ['nome', 'email', 'senha', 'contato', 'genero', 'ativo'];
const hashSenha = senha => bcrypt.hash(senha, 10);

router.get('/', asyncHandler(async (req, res) => {
    const resultado = await Usuario.findAll({ attributes: atributosPublicos, raw: true });
    res.status(200).send({ usuario: resultado });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const usuario = await Usuario.findByPk(req.params.id, { attributes: atributosPublicos, raw: true });
    if (!usuario) return res.status(404).send({ mensagem: "Usuário não encontrado." });
    res.status(200).send({ usuario });
}));

router.post('/', asyncHandler(async (req, res) => {
    if (typeof req.body.senha !== 'string' || !req.body.senha) {
        return res.status(400).send({ mensagem: "Informe uma senha válida." });
    }
    const usuario = await Usuario.create({
        nome: req.body.nome,
        email: req.body.email,
        senha: await hashSenha(req.body.senha),
        contato: req.body.contato || null,
        genero: req.body.genero || null,
        ativo: req.body.ativo === undefined ? 1 : req.body.ativo
    });
    res.status(201).send({ mensagem: "Usuário criado com sucesso!", id_usu: usuario.id_usu });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
    const values = Object.fromEntries(campos
        .filter(campo => Object.prototype.hasOwnProperty.call(req.body, campo))
        .map(campo => [campo, req.body[campo]]));
    if (Object.keys(values).length === 0) {
        return res.status(400).send({ mensagem: "Informe ao menos um campo válido para atualização." });
    }
    if (Object.prototype.hasOwnProperty.call(values, 'senha')) {
        if (typeof values.senha !== 'string' || !values.senha) {
            return res.status(400).send({ mensagem: "Informe uma senha válida." });
        }
        values.senha = await hashSenha(values.senha);
    }
    await Usuario.update(values, { where: { id_usu: req.params.id } });
    res.status(200).send({ mensagem: "Usuário atualizado com sucesso!" });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    const removidos = await Usuario.destroy({ where: { id_usu: req.params.id } });
    if (removidos === 0) return res.status(404).send({ mensagem: "Usuário não encontrado." });
    res.status(200).send({ mensagem: "Usuário removido com sucesso!" });
}));

module.exports = router;
