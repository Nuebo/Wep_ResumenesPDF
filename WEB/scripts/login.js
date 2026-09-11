document.addEventListener('DOMContentLoaded', function () {
    // Si ya hay una sesión activa, no tiene sentido ver el login de nuevo
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        errorBox.style.display = 'none';

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'No se pudo iniciar sesión.');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html';

        } catch (error) {
            errorText.textContent = error.message || 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
            errorBox.style.display = 'block';
        }
    });
});
