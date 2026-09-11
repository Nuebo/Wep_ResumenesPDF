// ===========================
// GENERADOR DE RESÚMENES PDF CON IA
// ===========================

// Configurar PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let selectedFile = null;

document.addEventListener('DOMContentLoaded', function() {
    // Esta página requiere sesión iniciada; si no hay token, redirige a login.html
    requireAuth();

    const user = getUser();
    if (user) {
        document.getElementById('userGreeting').textContent = `Hola, ${user.name}`;
    }
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Precarga silenciosa de los valores por defecto del motor de IA;
    // el usuario final no necesita ver esta dirección técnica a menos
    // que abra "Configuración avanzada".
    const ollamaUrlInput = document.getElementById('ollamaUrl');
    const ollamaModelInput = document.getElementById('ollamaModel');
    ollamaUrlInput.value = localStorage.getItem('ollamaUrl') || AI_ENGINE_DEFAULT_URL;
    ollamaModelInput.value = localStorage.getItem('ollamaModel') || AI_ENGINE_DEFAULT_MODEL;
    ollamaUrlInput.addEventListener('change', () => localStorage.setItem('ollamaUrl', ollamaUrlInput.value.trim()));
    ollamaModelInput.addEventListener('change', () => localStorage.setItem('ollamaModel', ollamaModelInput.value.trim()));

    const advancedToggle = document.getElementById('advancedToggle');
    const advancedPanel = document.getElementById('advancedPanel');
    advancedToggle.addEventListener('click', () => {
        const abierto = advancedPanel.classList.toggle('open');
        advancedToggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const submitBtn = document.getElementById('submitBtn');
    const closeBtn = document.getElementById('closeBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Submit button
    submitBtn.addEventListener('click', generateSummary);

    // Close button
    closeBtn.addEventListener('click', closeResults);

    // Copy button
    copyBtn.addEventListener('click', copySummary);

    // Download button
    downloadBtn.addEventListener('click', downloadSummary);
});

// ===========================
// MANEJAR SELECCIÓN DE ARCHIVO
// ===========================

function handleFileSelect(file) {
    if (!file.type.includes('pdf')) {
        showError('Por favor selecciona un archivo PDF válido');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError('El archivo no debe exceder 10 MB');
        return;
    }

    selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('submitBtn').disabled = false;
}

// ===========================
// EXTRAER TEXTO DEL PDF
// ===========================

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    let wordCount = 0;

    for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
        wordCount += pageText.split(/\s+/).length;
    }

    return { text: fullText, wordCount: Math.round(wordCount) };
}

// ===========================
// GENERAR RESUMEN CON IA
// ===========================

async function generateSummary() {
    const ollamaUrl = document.getElementById('ollamaUrl').value.trim();
    const ollamaModel = document.getElementById('ollamaModel').value.trim();
    const language = document.getElementById('language').value;

    if (!ollamaUrl) {
        showError('Falta configurar la dirección del servicio de IA. Ábrela desde "Configuración avanzada".');
        return;
    }

    if (!ollamaModel) {
        showError('Falta configurar el modelo de IA. Ábrelo desde "Configuración avanzada".');
        return;
    }

    if (!selectedFile) {
        showError('Por favor selecciona un archivo PDF');
        return;
    }

    // Guardamos una referencia al archivo actual, porque closeResults()
    // o una nueva selección podrían cambiar/limpiar "selectedFile" luego.
    const archivoActual = selectedFile;

    // Mostrar estado de carga
    showLoading();

    try {
        // Extraer texto del PDF
        console.log('Extrayendo texto del PDF...');
        const { text, wordCount } = await extractTextFromPDF(archivoActual);

        if (!text.trim()) {
            throw new Error('No se pudo extraer texto del PDF');
        }

        // Limitar el texto a 8000 caracteres para Ollama
        const textToSummarize = text.substring(0, 8000);

        // Llamar a Ollama API
        console.log('Conectando con Ollama...');
        const summary = await callOllamaAPI(ollamaUrl, ollamaModel, textToSummarize, language);

        // Mostrar resultados
        document.getElementById('summaryFileName').textContent = archivoActual.name;
        document.getElementById('wordCount').textContent = wordCount;
        document.getElementById('summaryText').textContent = summary;

        showResults();

        // Le da contexto al asistente de IA sobre el documento recién resumido,
        // para que el usuario pueda hacerle preguntas sobre él.
        window.currentDocumentContext = `Archivo: ${archivoActual.name}\nResumen: ${summary}`;

        // Guardar el PDF original y el resumen en el backend (base de datos + archivo)
        guardarEnHistorial(archivoActual, summary, wordCount, language, ollamaModel);

    } catch (error) {
        console.error('Error:', error);
        showError(error.userMessage || error.message || 'Ocurrió un error al procesar el documento', error.technical);
    }
}

// ===========================
// LLAMAR A OLLAMA API
// ===========================

async function callOllamaAPI(ollamaUrl, model, text, language) {
    const languageLabel = language === 'es' ? 'español' : 'inglés';

    const prompt = `Por favor, crea un resumen conciso y completo del siguiente texto en ${languageLabel}. 

El resumen debe:
- Ser claro y profesional
- Mantener los puntos más importantes
- Tener entre 200-400 palabras
- Ser fácil de entender

Texto a resumir:
${text}

Resumen:`;

    try {
        // Asegurarse de que la URL no tenga slash al final
        const baseUrl = ollamaUrl.endsWith('/') ? ollamaUrl.slice(0, -1) : ollamaUrl;

        console.log(`Conectando con el servicio de IA en ${baseUrl}, modelo ${model}...`);

        const response = await fetch(`${baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: false,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw crearError('No se pudo conectar con el servicio de IA.', `Sin respuesta en ${baseUrl} (404).`);
            } else if (response.status === 400) {
                throw crearError(`El modelo "${model}" no está disponible en el servicio de IA.`, `Respuesta 400 al solicitar el modelo "${model}" en ${baseUrl}.`);
            } else {
                throw crearError('El servicio de IA respondió con un error.', `Error de conexión: ${response.status} ${response.statusText} (${baseUrl}).`);
            }
        }

        const data = await response.json();

        if (!data.response) {
            throw crearError('El servicio de IA no devolvió una respuesta válida.', `Respuesta vacía desde ${baseUrl}.`);
        }

        return data.response.trim();

    } catch (error) {
        if (error instanceof TypeError) {
            throw crearError(
                'No se pudo conectar con el servicio de IA. Verifica que esté disponible e inténtalo de nuevo.',
                `No se pudo conectar a ${ollamaUrl}. Causas frecuentes:\n` +
                `1) El servicio de IA no está corriendo (ábrelo con INICIAR_OLLAMA.bat).\n` +
                `2) CORS bloqueado: el servicio por defecto no acepta peticiones desde el navegador. Ejecuta INICIAR_OLLAMA.bat (configura OLLAMA_ORIGINS=*) y reinícialo.\n` +
                `3) La dirección o el puerto son incorrectos (por defecto http://localhost:11434).\n` +
                `Error técnico: ${error.message}`
            );
        }
        throw error;
    }
}

// Crea un Error con un mensaje corto para el usuario (userMessage) y un
// detalle técnico opcional (technical) que solo se muestra si el usuario
// despliega "Ver detalles técnicos".
function crearError(userMessage, technical) {
    const error = new Error(userMessage);
    error.userMessage = userMessage;
    error.technical = technical;
    return error;
}

// ===========================
// GUARDAR EN EL HISTORIAL (backend + base de datos)
// ===========================

async function guardarEnHistorial(file, summary, wordCount, language, model) {
    const saveStatus = document.getElementById('saveStatus');
    saveStatus.textContent = 'Guardando en tu historial...';
    saveStatus.className = 'save-status';

    try {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('summary', summary);
        formData.append('wordCount', wordCount);
        formData.append('language', language);
        formData.append('model', model);

        const response = await authFetch(`${API_BASE_URL}/documents`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'No se pudo guardar en el historial.');
        }

        saveStatus.textContent = '✓ Guardado en "Mis Resúmenes"';
        saveStatus.className = 'save-status save-status-ok';

    } catch (error) {
        console.error('Error guardando en el historial:', error);
        saveStatus.textContent = '⚠ No se pudo guardar en el historial (el resumen sigue disponible arriba).';
        saveStatus.className = 'save-status save-status-error';
    }
}

// ===========================
// MOSTRAR/OCULTAR ESTADOS
// ===========================

function showLoading() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('summaryOutput').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
}

function showResults() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('summaryOutput').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('saveStatus').textContent = '';
}

function showError(message, technical) {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('summaryOutput').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;

    const detailsBlock = document.getElementById('errorDetails').closest('details');
    if (technical) {
        document.getElementById('errorDetails').textContent = technical;
        detailsBlock.style.display = 'block';
    } else {
        detailsBlock.style.display = 'none';
    }
}

function closeResults() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('submitBtn').disabled = true;

    document.getElementById('uploadSection').style.display = 'flex';
    document.getElementById('resultsSection').style.display = 'none';
}

// ===========================
// ACCIONES DE RESUMEN
// ===========================

function copySummary() {
    const summaryText = document.getElementById('summaryText').textContent;
    navigator.clipboard.writeText(summaryText).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copiado';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

function downloadSummary() {
    const fileName = document.getElementById('summaryFileName').textContent;
    const summaryText = document.getElementById('summaryText').textContent;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(summaryText));
    element.setAttribute('download', `resumen_${fileName.replace('.pdf', '.txt')}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
