const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const mysql = require("../mysql").pool;

router.post('/', (req, res) => {
    const { email, senha } = req.body;
    if (typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha) {
        return res.status(400).send({ mensagem: "Informe email e senha." });
    }

    mysql.getConnection((error, conn) => {
        if (error) {
            console.error("Erro ao obter conexão para login:", error);
            return res.status(500).send({ mensagem: "Erro interno ao realizar login." });
        }

        conn.query(
            "SELECT id_usu, nome, email, senha, contato, genero, ativo, criado_em, atualizado_em FROM usuarios WHERE email = ?",
            [email.trim()],
            async (error, resultado) => {
                conn.release();

                if (error) {
                    console.error("Erro ao consultar usuário para login:", error);
                    return res.status(500).send({ mensagem: "Erro interno ao realizar login." });
                }

                if (resultado.length === 0) {
                    return res.status(401).send({ mensagem: "Email ou senha inválidos." });
                }

                const usuario = resultado[0];
                let senhaValida;
                try {
                    if (/^\$2[aby]\$\d{2}\$/.test(usuario.senha)) {
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

                delete usuario.senha;
                return res.status(200).send({
                    mensagem: "Login realizado com sucesso.",
                    usuario
                });
            }
        );
    });
});

module.exports = router;
