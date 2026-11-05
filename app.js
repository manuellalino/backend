//1. Dependências e Middlewares
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const sequelize = require('./sequelize');

const configuredOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : null;

if (process.env.NODE_ENV === 'production' && (!configuredOrigins || configuredOrigins.length === 0)) {
  throw new Error('CORS_ORIGINS must contain the allowed frontend origins in production.');
}

if (process.env.NODE_ENV === 'production' && configuredOrigins.includes('*')) {
  throw new Error('Wildcard CORS is not allowed in production; configure explicit frontend origins.');
}

const allowedOrigins = configuredOrigins || [
  'http://localhost',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173'
];

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
  origin: (origin, callback) => {
    callback(null, !origin || allowedOrigins.includes(origin));
  },
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

app.get('/health/ready', async (req, res) => {
    try {
        await sequelize.authenticate();
        return res.status(200).send({ status: 'ok' });
    } catch (error) {
        console.error('Verificação de prontidão do banco falhou:', error);
        return res.status(503).send({ status: 'unavailable' });
    }
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
