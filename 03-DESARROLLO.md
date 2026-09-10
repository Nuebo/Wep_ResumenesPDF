# 03 – Desarrollo
## Generador de Resúmenes PDF con IA (Ollama)

---

## 1. Stack tecnológico utilizado

| Capa | Tecnología | Rol |
|---|---|---|
| Estructura | HTML5 | Marcado semántico de la página |
| Presentación | CSS3 (Flexbox, Grid implícito, *media queries*) | Estilos y diseño responsivo |
| Lógica de cliente | JavaScript (ES6+, vanilla, sin frameworks) | Manejo de eventos, estado y llamadas HTTP |
| Extracción de PDF | PDF.js v3.11.174 (vía CDN cdnjs) | Parseo de PDF a texto en el navegador |
| Inteligencia Artificial | Ollama (API REST local, `/api/generate`) | Generación del resumen mediante LLM |
| Automatización de arranque | Script `.bat` (Windows) | Localiza e inicia la aplicación de Ollama |

## 2. Estructura de carpetas del proyecto

```
trabajo1/
├── index.html                 # Página principal (estructura de la SPA)
├── INICIAR_OLLAMA.bat         # Script de arranque de Ollama en Windows
├── README.md                  # Documentación general del proyecto
├── scripts/
│   └── script.js              # Lógica de la aplicación
└── styles/
    └── style.css               # Estilos visuales
```

## 3. Descripción de cada archivo

### 3.1 `index.html`
Define la estructura semántica: `header` con logo, `main` con las dos secciones (`uploadSection`, `resultsSection`) y `footer`. Incluye las etiquetas `<script>` de PDF.js (CDN) y del script propio (`scripts/script.js`), este último cargado al final del `<body>` para no bloquear el renderizado.

### 3.2 `styles/style.css`
Organizado por bloques comentados (General, Header, Main, Upload, Drop zone, Forms, Buttons, Results, Loading, Summary, Error, Footer, Responsive), siguiendo una convención de nomenclatura clara basada en las secciones del HTML. Usa variables de color repetidas de forma consistente para mantener identidad visual (azul corporativo `#1e3c72`/`#2a5298`, acento cian `#4dd0e1`).

### 3.3 `scripts/script.js`
Contiene toda la lógica de negocio del cliente. Se detalla por bloque funcional:

**a) Configuración inicial de PDF.js**
```js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
```
Configura el *web worker* que PDF.js usa para procesar el PDF sin bloquear el hilo principal del navegador.

**b) Registro de eventos (`DOMContentLoaded`)**
Centraliza el enlace de todos los `addEventListener` (drag & drop, cambio de input, clics de botones) una vez el DOM está listo, evitando referencias a elementos inexistentes.

**c) Validación de archivo (`handleFileSelect`)**
```js
if (!file.type.includes('pdf')) { showError(...); return; }
if (file.size > 10 * 1024 * 1024) { showError(...); return; }
```
Aplica las reglas de negocio RN-01 y RN-02 definidas en el documento de análisis.

**d) Extracción de texto (`extractTextFromPDF`)**
Recorre `pdf.numPages`, obtiene el contenido textual de cada página con `getTextContent()` y concatena los fragmentos (`item.str`) separados por espacios, acumulando además un conteo aproximado de palabras.

**e) Orquestación (`generateSummary`)**
Función `async` que encadena: validaciones de formulario → `showLoading()` → `extractTextFromPDF()` → truncado a 8000 caracteres → `callOllamaAPI()` → render de resultados, todo envuelto en un bloque `try/catch` que delega cualquier fallo a `showError()`.

**f) Integración con Ollama (`callOllamaAPI`)**
Construye el *prompt* dinámicamente según el idioma elegido, normaliza la URL base (elimina `/` final) y realiza la petición:
```js
const response = await fetch(`${baseUrl}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model, prompt, stream: false, temperature: 0.7 })
});
```
Diferencia los errores por código HTTP (404, 400, otros) y por tipo de excepción (`TypeError` → problema de red/CORS), devolviendo mensajes específicos y accionables.

**g) Gestión de estados visuales**
`showLoading()`, `showResults()`, `showError()` y `closeResults()` manipulan exclusivamente `style.display` de los contenedores, evitando lógica de renderizado compleja (no hay *virtual DOM* ni plantillas).

**h) Acciones finales**
`copySummary()` usa la Clipboard API nativa; `downloadSummary()` crea un enlace temporal con esquema `data:` para forzar la descarga de un archivo de texto plano, sin necesidad de backend.

### 3.4 `INICIAR_OLLAMA.bat`
Script de conveniencia para Windows que busca el ejecutable de Ollama en dos rutas típicas de instalación (`Program Files` y `AppData\Local`), lo inicia y muestra instrucciones posteriores (descargar modelo, abrir `index.html`). Incluye manejo de error si Ollama no se encuentra instalado, con enlace de descarga.

## 4. Manual técnico de instalación (entorno de desarrollo/uso)

1. **Instalar Ollama:** descargar desde `https://ollama.ai` e instalar según el sistema operativo.
2. **Configurar CORS (obligatorio para uso desde navegador):**
   ```
   set OLLAMA_ORIGINS=*
   ```
   o configurarlo como variable de entorno persistente antes de iniciar Ollama.
3. **Iniciar Ollama:**
   - En Windows: ejecutar `INICIAR_OLLAMA.bat`.
   - En Mac/Linux: iniciar la aplicación Ollama o ejecutar `ollama serve`.
4. **Descargar un modelo:**
   ```
   ollama pull mistral
   ```
5. **Abrir la aplicación:** hacer doble clic en `index.html` (o servirlo con un servidor estático local, ej. `Live Server` de VS Code).
6. **Configurar en la interfaz:** verificar la URL (`http://localhost:11434`) y el nombre del modelo (`mistral`), coincidente con el modelo descargado.

## 5. Buenas prácticas aplicadas

- **Separación de responsabilidades** entre estructura (HTML), estilo (CSS) y comportamiento (JS).
- **Validación temprana** de entradas del usuario antes de iniciar procesos costosos (extracción, llamada a IA).
- **Manejo explícito de errores** en cada capa (validación, extracción, red) con mensajes diferenciados.
- **Comentarios organizativos** en el código (`// ===...===`) que delimitan secciones lógicas.
- **Nombrado descriptivo** de funciones y variables (`extractTextFromPDF`, `callOllamaAPI`, `showLoading`).
- **Uso de `async/await`** para legibilidad del flujo asíncrono frente a *callbacks* anidados.

## 6. Limitaciones conocidas del desarrollo actual

- No hay pruebas automatizadas (unitarias/E2E); las pruebas son manuales (ver documento 04-PRUEBAS).
- No hay soporte para múltiples archivos simultáneos.
- No hay soporte para PDFs escaneados sin capa de texto (no incluye OCR).
- El truncado fijo a 8000 caracteres puede omitir contenido relevante en documentos largos.
- No hay persistencia de configuración (URL/modelo) entre sesiones (no usa `localStorage`).
- Dependencia de disponibilidad del CDN de cdnjs.cloudflare.com para cargar PDF.js.
