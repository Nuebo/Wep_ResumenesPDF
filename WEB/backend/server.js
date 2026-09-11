// ===========================
// SERVIDOR PRINCIPAL (Express)
// ===========================

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

async function iniciar() {
  try {
    // Se conecta a MySQL (XAMPP) y crea la base de datos/tablas si hace falta
    await initDatabase();

    // Las rutas se cargan DESPUES de tener la base de datos lista
    const authRoutes = require('./routes/auth.routes');
    const documentsRoutes = require('./routes/documents.routes');

    app.use('/api/auth', authRoutes);
    app.use('/api/documents', documentsRoutes);

    // Manejador de errores (ej. Multer: PDF > 10MB, tipo invalido, etc.)
    app.use((err, req, res, next) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Error procesando la solicitud.' });
      }
      next();
    });

    app.listen(PORT, () => {
      console.log('=====================================');
      console.log(' Backend Generador de Resumenes PDF');
      console.log(`Escuchando en http://localhost:${PORT}`);
      console.log('=====================================');
    });

  } catch (error) {
    console.error('=====================================');
    console.error(' ERROR: No se pudo conectar a MySQL (XAMPP)');
    console.error('=====================================');
    console.error(error.message);
    console.error('');
    console.error('Verifica lo siguiente:');
    console.error('1. Que XAMPP este abierto y el modulo MySQL este iniciado (en verde).');
    console.error('2. Que backend/.env tenga los datos correctos (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD).');
    console.error('3. Si le pusiste contrasena al usuario root de MySQL, que coincida con DB_PASSWORD.');
    console.error('');
    process.exit(1);
  }
}

iniciar();
