require('dotenv').config();
const http = require('http');

const app = require('./app');

const port = process.env.PORT || process.env.port || 5000;

const server = http.createServer(app);

server.listen(port, '0.0.0.0',()=>{
    
    console.log(`Servidor rodando na porta ${port}`);
})