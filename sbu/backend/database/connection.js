const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'biblioteca',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        const conn = await connection.getConnection();
        console.log('Conectado ao MySQL com sucesso!');
        conn.release();
        return true;
    } catch (error) {
        console.error('Erro ao conectar com MySQL:', error.message);
        return false;
    }
}

module.exports = { connection, testConnection };