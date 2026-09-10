# 02 – Diseño
## Generador de Resúmenes PDF con IA (Ollama)

---

## 1. Arquitectura general del sistema

El sistema sigue una arquitectura **cliente-única de dos capas efectivas**: no existe backend propio; el "servidor" de inteligencia artificial es un proceso local (Ollama) expuesto vía HTTP en la misma máquina del usuario.

```
┌───────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Cliente)                     │
│                                                             │
│  ┌───────────────┐   ┌────────────────┐   ┌─────────────┐ │
│  │  index.html   │──▶│  script.js     │──▶│  style.css  │ │
│  │ (Estructura)  │   │ (Lógica/Estado)│   │ (Presentación)│
│  └───────────────┘   └───────┬────────┘   └─────────────┘ │
│                               │                             │
│                               ▼                             │
│                     ┌───────────────────┐                  │
│                     │   PDF.js (CDN)    │                  │
│                     │ Extracción de texto│                 │
│                     └───────────────────┘                  │
└───────────────────────────────┬─────────────────────────────┘
                                 │ fetch() HTTP POST
                                 ▼
                  ┌───────────────────────────────┐
                  │   Ollama (proceso local)       │
                  │   http://localhost:11434       │
                  │   /api/generate                │
                  │   Modelo LLM (mistral, etc.)    │
                  └───────────────────────────────┘
```

**Justificación de la arquitectura:**
- **Sin backend propio:** reduce complejidad de despliegue (no hay servidor que mantener, ni base de datos que asegurar) y es coherente con el alcance definido en 00-Ingeniería de Requerimientos.
- **Ollama como "IA como servicio local":** evita costos de API en la nube y mantiene los documentos del usuario fuera de internet.
- **PDF.js vía CDN:** evita implementar un parser de PDF propio, tarea compleja y propensa a errores.

## 2. Diseño de la interfaz de usuario

La interfaz se organiza en tres bloques verticales (`header`, `main.container`, `footer`), y dentro del contenido principal en dos secciones mutuamente excluyentes:

### 2.1 Sección de carga (`#uploadSection`)
- Título y subtítulo.
- Zona de arrastre (`#dropZone`) con ícono, texto e input oculto.
- Formulario de configuración: URL de Ollama, modelo, idioma.
- Botón primario "Generar Resumen" (deshabilitado hasta seleccionar archivo válido).
- Caja de confirmación de archivo cargado (`#fileInfo`).

### 2.2 Sección de resultados (`#resultsSection`)
Con tres subestados posibles, mostrados de forma exclusiva:
- **Cargando** (`#loadingState`): *spinner* animado + texto.
- **Resumen** (`#summaryOutput`): metadatos (archivo, palabras), texto del resumen y acciones (copiar/descargar).
- **Error** (`#errorState`): mensaje amigable + detalles técnicos colapsables (`<details>`).

### 2.3 Wireframe conceptual

```
┌──────────────────────────────────────────┐
│   📄 Resumen PDF                          │  <- header
├──────────────────────────────────────────┤
│  Generador de Resúmenes PDF               │
│  Carga un PDF y obtén un resumen          │
│  ┌────────────────────────────────────┐  │
│  │   📁 Arrastra tu PDF aquí           │  │  <- drop zone
│  │   o selecciona un archivo           │  │
│  └────────────────────────────────────┘  │
│  URL Ollama: [ http://localhost:11434 ]  │
│  Modelo:     [ mistral               ]   │
│  Idioma:     [ Español ▾ ]               │
│  [       Generar Resumen       ]         │
├──────────────────────────────────────────┤
│   © 2026 Generador de Resúmenes PDF       │  <- footer
└──────────────────────────────────────────┘
```

### 2.4 Guía de estilo visual (extraída de `style.css`)

| Elemento | Valor |
|---|---|
| Tipografía | Segoe UI / Tahoma / Verdana (sans-serif del sistema) |
| Color primario | `#1e3c72` → `#2a5298` (degradado azul, header/footer/botón primario) |
| Color de acento | `#4dd0e1` (cian, enlaces y bordes activos) |
| Fondo general | Degradado suave `#f5f7fa` → `#c3cfe2` |
| Éxito | Verde `#4caf50` / `#e8f5e9` |
| Error | Rojo `#f44336` / `#ffebee` |
| Radio de bordes | 5–15px (diseño *card* moderno) |
| Diseño responsivo | *Breakpoint* en 768px: reduce paddings, apila botones de acciones y encabezado de resultados |

## 3. Diseño modular del JavaScript (`script.js`)

| Función | Responsabilidad | Tipo |
|---|---|---|
| `handleFileSelect(file)` | Validar tipo/tamaño y actualizar UI de archivo seleccionado | Entrada/validación |
| `extractTextFromPDF(file)` | Extraer texto de todas las páginas con PDF.js | Procesamiento asíncrono |
| `generateSummary()` | Orquestar el flujo completo (validación → extracción → IA → render) | Controlador principal |
| `callOllamaAPI(url, model, text, language)` | Construir *prompt*, invocar `fetch`, interpretar errores de red/HTTP | Integración externa |
| `showLoading()`, `showResults()`, `showError(msg)` | Cambiar entre los tres estados visuales de resultados | Presentación |
| `closeResults()` | Reiniciar variables y UI al estado inicial | Gestión de estado |
| `copySummary()` | Copiar resumen al portapapeles con retroalimentación temporal | Acción de usuario |
| `downloadSummary()` | Generar y disparar la descarga de un archivo `.txt` | Acción de usuario |

Este diseño sigue el patrón de **separación por responsabilidad funcional** (no hay clases ni frameworks): cada función tiene una única tarea, y el estado compartido se limita a la variable global `selectedFile`, minimizando el acoplamiento.

## 4. Diseño de datos (sin base de datos)

Dado que no hay persistencia, el "modelo de datos" es efímero y vive en el DOM y en variables JS:

```
selectedFile: File {
  name: string,
  size: number,
  type: string
}

resultadoProcesamiento: {
  fileName: string,
  wordCount: number,
  summaryText: string
}
```

No se requiere diagrama entidad-relación al no existir una base de datos relacional en esta versión del sistema.

## 5. Diagrama de secuencia – Generar resumen

```
Usuario        UI(script.js)         PDF.js          Ollama API
  │  click "Generar Resumen" │                            │
  │ ────────────────────────▶│                            │
  │                          │ extractTextFromPDF()        │
  │                          │ ──────────────────────────▶│ (PDF.js procesa páginas)
  │                          │ ◀──────────────────────────│ texto + wordCount
  │                          │                            │
  │                          │  POST /api/generate         │
  │                          │ ───────────────────────────────────────────▶│
  │                          │                            │  genera resumen
  │                          │ ◀───────────────────────────────────────────│
  │  ◀── muestra resumen ────│                            │
```

## 6. Diseño de manejo de errores

Se diseñó un **árbol de decisión de errores** dentro de `callOllamaAPI`, priorizando mensajes accionables sobre mensajes técnicos crudos, con un área expandible (`<details>`) para quienes necesiten el detalle técnico (soporte, docente evaluador).

## 7. Decisiones de diseño y justificación

| Decisión | Justificación |
|---|---|
| Arquitectura 100% cliente, sin backend propio | Simplicidad, privacidad del documento, cero costo de infraestructura |
| Uso de Ollama en lugar de OpenAI/otros | Procesamiento local, sin costos por token, sin enviar datos sensibles a terceros |
| Truncado a 8000 caracteres | Modelos locales (ej. Mistral 7B) tienen ventanas de contexto limitadas en hardware de consumo |
| Sin frameworks (JS puro) | Proyecto académico de alcance acotado; evita curva de aprendizaje y dependencias innecesarias |
| Estados de UI mutuamente excluyentes controlados por funciones dedicadas | Facilita pruebas manuales y mantenimiento del flujo visual |
