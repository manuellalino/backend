const express = require('express');
const router = express.Router();
const mysql = require("../mysql").pool;

router.get('/:idProduto/historico-precos', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error });
        conn.query(
            `SELECT id_historico, id_produto, preco, vigencia
             FROM historico_precos
             WHERE id_produto = ?
             ORDER BY vigencia DESC, id_historico DESC`,
            [req.params.idProduto],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error });
                res.status(200).send({ historico: resultado });
            }
        );
    });
});

module.exports = router;
