const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: 'cc20669', 
    database: 'biblioteca',
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