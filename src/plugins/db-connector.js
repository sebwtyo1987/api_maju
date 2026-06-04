const fp = require('fastify-plugin');
const mysql = require('mysql2/promise');
const env = require('../config/env');

async function dbConnector(fastify, options) {
  try {
    const pool = mysql.createPool({
      host: env.db.host,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Tes koneksi
    const connection = await pool.getConnection();
    connection.release();
    fastify.log.info('MySQL connected successfully!');

    // Decorate fastify agar bisa diakses via fastify.db
    fastify.decorate('db', pool);

    fastify.addHook('onClose', async (instance) => {
      await instance.db.end();
    });
  } catch (err) {
    fastify.log.error(`MySQL connection error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = fp(dbConnector);
