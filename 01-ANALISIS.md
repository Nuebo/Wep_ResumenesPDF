# 01 – Análisis
## Generador de Resúmenes PDF con IA (Ollama)

---

## 1. Análisis del problema

Los usuarios (estudiantes, docentes, profesionales) manejan con frecuencia documentos PDF extensos que requieren ser comprendidos rápidamente. Las alternativas actuales presentan limitaciones:

- **Leer el documento completo:** consume tiempo.
- **Servicios de IA en la nube (ChatGPT, servicios web de resumen):** requieren subir el documento a un tercero, lo cual genera riesgo de privacidad para información sensible, y muchos son de pago o tienen límites de uso.

**Problema identificado:** no existe una herramienta simple, gratuita y que respete la privacidad del usuario, que permita resumir un PDF utilizando un modelo de lenguaje que corra **localmente** en el propio computador.

**Solución propuesta:** una aplicación web estática (sin backend) que combina:
1. Extracción de texto en el navegador (PDF.js).
2. Generación de resumen mediante un LLM local servido por Ollama, consumido directamente desde el navegador vía `fetch`.

## 2. Análisis funcional por módulo

### 2.1 Módulo de carga y validación de archivo
Responsable de recibir el PDF del usuario y validarlo antes de cualquier procesamiento.

**Entradas:** archivo seleccionado por *drag & drop* o input de tipo `file`.
**Reglas de negocio:**
- RN-01: solo se aceptan archivos cuyo `file.type` contenga la cadena `pdf`.
- RN-02: el tamaño máximo permitido es 10 MB (`10 * 1024 * 1024` bytes).
- RN-03: mientras no haya un archivo válido seleccionado, el botón "Generar Resumen" permanece deshabilitado.

**Salidas:** variable global `selectedFile`, actualización visual del nombre de archivo y habilitación del botón de envío.

### 2.2 Módulo de extracción de texto (PDF.js)
Responsable de convertir el contenido binario del PDF en texto plano procesable.

**Proceso:**
1. Se lee el archivo como `ArrayBuffer`.
2. Se carga el documento con `pdfjsLib.getDocument()`.
3. Se recorre cada página (`pdf.numPages`), extrayendo el contenido textual (`getTextContent()`).
4. Se concatena el texto de todas las páginas y se calcula el conteo aproximado de palabras dividiendo por espacios en blanco.

**Regla de negocio:**
- RN-04: si el texto extraído está vacío (documento escaneado como imagen, sin capa de texto), se lanza un error explícito ("No se pudo extraer texto del PDF").

### 2.3 Módulo de integración con IA (Ollama)
Responsable de construir el *prompt*, invocar la API y procesar la respuesta.

**Proceso:**
1. Se valida que existan URL de Ollama, modelo y archivo seleccionado.
2. El texto extraído se recorta a 8000 caracteres (RN-05, límite de contexto/rendimiento del modelo local).
3. Se construye un *prompt* con instrucciones de longitud (200–400 palabras), tono profesional e idioma seleccionado.
4. Se realiza `POST` a `${ollamaUrl}/api/generate` con `stream:false`.
5. Se interpreta la respuesta JSON (`data.response`).

**Manejo de errores (RN-06):**
| Código/condición | Causa | Mensaje mostrado |
|---|---|---|
| HTTP 404 | Ollama no está corriendo en esa URL | "No se pudo conectar a Ollama…" |
| HTTP 400 | Modelo no descargado/existente | "Modelo no encontrado en Ollama…" |
| `TypeError` en `fetch` | Servidor caído, CORS bloqueado, URL incorrecta | Mensaje detallado con 3 posibles causas y solución |
| Otro HTTP no-OK | Error genérico | Código y texto de estado HTTP |

### 2.4 Módulo de presentación de resultados
Gestiona los tres estados mutuamente excluyentes de la sección de resultados: `loadingState`, `summaryOutput`, `errorState`, controlados por funciones dedicadas (`showLoading`, `showResults`, `showError`).

### 2.5 Módulo de acciones sobre el resumen
- **Copiar:** usa `navigator.clipboard.writeText()` con retroalimentación visual temporal ("✓ Copiado").
- **Descargar:** genera un enlace `data:text/plain` con nombre `resumen_<nombreOriginal>.txt`.

### 2.6 Módulo de reinicio de flujo
`closeResults()` limpia el estado (`selectedFile = null`, input de archivo, visibilidad de secciones) para permitir procesar un nuevo documento sin recargar la página.

## 3. Diagrama de flujo del proceso principal

```
[Inicio]
   │
   v
[Usuario carga PDF] --(no es PDF / >10MB)--> [Mostrar error de validación]
   │ (válido)
   v
[Habilitar botón "Generar Resumen"]
   │
   v
[Usuario click "Generar Resumen"]
   │
   v
[Validar URL Ollama / Modelo / Archivo] --(falta algo)--> [Mostrar error]
   │ (ok)
   v
[Mostrar estado "Procesando..."]
   │
   v
[Extraer texto con PDF.js] --(texto vacío)--> [Mostrar error]
   │ (texto ok)
   v
[Truncar a 8000 caracteres]
   │
   v
[POST /api/generate a Ollama] --(falla conexión / modelo)--> [Mostrar error detallado]
   │ (respuesta ok)
   v
[Mostrar resumen + conteo de palabras]
   │
   v
[Usuario: Copiar | Descargar | Cerrar]
   │
   v
[Fin / Reinicio del flujo]
```

## 4. Análisis de datos manejados

El sistema **no utiliza base de datos ni almacenamiento persistente**. Toda la información vive en memoria del navegador durante la sesión:

| Dato | Tipo | Ciclo de vida |
|---|---|---|
| Archivo PDF (`selectedFile`) | `File` (API del navegador) | Desde la selección hasta `closeResults()` o recarga de página |
| Texto extraído | `string` en memoria | Solo durante la ejecución de `generateSummary()` |
| Resumen generado | `string` mostrado en el DOM | Hasta que el usuario cierra resultados o descarga/copia |
| Configuración (URL, modelo, idioma) | Valores de formulario | Persisten mientras la pestaña esté abierta (no se guardan en `localStorage`) |

**Implicación de privacidad:** ni el PDF ni su contenido salen del equipo del usuario, excepto hacia el propio servidor Ollama que corre localmente.

## 5. Restricciones técnicas identificadas en el código

- Límite de tamaño de archivo: 10 MB (validado en cliente, no en un servidor).
- Límite de caracteres enviados al modelo: 8000 (compensa ventanas de contexto reducidas en modelos locales).
- Dependencia de CDN externo para PDF.js (`cdnjs.cloudflare.com`); sin conexión a internet, la extracción de PDF fallaría al no poder cargar la librería.
- No hay reintentos automáticos ante fallos de red; el usuario debe corregir la causa y volver a intentar manualmente.

## 6. Análisis de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación propuesta |
|---|---|---|---|
| Ollama no configurado con CORS | Alta | Alto (bloquea toda la app) | Documentado en `INICIAR_OLLAMA.bat` y en el mensaje de error |
| PDF escaneado sin texto (imagen) | Media | Alto (no se puede resumir) | Mensaje de error claro; mejora futura: OCR |
| Modelo local de baja calidad | Media | Medio (resumen deficiente) | Permitir configurar cualquier modelo instalado |
| Documento muy extenso | Media | Medio (se trunca a 8000 caracteres) | Mejora futura: resumen por fragmentos (chunking) y map-reduce |

## 7. Conclusión del análisis

El análisis confirma que el sistema resuelve un problema concreto y acotado (resumir PDFs con privacidad) mediante una arquitectura simple cliente-servidor local, sin necesidad de los componentes empresariales descritos en la visión inicial del README (autenticación, BD relacional/vectorial, dashboard). Este alcance acotado es el que se diseña, desarrolla y prueba en los siguientes documentos.
