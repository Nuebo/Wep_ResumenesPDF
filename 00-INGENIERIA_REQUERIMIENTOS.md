# 00 – Ingeniería de Requerimientos
## Generador de Resúmenes PDF con IA (Ollama)

**Proyecto Integrador – Unidades Tecnológicas de Santander (UTS)**
**Programa:** Tecnología en Desarrollo de Software
**Docente:** Wilson Castaño Galviz

---

## 1. Introducción

Este documento presenta el proceso de ingeniería de requerimientos aplicado al desarrollo del **Generador de Resúmenes PDF**, una aplicación web ligera que permite a un usuario cargar un documento PDF, extraer su contenido textual en el propio navegador y generar un resumen inteligente mediante un modelo de lenguaje (LLM) ejecutado localmente a través de **Ollama**.

A diferencia de un sistema documental empresarial completo (con autenticación, repositorios, base de datos y búsqueda semántica), el alcance real y verificable del producto entregado es una **herramienta cliente (front-end puro)** de un solo propósito: **cargar → extraer → resumir → exportar**. Este documento delimita con precisión ese alcance para que el análisis, diseño, desarrollo, pruebas e implementación sean consistentes con el software efectivamente construido.

## 2. Propósito del documento

- Identificar y formalizar los requerimientos funcionales y no funcionales del sistema.
- Definir el alcance real del proyecto, evitando ambigüedad frente a versiones anteriores de la idea (sistema documental empresarial completo).
- Servir de base trazable para las etapas de análisis, diseño, desarrollo y pruebas.

## 3. Alcance del proyecto

### 3.1 Incluido en el alcance
- Interfaz web (HTML/CSS/JS) para cargar un archivo PDF mediante *drag & drop* o selector de archivos.
- Extracción de texto del PDF en el navegador usando la librería **PDF.js**.
- Configuración por parte del usuario de: URL del servidor Ollama, nombre del modelo y idioma del resumen (español/inglés).
- Envío del texto extraído a la API local de Ollama (`/api/generate`) para producir un resumen.
- Visualización del resumen, con conteo de palabras del documento original.
- Acciones de copiar al portapapeles y descargar el resumen como archivo `.txt`.
- Manejo de errores de validación (tipo de archivo, tamaño) y de conexión con Ollama (CORS, servicio caído, modelo inexistente).
- Script de utilidad (`INICIAR_OLLAMA.bat`) para iniciar Ollama en Windows.

### 3.2 Fuera del alcance (no implementado en esta versión)
- Autenticación y gestión de usuarios/roles.
- Repositorios de documentos, almacenamiento persistente o base de datos.
- Clasificación automática de documentos en categorías.
- Búsqueda semántica, *embeddings* y motor RAG.
- Dashboard de estadísticas.
- Backend/API propia, despliegue en la nube, integración con OpenAI/Pinecone/PostgreSQL.

> Nota de trazabilidad: el `README.md` original describe un sistema empresarial ampliado (visión de producto a futuro). Este documento y los siguientes (01 a 05) documentan **el sistema realmente construido y evaluable**, que corresponde a la funcionalidad de generación de resúmenes descrita arriba.

## 4. Interesados (stakeholders)

| Rol | Interés en el proyecto |
|---|---|
| Estudiante(s) desarrollador(es) | Construir y sustentar el proyecto integrador |
| Docente evaluador | Validar cumplimiento de requisitos académicos |
| Usuario final | Obtener resúmenes rápidos de documentos PDF sin enviar información a servicios en la nube |

## 5. Técnicas utilizadas para el levantamiento de requerimientos

- **Análisis del código fuente entregado** (ingeniería inversa ligera sobre `index.html`, `script.js`, `style.css`).
- **Revisión documental** del `README.md` del proyecto.
- **Entrevista/definición con el docente** respecto a la estructura de entregables esperada (documento de análisis, diseño, desarrollo, pruebas e implementación).

## 6. Requerimientos funcionales (RF)

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-01 | El sistema debe permitir cargar un archivo PDF mediante arrastrar y soltar (*drag & drop*) o mediante selección manual desde el explorador de archivos. | Alta |
| RF-02 | El sistema debe validar que el archivo cargado sea de tipo PDF; en caso contrario debe mostrar un mensaje de error. | Alta |
| RF-03 | El sistema debe validar que el archivo no supere los 10 MB de tamaño. | Alta |
| RF-04 | El sistema debe mostrar el nombre del archivo cargado antes de procesarlo. | Media |
| RF-05 | El sistema debe permitir configurar la URL del servidor Ollama (por defecto `http://localhost:11434`). | Alta |
| RF-06 | El sistema debe permitir configurar el nombre del modelo de Ollama a utilizar (por defecto `mistral`). | Alta |
| RF-07 | El sistema debe permitir seleccionar el idioma del resumen (Español / Inglés). | Media |
| RF-08 | El sistema debe extraer el texto completo del PDF cargado, página por página, usando PDF.js. | Alta |
| RF-09 | El sistema debe calcular y mostrar el número de palabras del documento procesado. | Media |
| RF-10 | El sistema debe truncar el texto extraído a 8000 caracteres antes de enviarlo al modelo, para evitar exceder límites de contexto. | Media |
| RF-11 | El sistema debe enviar el texto extraído junto con un *prompt* estructurado a la API `POST /api/generate` de Ollama. | Alta |
| RF-12 | El sistema debe mostrar un estado de carga ("Procesando PDF con Ollama…") mientras espera la respuesta del modelo. | Media |
| RF-13 | El sistema debe mostrar el resumen generado en pantalla junto con el nombre del archivo y el conteo de palabras. | Alta |
| RF-14 | El sistema debe permitir copiar el resumen al portapapeles. | Media |
| RF-15 | El sistema debe permitir descargar el resumen como archivo de texto (`.txt`). | Media |
| RF-16 | El sistema debe mostrar mensajes de error claros y detalles técnicos expandibles cuando falle la extracción del PDF o la conexión con Ollama. | Alta |
| RF-17 | El sistema debe permitir cerrar la vista de resultados y reiniciar el flujo para cargar un nuevo archivo. | Media |
| RF-18 | El sistema debe ofrecer un script de arranque (`INICIAR_OLLAMA.bat`) que localice e inicie la aplicación de Ollama en Windows. | Baja |

## 7. Requerimientos no funcionales (RNF)

| ID | Requerimiento | Categoría |
|---|---|---|
| RNF-01 | La interfaz debe ser responsiva y utilizable en resoluciones de escritorio y móviles (breakpoint 768px). | Usabilidad |
| RNF-02 | El procesamiento del PDF debe realizarse íntegramente en el navegador del cliente, sin enviar el archivo original a ningún servidor externo. | Seguridad / Privacidad |
| RNF-03 | La comunicación con el modelo de IA debe hacerse contra un servidor Ollama local, evitando dependencia de servicios de IA en la nube y sus costos. | Seguridad / Costos |
| RNF-04 | El sistema no debe requerir instalación de dependencias en el cliente más allá de un navegador moderno compatible con `fetch`, `FileReader` y `Drag and Drop API`. | Compatibilidad |
| RNF-05 | El tiempo de extracción de texto debe ser perceptualmente inmediato para PDFs de tamaño moderado (hasta 10 MB). | Rendimiento |
| RNF-06 | Los mensajes de error deben ser comprensibles para un usuario no técnico, con un detalle técnico opcional para soporte. | Usabilidad |
| RNF-07 | El código debe estar organizado siguiendo separación de responsabilidades (HTML de estructura, CSS de estilo, JS de comportamiento). | Mantenibilidad |
| RNF-08 | La aplicación no debe almacenar de forma persistente ni el PDF ni el resumen generado (todo el estado vive en memoria del navegador). | Privacidad |

## 8. Requerimientos de hardware y software

| Componente | Requisito |
|---|---|
| Navegador | Chrome, Edge o Firefox actualizado (soporte de ES6+, Fetch API, PDF.js) |
| Motor de IA | Ollama instalado localmente (Windows/Mac/Linux) |
| Modelo LLM | Modelo descargado en Ollama, ej. `mistral`, `llama2`, `neural-chat` |
| Conectividad | Acceso a internet únicamente para cargar la librería PDF.js desde CDN (cdnjs.cloudflare.com) |
| Configuración especial | Variable `OLLAMA_ORIGINS=*` para permitir peticiones CORS desde el navegador |

## 9. Historias de usuario

**HU-01**
Como usuario, quiero arrastrar un PDF a la aplicación, para no tener que navegar por carpetas del sistema.
*Criterios de aceptación:* el área de carga reacciona visualmente al arrastrar (`drag-over`); al soltar el archivo, este se valida y se muestra su nombre.

**HU-02**
Como usuario, quiero indicar en qué idioma quiero el resumen, para poder usarlo en documentos en inglés o español.
*Criterios de aceptación:* el selector de idioma modifica el *prompt* enviado al modelo.

**HU-03**
Como usuario, quiero ver un mensaje de error claro si Ollama no está corriendo, para saber cómo solucionarlo sin conocimientos técnicos avanzados.
*Criterios de aceptación:* ante un `TypeError` de red, se muestra una lista de causas probables (Ollama apagado, CORS, URL incorrecta).

**HU-04**
Como usuario, quiero descargar el resumen generado, para guardarlo o compartirlo fuera de la aplicación.
*Criterios de aceptación:* el botón "Descargar" genera un archivo `.txt` con el nombre `resumen_<archivo>.txt`.

## 10. Casos de uso (resumen)

```
Actor: Usuario
┌────────────────────────────────────────────┐
│        Generador de Resúmenes PDF           │
│                                              │
│  (Cargar PDF) ---include---> (Validar archivo) │
│      |                                       │
│      v                                       │
│  (Configurar Ollama y modelo)                │
│      |                                       │
│      v                                       │
│  (Generar Resumen) ---include---> (Extraer texto PDF)
│      |                        ---include---> (Llamar API Ollama)
│      v                                       │
│  (Ver Resultado) ---extend---> (Copiar resumen)
│                   ---extend---> (Descargar resumen)
│                   ---extend---> (Ver error técnico)
└────────────────────────────────────────────┘
```

## 11. Matriz de trazabilidad (requisitos → módulo → prueba)

| Requisito | Módulo/función responsable | Caso de prueba relacionado |
|---|---|---|
| RF-01, RF-02, RF-03, RF-04 | `handleFileSelect()` | CP-01, CP-02, CP-03 |
| RF-08, RF-09, RF-10 | `extractTextFromPDF()` | CP-04 |
| RF-05, RF-06, RF-07, RF-11 | `generateSummary()`, `callOllamaAPI()` | CP-05, CP-06, CP-07 |
| RF-12, RF-13 | `showLoading()`, `showResults()` | CP-05 |
| RF-14 | `copySummary()` | CP-08 |
| RF-15 | `downloadSummary()` | CP-09 |
| RF-16 | `showError()` | CP-06, CP-07 |
| RF-17 | `closeResults()` | CP-10 |
| RNF-01 | `style.css` (media queries) | CP-11 |

## 12. Restricciones

- El sistema depende de que el usuario tenga Ollama instalado y en ejecución localmente.
- Sin configuración de CORS (`OLLAMA_ORIGINS=*`) el navegador bloqueará las peticiones a la API de Ollama.
- El límite de 8000 caracteres enviados al modelo puede recortar el contenido de documentos muy extensos, afectando la calidad del resumen.

## 13. Supuestos

- El usuario final opera en un entorno de escritorio (Windows, principalmente, dado el script `.bat` incluido).
- El usuario tiene privilegios para instalar software (Ollama) en su equipo.
