// ===========================
// BASE DE DATOS (MySQL / XAMPP)
// ===========================
// Se usa mysql2 (con soporte de promesas) para conectarse al servidor
// MySQL que corre dentro de XAMPP. A diferencia de la versión anterior
// con SQLite, aquí NO se crea un archivo local: los datos viven en el
// servidor MySQL de XAMPP (phpMyAdmin -> base de datos configurada abajo).
//
// La primera vez que se inicia el backend, este archivo:
//   1) Se conecta a MySQL (sin elegir base de datos todavía).
//   2) Crea la base de datos si no existe (CREATE DATABASE IF NOT EXISTS).
//   3) Crea un "pool" de conexiones ya apuntando a esa base de datos.
//   4) Crea las tablas "users" y "documents" si no existen.
//
// Así no es obligatorio importar nada manualmente en phpMyAdmin (aunque
// también se incluye "schema.sql" por si se prefiere hacerlo a mano).

const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || ''; // en XAMPP, por defecto root no tiene contrasena
const DB_NAME = process.env.DB_NAME || 'resumen_pdf_db';

let pool = null;

async function initDatabase() {
  // 1) Conexion inicial sin base de datos, solo para poder crearla
  const conexionInicial = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });

  await conexionInicial.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conexionInicial.end();

  // 2) Pool de conexiones reutilizables, ya apuntando a la base de datos
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
  });

  // 3) Crear tablas si no existen (equivalente al esquema de schema.sql)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      original_filename VARCHAR(500) NOT NULL,
      stored_filename VARCHAR(500) NOT NULL,
      word_count INT DEFAULT 0,
      language VARCHAR(10) DEFAULT 'es',
      model VARCHAR(255),
      summary_text LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log(`✓ Conectado a MySQL (XAMPP). Base de datos "${DB_NAME}" lista.`);
  return pool;
}

function getPool() {
  if (!pool) {
    throw new Error('La base de datos aun no ha sido inicializada (initDatabase() no se ha completado).');
  }
  return pool;
}

module.exports = { initDatabase, getPool };
