// ===========================
// ASISTENTE DE IA (Ollama) - widget flotante
// ===========================
// Se inyecta solo en cualquier página que incluya este script.
// Habla directamente con Ollama (igual que el generador de resúmenes),
// y si el usuario acaba de ver el resumen de un documento (en index.html
// o en historial.html), usa ese resumen como contexto de la conversación.

(function () {
    const URL_POR_DEFECTO = (typeof AI_ENGINE_DEFAULT_URL !== 'undefined') ? AI_ENGINE_DEFAULT_URL : 'http://localhost:11434';
    const MODELO_POR_DEFECTO = (typeof AI_ENGINE_DEFAULT_MODEL !== 'undefined') ? AI_ENGINE_DEFAULT_MODEL : 'mistral';

    let historialConversacion = []; // [{ role: 'user' | 'assistant', content }]
    let contadorMensajes = 0;

    document.addEventListener('DOMContentLoaded', crearWidget);

    function crearWidget() {
        const boton = document.createElement('button');
        boton.id = 'assistantToggleBtn';
        boton.className = 'assistant-toggle-btn';
        boton.type = 'button';
        boton.title = 'Asistente IA (Ollama)';
        boton.innerHTML = '🤖';
        document.body.appendChild(boton);

        const panel = document.createElement('div');
        panel.id = 'assistantPanel';
        panel.className = 'assistant-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="assistant-header">
                <span>🤖 Asistente</span>
                <div class="assistant-header-actions">
                    <button id="assistantSettingsBtn" type="button" class="assistant-settings-toggle" title="Ajustes" aria-expanded="false">⚙</button>
                    <button id="assistantCloseBtn" type="button" class="assistant-close-btn">✕</button>
                </div>
            </div>
            <div id="assistantSettingsPanel" class="assistant-settings">
                <input type="text" id="assistantUrl" placeholder="Dirección del servicio"
                       value="${localStorage.getItem('assistantOllamaUrl') || URL_POR_DEFECTO}">
                <input type="text" id="assistantModel" placeholder="Modelo"
                       value="${localStorage.getItem('assistantOllamaModel') || MODELO_POR_DEFECTO}">
            </div>
            <div id="assistantMessages" class="assistant-messages">
                <div class="assistant-msg assistant-msg-bot">¡Hola! Soy tu asistente con IA local (Ollama). Pregúntame lo que quieras; si acabas de ver un resumen, también puedo responder sobre ese documento.</div>
            </div>
            <div class="assistant-input-row">
                <input type="text" id="assistantInput" placeholder="Escribe tu pregunta..." autocomplete="off">
                <button id="assistantSendBtn" type="button" class="btn btn-primary">➤</button>
            </div>
        `;
        document.body.appendChild(panel);

        boton.addEventListener('click', () => mostrarPanel(true));
        document.getElementById('assistantCloseBtn').addEventListener('click', () => mostrarPanel(false));

        const settingsBtn = document.getElementById('assistantSettingsBtn');
        const settingsPanel = document.getElementById('assistantSettingsPanel');
        settingsBtn.addEventListener('click', () => {
            const abierto = settingsPanel.classList.toggle('open');
            settingsBtn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        });

        document.getElementById('assistantSendBtn').addEventListener('click', enviarMensaje);
        document.getElementById('assistantInput').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                enviarMensaje();
            }
        });

        document.getElementById('assistantUrl').addEventListener('change', function (e) {
            localStorage.setItem('assistantOllamaUrl', e.target.value.trim());
        });
        document.getElementById('assistantModel').addEventListener('change', function (e) {
            localStorage.setItem('assistantOllamaModel', e.target.value.trim());
        });
    }

    function mostrarPanel(mostrar) {
        document.getElementById('assistantPanel').style.display = mostrar ? 'flex' : 'none';
        if (mostrar) {
            document.getElementById('assistantInput').focus();
        }
    }

    async function enviarMensaje() {
        const input = document.getElementById('assistantInput');
        const texto = input.value.trim();
        if (!texto) return;

        agregarMensaje('user', texto);
        input.value = '';

        const url = document.getElementById('assistantUrl').value.trim() || URL_POR_DEFECTO;
        const modelo = document.getElementById('assistantModel').value.trim() || MODELO_POR_DEFECTO;

        const idMensajePensando = agregarMensaje('bot', 'Pensando...');

        try {
            const respuesta = await preguntarAOllama(url, modelo, texto);
            actualizarMensaje(idMensajePensando, respuesta);

            historialConversacion.push({ role: 'user', content: texto });
            historialConversacion.push({ role: 'assistant', content: respuesta });
            // Limitar el historial para no enviar prompts enormes
            if (historialConversacion.length > 12) {
                historialConversacion = historialConversacion.slice(-12);
            }
        } catch (error) {
            actualizarMensaje(idMensajePensando, `⚠️ ${error.message}`);
        }
    }

    async function preguntarAOllama(url, modelo, pregunta) {
        const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

        let contexto = '';
        if (window.currentDocumentContext) {
            contexto = `Contexto de un documento que el usuario procesó (úsalo si la pregunta se relaciona con él):\n${window.currentDocumentContext}\n\n`;
        }

        const turnosPrevios = historialConversacion.map(m =>
            `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`
        ).join('\n');

        const prompt =
            `${contexto}Eres un asistente útil que responde en español, de forma clara y concisa.\n\n` +
            `${turnosPrevios ? turnosPrevios + '\n' : ''}Usuario: ${pregunta}\nAsistente:`;

        let response;
        try {
            response = await fetch(`${baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: modelo, prompt, stream: false, temperature: 0.7 })
            });
        } catch (error) {
            throw new Error(
                'No se pudo conectar con el servicio de IA. Verifica los ajustes (⚙) e inténtalo de nuevo.'
            );
        }

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('No se pudo conectar con el servicio de IA.');
            }
            if (response.status === 400) {
                throw new Error(`El modelo "${modelo}" no está disponible.`);
            }
            throw new Error(`El servicio de IA respondió con un error (${response.status}).`);
        }

        const data = await response.json();
        if (!data.response) {
            throw new Error('El servicio de IA no devolvió una respuesta válida.');
        }
        return data.response.trim();
    }

    function agregarMensaje(role, texto) {
        contadorMensajes++;
        const id = `assistant-msg-${contadorMensajes}`;

        const contenedor = document.getElementById('assistantMessages');
        const div = document.createElement('div');
        div.id = id;
        div.className = `assistant-msg ${role === 'user' ? 'assistant-msg-user' : 'assistant-msg-bot'}`;
        div.textContent = texto;

        contenedor.appendChild(div);
        contenedor.scrollTop = contenedor.scrollHeight;
        return id;
    }

    function actualizarMensaje(id, texto) {
        const el = document.getElementById(id);
        if (el) el.textContent = texto;
        const contenedor = document.getElementById('assistantMessages');
        contenedor.scrollTop = contenedor.scrollHeight;
    }
})();
