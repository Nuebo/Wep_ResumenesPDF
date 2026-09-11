-- ==========================================================
-- Esquema de base de datos - Generador de Resumenes PDF
-- ==========================================================
-- NOTA: Este archivo es OPCIONAL. El backend (db.js) crea la base de
-- datos y las tablas automaticamente la primera vez que se inicia.
-- Usa este script solo si prefieres crearlo tu mismo desde phpMyAdmin
-- (pestaña "SQL" -> pegar todo este contenido -> Continuar).

CREATE DATABASE IF NOT EXISTS resumen_pdf_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE resumen_pdf_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
