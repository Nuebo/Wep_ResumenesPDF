let documentosCache = [];

document.addEventListener('DOMContentLoaded', async function () {
    requireAuth();

    const user = getUser();
    if (user) {
        document.getElementById('userGreeting').textContent = `Hola, ${user.name}`;
    }

    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('detailCloseBtn').addEventListener('click', function () {
        document.getElementById('detailBox').style.display = 'none';
        window.currentDocumentContext = null;
    });

    // Buscador por nombre de PDF
    const searchInput = document.getElementById('searchInput');
    document.getElementById('searchBtn').addEventListener('click', function () {
        cargarDocumentos(searchInput.value);
    });
    document.getElementById('clearSearchBtn').addEventListener('click', function () {
        searchInput.value = '';
        document.getElementById('detailBox').style.display = 'none';
        window.currentDocumentContext = null;
        cargarDocumentos('');
    });
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            cargarDocumentos(searchInput.value);
        }
    });

    await cargarDocumentos('');
});

async function cargarDocumentos(query) {
    const container = document.getElementById('listContainer');
    container.innerHTML = '<p class="empty-state">Buscando...</p>';

    try {
        const texto = (query || '').trim();
        const url = texto
            ? `${API_BASE_URL}/documents?q=${encodeURIComponent(texto)}`
            : `${API_BASE_URL}/documents`;

        const response = await authFetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'No se pudo cargar el historial.');
        }

        documentosCache = data.documents || [];

        if (documentosCache.length === 0) {
            container.innerHTML = texto
                ? `<p class="empty-state">No se encontró ningún PDF cuyo nombre contenga "${escapeHtml(texto)}".</p>`
                : '<p class="empty-state">Aún no has generado ningún resumen. Ve a la página principal para crear el primero.</p>';
            return;
        }

        renderTabla(documentosCache);

        // Si la búsqueda arroja exactamente un resultado, mostramos
        // directamente qué PDF es junto con su resumen, sin clics extra.
        if (texto && documentosCache.length === 1) {
            verDetalle(documentosCache[0].id);
        }

    } catch (error) {
        container.innerHTML = `<p class="empty-state">Error al cargar el historial: ${escapeHtml(error.message)}</p>`;
    }
}

function renderTabla(documentos) {
    const container = document.getElementById('listContainer');

    const filas = documentos.map(doc => `
        <tr>
            <td>
                <div class="doc-name">
                    <span class="doc-icon">📄</span>
                    <span class="doc-name-text" title="${escapeHtml(doc.original_filename)}">${escapeHtml(doc.original_filename)}</span>
                </div>
            </td>
            <td><span class="badge badge-lang">${doc.language === 'es' ? 'Español' : 'Inglés'}</span></td>
            <td><span class="badge badge-model">${escapeHtml(doc.model)}</span></td>
            <td class="col-muted">${(doc.word_count || 0).toLocaleString('es-CO')}</td>
            <td class="col-muted">${formatFecha(doc.created_at)}</td>
            <td>
                <div class="row-actions">
                    <button class="icon-btn" title="Ver resumen" onclick="verDetalle(${doc.id})">👁</button>
                    <button class="icon-btn" title="Descargar PDF" onclick="descargarPDF(${doc.id})">⬇</button>
                    <button class="icon-btn icon-btn-danger" title="Eliminar" onclick="eliminarDocumento(${doc.id})">🗑</button>
                </div>
            </td>
        </tr>
    `).join('');

    container.innerHTML = `
        <table class="historial-table">
            <thead>
                <tr>
                    <th>Archivo</th><th>Idioma</th><th>Modelo</th><th>Palabras</th><th>Fecha</th><th>Acciones</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
    `;
}

function formatFecha(iso) {
    const fecha = new Date(iso);
    const dia = fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    const hora = fecha.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
    return `${dia}, ${hora}`;
}

async function verDetalle(id) {
    try {
        const response = await authFetch(`${API_BASE_URL}/documents/${id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'No se pudo cargar el detalle.');
        }

        const doc = data.document;
        document.getElementById('detailFileName').textContent = doc.original_filename;
        document.getElementById('detailWordCount').textContent = doc.word_count;
        document.getElementById('detailModel').textContent = doc.model;
        document.getElementById('detailSummary').textContent = doc.summary_text;

        const detailBox = document.getElementById('detailBox');
        detailBox.style.display = 'block';
        detailBox.scrollIntoView({ behavior: 'smooth' });

        document.getElementById('detailCopyBtn').onclick = function () {
            navigator.clipboard.writeText(doc.summary_text);
        };

        // Le da contexto al asistente de IA: si el usuario abre el chat
        // ahora, puede responder preguntas sobre este documento.
        window.currentDocumentContext = `Archivo: ${doc.original_filename}\nResumen: ${doc.summary_text}`;

    } catch (error) {
        alert('No se pudo cargar el detalle: ' + error.message);
    }
}

async function descargarPDF(id) {
    try {
        const response = await authFetch(`${API_BASE_URL}/documents/${id}/pdf`);
        if (!response.ok) {
            throw new Error('No se pudo descargar el PDF.');
        }

        const doc = documentosCache.find(d => d.id === id);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = doc ? doc.original_filename : 'documento.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert(error.message);
    }
}

async function eliminarDocumento(id) {
    if (!confirm('¿Eliminar este resumen y su PDF asociado? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        const response = await authFetch(`${API_BASE_URL}/documents/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('No se pudo eliminar el documento.');
        }
        const searchInput = document.getElementById('searchInput');
        await cargarDocumentos(searchInput.value);
    } catch (error) {
        alert(error.message);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}
