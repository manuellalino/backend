const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Usuario } = require('../models');

router.post('/', async (req, res) => {
    const { email, senha } = req.body;
    if (typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha) {
        return res.status(400).send({ mensagem: "Informe email e senha." });
    }

    let usuario;
    try {
        usuario = await Usuario.findOne({
            attributes: ['id_usu', 'nome', 'email', 'senha', 'contato', 'genero', 'ativo', 'criado_em', 'atualizado_em'],
            where: { email: email.trim() },
            raw: true
        });
    } catch (error) {
        console.error("Erro ao consultar usuário para login:", error);
        return res.status(500).send({ mensagem: "Erro interno ao realizar login." });
    }

    if (!usuario) return res.status(401).send({ mensagem: "Email ou senha inválidos." });

    let senhaValida;
    const senhaLegada = !/^\$2[aby]\$\d{2}\$/.test(usuario.senha);
    try {
        if (!senhaLegada) {
            const hash = usuario.senha.startsWith('$2y$')
                ? `$2b$${usuario.senha.slice(4)}`
                : usuario.senha;
            senhaValida = await bcrypt.compare(senha, hash);
        } else {
            senhaValida = senha === usuario.senha;
        }
    } catch (error) {
        console.error("Erro ao verificar senha de login:", error);
        return res.status(500).send({ mensagem: "Erro interno ao realizar login." });
    }

    if (!senhaValida || Number(usuario.ativo) !== 1) {
        return res.status(401).send({ mensagem: "Email ou senha inválidos." });
    }

    if (senhaLegada) {
        try {
            await Usuario.update(
                { senha: await bcrypt.hash(senha, 10) },
                { where: { id_usu: usuario.id_usu } }
            );
        } catch (error) {
            console.error("Erro ao atualizar hash de senha legado:", error);
            return res.status(500).send({ mensagem: "Erro interno ao realizar login." });
        }
    }

    delete usuario.senha;
    return res.status(200).send({ mensagem: "Login realizado com sucesso.", usuario });
});

module.exports = router;
