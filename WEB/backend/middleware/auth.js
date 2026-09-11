// ===========================
// MIDDLEWARE DE AUTENTICACION
// ===========================
// Verifica el token JWT enviado en el header "Authorization: Bearer <token>".
// Si es valido, agrega la info del usuario en req.user y continua.
// Si no, corta la peticion con 401 (no autorizado).
// (Esta parte no depende de la base de datos, asi que no cambia con XAMPP.)

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_dev_cambiar';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado. Inicia sesion.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesion invalida o expirada. Inicia sesion de nuevo.' });
  }
}

module.exports = authMiddleware;
module.exports.JWT_SECRET = JWT_SECRET;
