const { Sequelize } = require('sequelize');
const useSsl = process.env.DB_SSL === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        dialect: 'mysql',
        logging: false,
        ...(useSsl ? {
            dialectOptions: {
                ssl: { rejectUnauthorized: true }
            }
        } : {}),
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;
