// ===========================
// RUTAS DE DOCUMENTOS
// ===========================
// Guarda en el servidor el PDF original y el resumen generado por Ollama,
// asociados al usuario autenticado. Requiere token en todas las rutas.

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const nombreSeguro = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${nombreSeguro}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB, igual que en el frontend
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Solo se permiten archivos PDF.'));
    }
    cb(null, true);
  }
});

// Todas las rutas de este archivo requieren estar autenticado
router.use(authMiddleware);

// POST /api/documents  -> guarda el PDF original + el resumen generado
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    const { summary, wordCount, language, model } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibio el archivo PDF.' });
    }
    if (!summary) {
      return res.status(400).json({ error: 'No se recibio el resumen generado.' });
    }

    const pool = getPool();
    const [resultado] = await pool.query(
      `INSERT INTO documents (user_id, original_filename, stored_filename, word_count, language, model, summary_text)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        req.file.originalname,
        req.file.filename,
        parseInt(wordCount, 10) || 0,
        language || 'es',
        model || '',
        summary
      ]
    );

    res.status(201).json({ id: resultado.insertId });

  } catch (error) {
    console.error('Error guardando documento:', error);
    res.status(500).json({ error: 'Error del servidor al guardar el documento.' });
  }
});

// GET /api/documents -> lista los documentos del usuario autenticado
// Soporta ?q=texto para buscar por nombre de archivo (busqueda parcial, sin distinguir mayusculas)
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const pool = getPool();

    let filas;
    if (q) {
      const termino = `%${q}%`;
      // La collation utf8mb4_unicode_ci ya hace que LIKE sea insensible a mayusculas
      [filas] = await pool.query(
        `SELECT id, original_filename, word_count, language, model, created_at
         FROM documents
         WHERE user_id = ? AND original_filename LIKE ?
         ORDER BY created_at DESC`,
        [req.user.id, termino]
      );
    } else {
      [filas] = await pool.query(
        `SELECT id, original_filename, word_count, language, model, created_at
         FROM documents
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [req.user.id]
      );
    }

    res.json({ documents: filas });

  } catch (error) {
    console.error('Error listando documentos:', error);
    res.status(500).json({ error: 'Error del servidor al listar los documentos.' });
  }
});

// GET /api/documents/:id -> detalle completo (incluye el texto del resumen)
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [filas] = await pool.query(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado.' });
    }
    res.json({ document: filas[0] });

  } catch (error) {
    console.error('Error obteniendo detalle:', error);
    res.status(500).json({ error: 'Error del servidor al obtener el documento.' });
  }
});

// GET /api/documents/:id/pdf -> descarga el archivo PDF original
router.get('/:id/pdf', async (req, res) => {
  try {
    const pool = getPool();
    const [filas] = await pool.query(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado.' });
    }

    const fila = filas[0];
    const rutaArchivo = path.join(uploadsDir, fila.stored_filename);
    if (!fs.existsSync(rutaArchivo)) {
      return res.status(404).json({ error: 'El archivo PDF ya no esta disponible en el servidor.' });
    }

    res.download(rutaArchivo, fila.original_filename);

  } catch (error) {
    console.error('Error descargando PDF:', error);
    res.status(500).json({ error: 'Error del servidor al descargar el PDF.' });
  }
});

// DELETE /api/documents/:id -> elimina el registro y el archivo PDF asociado
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [filas] = await pool.query(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado.' });
    }

    const fila = filas[0];
    const rutaArchivo = path.join(uploadsDir, fila.stored_filename);
    if (fs.existsSync(rutaArchivo)) {
      fs.unlinkSync(rutaArchivo);
    }

    await pool.query('DELETE FROM documents WHERE id = ?', [fila.id]);
    res.json({ ok: true });

  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar el documento.' });
  }
});

module.exports = router;
