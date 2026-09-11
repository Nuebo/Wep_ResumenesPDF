document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('registerForm');
    const errorBox = document.getElementById('registerError');
    const errorText = document.getElementById('registerErrorText');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        errorBox.style.display = 'none';

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            errorText.textContent = 'Las contraseñas no coinciden.';
            errorBox.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'No se pudo completar el registro.');
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
