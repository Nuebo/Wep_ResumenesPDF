// ===========================

// GENERADOR DE RESÚMENES PDF CON IA

// ===========================



// Configurar PDF.js

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';



let selectedFile = null;



document.addEventListener('DOMContentLoaded', function() {

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

        showError('Por favor ingresa la URL del servidor Ollama');

        return;

    }



    if (!ollamaModel) {

        showError('Por favor ingresa el nombre del modelo Ollama');

        return;

    }



    if (!selectedFile) {

        showError('Por favor selecciona un archivo PDF');

        return;

    }



    // Mostrar estado de carga

    showLoading();



    try {

        // Extraer texto del PDF

        console.log('Extrayendo texto del PDF...');

        const { text, wordCount } = await extractTextFromPDF(selectedFile);

        

        if (!text.trim()) {

            throw new Error('No se pudo extraer texto del PDF');

        }



        // Limitar el texto a 8000 caracteres para Ollama

        const textToSummarize = text.substring(0, 8000);



        // Llamar a Ollama API

        console.log('Conectando con Ollama...');

        const summary = await callOllamaAPI(ollamaUrl, ollamaModel, textToSummarize, language);



        // Mostrar resultados

        document.getElementById('summaryFileName').textContent = selectedFile.name;

        document.getElementById('wordCount').textContent = wordCount;

        document.getElementById('summaryText').textContent = summary;

        

        showResults();



    } catch (error) {

        console.error('Error:', error);

        showError(error.message || 'Ocurrió un error al procesar el PDF');

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

        

        console.log(`Llamando a Ollama en ${baseUrl} con modelo ${model}...`);

        

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

                throw new Error('No se pudo conectar a Ollama. Asegúrate de que esté corriendo en ' + baseUrl);

            } else if (response.status === 400) {

                throw new Error('Modelo no encontrado en Ollama. Verifica que "' + model + '" esté descargado');

            } else {

                throw new Error(`Error de conexión con Ollama: ${response.status} ${response.statusText}`);

            }

        }



        const data = await response.json();

        

        if (!data.response) {

            throw new Error('Ollama no devolvió una respuesta válida');

        }



        return data.response.trim();



    } catch (error) {

        if (error instanceof TypeError) {

            throw new Error(

                `No se pudo conectar a Ollama en ${ollamaUrl}. Esto casi siempre se debe a una de estas causas:\n` +

                `1) Ollama no está corriendo (ábrelo con INICIAR_OLLAMA.bat).\n` +

                `2) CORS bloqueado: Ollama por defecto no acepta peticiones desde el navegador. Ejecuta INICIAR_OLLAMA.bat (configura OLLAMA_ORIGINS=*) y reinicia Ollama.\n` +

                `3) La URL o el puerto son incorrectos (por defecto http://localhost:11434).\n` +

                `Error técnico: ${error.message}`

            );

        }

        throw error;

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

}



function showError(message) {

    document.getElementById('uploadSection').style.display = 'none';

    document.getElementById('resultsSection').style.display = 'block';

    document.getElementById('loadingState').style.display = 'none';

    document.getElementById('summaryOutput').style.display = 'none';

    document.getElementById('errorState').style.display = 'block';

    document.getElementById('errorMessage').textContent = message;

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


