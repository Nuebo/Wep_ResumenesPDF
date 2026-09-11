// ===========================
// UTILIDADES DE AUTENTICACION (cliente)
// ===========================
// El token se guarda en localStorage tras iniciar sesion o registrarse.
// Se envia en cada peticion protegida como header "Authorization: Bearer <token>".

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Redirige a login si no hay token guardado. Se llama al cargar cada
// pagina protegida (index.html, historial.html).
function requireAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
}

// Wrapper de fetch que agrega el token automaticamente y cierra sesion
// si el backend responde 401 (token invalido o expirado).
async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = options.headers || {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        logout();
        throw new Error('Sesion expirada. Inicia sesion de nuevo.');
    }

    return response;
}
