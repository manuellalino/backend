require('dotenv').config();
const http = require('http');

const app = require('./app');
const sequelize = require('./sequelize');

const port = process.env.PORT || process.env.port || 5000;

const server = http.createServer(app);

async function startServer() {
    try {
        await sequelize.authenticate();
        server.listen(port, '0.0.0.0', () => {
            console.log(`Servidor rodando na porta ${port}`);
        });
    } catch (error) {
        console.error('Não foi possível iniciar a API ou conectar ao banco:', error);
        try {
            await sequelize.close();
        } catch (closeError) {
            console.error('Erro ao encerrar o pool do banco:', closeError);
        }
        process.exitCode = 1;
    }
}

server.on('error', async error => {
    console.error('Erro no servidor HTTP:', error);
    process.exitCode = 1;
    try {
        await sequelize.close();
    } catch (closeError) {
        console.error('Erro ao encerrar o pool do banco:', closeError);
    }
});

function shutdown(signal) {
    console.log(`Recebido ${signal}; encerrando servidor.`);
    server.close(async error => {
        if (error) {
            console.error('Erro ao encerrar o servidor HTTP:', error);
            process.exitCode = 1;
        }
        try {
            await sequelize.close();
        } catch (closeError) {
            console.error('Erro ao encerrar o pool do banco:', closeError);
            process.exitCode = 1;
        }
    });
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

startServer();