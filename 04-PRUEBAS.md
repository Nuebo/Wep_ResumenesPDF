# 04 – Pruebas
## Generador de Resúmenes PDF con IA (Ollama)

---

## 1. Plan de pruebas

### 1.1 Objetivo
Verificar que el sistema cumple los requerimientos funcionales y no funcionales definidos en el documento 00, mediante pruebas manuales ejecutadas sobre el navegador, dado que el proyecto no cuenta con backend ni suite de pruebas automatizadas.

### 1.2 Alcance
Se prueban los flujos de carga de archivo, extracción de texto, integración con Ollama, presentación de resultados, acciones sobre el resumen y comportamiento responsivo.

### 1.3 Herramientas
- Navegador Chrome/Edge (DevTools → pestañas *Console* y *Network*).
- Ollama corriendo localmente con al menos un modelo descargado (ej. `mistral`).
- Archivos PDF de prueba: uno con texto normal, uno escaneado (solo imagen), uno mayor a 10 MB, uno no-PDF (ej. `.docx` renombrado).

### 1.4 Tipo de pruebas
- **Funcionales:** validan que cada RF definido en el documento 00 se cumpla.
- **De validación de datos:** tipo y tamaño de archivo.
- **De integración:** comunicación cliente–Ollama.
- **De manejo de errores:** respuestas ante fallos de red, HTTP y de contenido.
- **De usabilidad/responsividad:** comportamiento en distintos anchos de pantalla.

## 2. Casos de prueba

| ID | Descripción | Precondición | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|
| CP-01 | Cargar un PDF válido por selección manual | Ollama corriendo, modelo descargado | 1. Clic en "selecciona un archivo". 2. Elegir un PDF < 10MB | Se muestra el nombre del archivo y se habilita "Generar Resumen" | Pendiente de ejecución |
| CP-02 | Cargar un archivo no-PDF | Ninguna | 1. Arrastrar un archivo `.docx` o `.jpg` al `dropZone` | Se muestra el error "Por favor selecciona un archivo PDF válido" | Pendiente de ejecución |
| CP-03 | Cargar un PDF mayor a 10 MB | Disponer de un PDF > 10MB | 1. Seleccionar el archivo grande | Se muestra el error "El archivo no debe exceder 10 MB" | Pendiente de ejecución |
| CP-04 | Extraer texto de un PDF con contenido textual | PDF válido cargado | 1. Cargar PDF con texto real. 2. Clic en "Generar Resumen" | El conteo de palabras mostrado es mayor a cero y corresponde aproximadamente al contenido del documento | Pendiente de ejecución |
| CP-05 | Generar resumen exitoso en español | Ollama activo, modelo `mistral` descargado, idioma = Español | 1. Cargar PDF válido. 2. Dejar idioma en Español. 3. Clic en "Generar Resumen" | Se muestra estado de carga y luego el resumen en español, entre 200-400 palabras aproximadamente | Pendiente de ejecución |
| CP-06 | Generar resumen exitoso en inglés | Igual que CP-05, idioma = Inglés | 1. Cambiar selector a "Inglés". 2. Repetir flujo | El resumen se genera en inglés | Pendiente de ejecución |
| CP-07 | Ollama apagado o URL incorrecta | Detener el servicio de Ollama | 1. Cargar PDF válido. 2. Clic en "Generar Resumen" | Se muestra un error detallando las 3 causas probables (Ollama apagado, CORS, URL/puerto incorrectos) | Pendiente de ejecución |
| CP-08 | Modelo inexistente en Ollama | Ollama activo, modelo mal escrito, ej. `mistral-xx` | 1. Cambiar campo "Modelo Ollama" a un nombre no descargado. 2. Generar resumen | Se muestra error "Modelo no encontrado en Ollama…" | Pendiente de ejecución |
| CP-09 | Copiar resumen al portapapeles | Resumen generado con éxito | 1. Clic en "📋 Copiar" | El texto del botón cambia temporalmente a "✓ Copiado" y el contenido queda disponible en el portapapeles | Pendiente de ejecución |
| CP-10 | Descargar resumen | Resumen generado con éxito | 1. Clic en "⬇ Descargar" | Se descarga un archivo `resumen_<nombre>.txt` con el contenido del resumen | Pendiente de ejecución |
| CP-11 | Cerrar resultados y reiniciar flujo | Resultados visibles (éxito o error) | 1. Clic en "✕ Cerrar" | Se vuelve a la sección de carga, el archivo seleccionado se limpia y el botón "Generar Resumen" queda deshabilitado | Pendiente de ejecución |
| CP-12 | Comportamiento responsivo en móvil | Ninguna | 1. Abrir la app en un viewport < 768px (o modo responsivo de DevTools) | Los botones de acciones se apilan verticalmente y los paddings se reducen sin romper el diseño | Pendiente de ejecución |
| CP-13 | Extracción de PDF escaneado (solo imagen) | PDF sin capa de texto | 1. Cargar el PDF escaneado. 2. Generar resumen | Se muestra el error "No se pudo extraer texto del PDF" | Pendiente de ejecución |

> Nota: la columna "Estado" y el campo "Resultado obtenido" deben completarse durante la ejecución real de las pruebas (capturas de pantalla y consola del navegador como evidencia), previo a la sustentación del proyecto.

## 3. Matriz de trazabilidad requisito – prueba

| Requisito | Casos de prueba |
|---|---|
| RF-01 a RF-04 (carga y validación) | CP-01, CP-02, CP-03 |
| RF-08, RF-09 (extracción de texto) | CP-04, CP-13 |
| RF-05 a RF-07, RF-11 (configuración e integración IA) | CP-05, CP-06, CP-08 |
| RF-12, RF-13 (presentación de resultados) | CP-05 |
| RF-14 (copiar) | CP-09 |
| RF-15 (descargar) | CP-10 |
| RF-16 (manejo de errores) | CP-07, CP-08, CP-13 |
| RF-17 (reinicio de flujo) | CP-11 |
| RNF-01 (responsividad) | CP-12 |

## 4. Evidencias requeridas por caso de prueba

Para cada caso de prueba ejecutado se recomienda registrar:
1. Captura de pantalla del estado inicial (precondición).
2. Captura del resultado obtenido en la interfaz.
3. Captura de la pestaña *Console*/*Network* de DevTools cuando el caso involucre la API de Ollama (CP-05 a CP-08).
4. Breve descripción de si el resultado obtenido coincide con el esperado (Aprobado/Fallido).

## 5. Criterios de aceptación de la fase de pruebas

- El 100% de los casos de prueba funcionales (CP-01 a CP-11, CP-13) deben ejecutarse y documentarse con evidencia.
- Ningún caso de prueba de validación de datos (CP-02, CP-03) debe permitir el procesamiento de un archivo inválido.
- Los mensajes de error deben ser legibles por un usuario no técnico en el 100% de los casos de fallo (CP-07, CP-08, CP-13).
