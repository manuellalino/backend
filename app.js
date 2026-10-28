//1. Dependências e Middlewares
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


const routeUsuario = require('./route/routeUsuario')
const routeLogin = require('./route/routeLogin')
const routeFuncionario = require('./route/routeFuncionario')
const routeFornecedor = require('./route/routeFornecedor')
const routeCliente = require('./route/routeCliente')
const routeProduto = require('./route/routeProduto')
const routePedido = require('./route/routePedido')
const routeEntrada = require('./route/routeEntrada')
const routeSaida = require('./route/routeSaida')
const routeMovimentações = require('./route/routeMovimentações')
const routeCategoria = require('./route/routeCategoria')
const routeEstoque = require('./route/routeEstoque')
const routePedidoItem = require('./route/routePedidoItem')
const routeHistoricoPreco = require('./route/routeHistoricoPreco')

//2. Controle de CORS (Headers & OPTIONS)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

//3. Definição de Rotas (Exemplo)
app.use("/usuario",routeUsuario);
app.use("/login",routeLogin);
app.use("/funcionario",routeFuncionario);
app.use("/fornecedor",routeFornecedor);
app.use("/cliente",routeCliente);
app.use("/produto",routeProduto);
app.use("/pedido",routePedido);
app.use("/entrada",routeEntrada);
app.use("/saida",routeSaida);
app.use("/movimentações",routeMovimentações);
app.use("/movimentacoes",routeMovimentações);
app.use("/categoria",routeCategoria);
app.use("/estoque",routeEstoque);
app.use("/pedido",routePedidoItem);
app.use("/produto",routeHistoricoPreco);

app.get('/teste', (req, res) => {
    res.status(200).send({
        mensagem: 'Tudo OK'
    }); 
});

//4. Tratamento de Erros (Fallback & Handler)
app.use((req,res,next)=>{
      const erro = new Error("Não encontrado!");
      erro.status = 404;
      next(erro);
});
app.use((error,req,res,next)=>{
        res.status(error.status || 500);
        return res.json({
            erro:{
                 mensagem:error.message
            }  })
})

module.exports = app
