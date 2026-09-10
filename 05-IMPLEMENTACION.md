# 05 – Implementación
## Generador de Resúmenes PDF con IA (Ollama)

---

## 1. Estrategia de implementación/despliegue

Al tratarse de una aplicación **100% cliente** (HTML + CSS + JS, sin backend propio ni base de datos), el despliegue se simplifica a dos componentes independientes:

1. **El sitio web estático** (`index.html`, `styles/style.css`, `scripts/script.js`), que puede alojarse en cualquier servidor de archivos estáticos o abrirse directamente desde el sistema de archivos local.
2. **El motor de IA (Ollama)**, que debe ejecutarse en la máquina donde se use la aplicación, ya que la comunicación se hace directamente desde el navegador hacia `http://localhost:11434`.

Esto implica que la aplicación **no es apta, sin modificaciones, para un despliegue público en internet** con múltiples usuarios simultáneos, ya que cada usuario necesitaría su propio Ollama corriendo en `localhost`. Es, por diseño, una **herramienta local/de escritorio distribuida como sitio web**.

## 2. Opciones de despliegue

| Escenario | Descripción | Aplica a este proyecto |
|---|---|---|
| Uso local individual | Abrir `index.html` directamente en el navegador en el mismo equipo donde corre Ollama | ✅ Escenario principal soportado |
| Red local (LAN) | Servir los archivos estáticos con un servidor (ej. `Live Server`, `python -m http.server`) y configurar `ollamaUrl` con la IP de la máquina que corre Ollama en la LAN | ✅ Posible, requiere `OLLAMA_ORIGINS` abierto y firewall configurado |
| Publicación en internet (ej. GitHub Pages, Netlify) | Publicar el front-end públicamente | ⚠️ Posible solo el *hosting* estático; cada visitante necesitaría su propio Ollama local accesible desde su navegador |
| Contenedorización (Docker) | Empaquetar front-end y Ollama en contenedores | ❌ No implementado en esta versión; mejora futura |

## 3. Pasos de instalación y puesta en marcha (entorno de producción/uso final)

1. **Distribuir los archivos** del proyecto (`index.html`, carpeta `scripts/`, carpeta `styles/`, `INICIAR_OLLAMA.bat`) al equipo del usuario final.
2. **Instalar Ollama** desde `https://ollama.ai` si no está instalado.
3. **Descargar el modelo** por defecto:
   ```
   ollama pull mistral
   ```
4. **Configurar CORS** exportando `OLLAMA_ORIGINS=*` (o el origen específico del sitio) antes de iniciar Ollama, requisito indispensable para que el navegador pueda invocar la API sin ser bloqueado.
5. **Iniciar Ollama** ejecutando `INICIAR_OLLAMA.bat` (Windows) o el equivalente manual en Mac/Linux.
6. **Abrir `index.html`** en el navegador (doble clic, o mediante un servidor estático local).
7. **Verificar conexión:** cargar un PDF de prueba pequeño y generar un resumen; si falla, revisar el mensaje de error mostrado por la aplicación (autodiagnóstico incluido en `callOllamaAPI`).

## 4. Manual de usuario

1. Abrir la aplicación en el navegador.
2. Arrastrar un archivo PDF al recuadro punteado, o hacer clic en "selecciona un archivo".
3. Verificar/ajustar la **URL del servidor Ollama** (por defecto no requiere cambios si Ollama corre en el mismo equipo).
4. Verificar/ajustar el **modelo** a usar (debe coincidir con uno ya descargado en Ollama).
5. Elegir el **idioma** deseado para el resumen (Español/Inglés).
6. Hacer clic en **"Generar Resumen"**.
7. Esperar a que finalice el procesamiento (se muestra un indicador de carga).
8. Revisar el resumen generado junto con el conteo de palabras del documento original.
9. Usar los botones **"Copiar"** o **"Descargar"** según se necesite.
10. Hacer clic en **"Cerrar"** para procesar un nuevo documento.

**Solución de problemas comunes:**

| Síntoma | Causa probable | Solución |
|---|---|---|
| "No se pudo conectar a Ollama…" | Ollama no está corriendo | Ejecutar `INICIAR_OLLAMA.bat` o iniciar Ollama manualmente |
| Error de red / CORS en la consola | Falta configurar `OLLAMA_ORIGINS=*` | Configurar la variable de entorno y reiniciar Ollama |
| "Modelo no encontrado en Ollama" | El modelo indicado no está descargado | Ejecutar `ollama pull <modelo>` |
| "No se pudo extraer texto del PDF" | El PDF es una imagen escaneada sin texto | Usar un PDF con texto seleccionable, o aplicar OCR previo |

## 5. Manual de administración y mantenimiento

- **Actualizar la versión de PDF.js:** modificar las URLs del CDN en `index.html` y en `script.js` (`workerSrc`) a la nueva versión, verificando compatibilidad de la API.
- **Cambiar el modelo por defecto:** editar el atributo `value` del campo `#ollamaModel` en `index.html`.
- **Ajustar el límite de tamaño de archivo:** modificar la constante `10 * 1024 * 1024` en `handleFileSelect()` (`scripts/script.js`).
- **Ajustar el límite de caracteres enviados al modelo:** modificar `text.substring(0, 8000)` en `generateSummary()`.
- **Monitoreo:** al no existir backend ni logs de servidor, la única fuente de diagnóstico es la consola del navegador (`console.log`/`console.error` ya presentes en el código).

## 6. Consideraciones de producción y mejoras futuras

- Persistir configuración de usuario (URL, modelo, idioma) en `localStorage` para no repetirla en cada sesión.
- Implementar fragmentación (*chunking*) del texto extraído para resumir documentos extensos sin perder contenido más allá de los 8000 caracteres actuales.
- Agregar soporte OCR para PDFs escaneados.
- Empaquetar Ollama y el front-end en un contenedor Docker único para simplificar la distribución.
- Evaluar, si el alcance del proyecto crece, la incorporación de los componentes descritos originalmente en el README (autenticación, repositorios, búsqueda semántica), lo cual implicaría diseñar un backend y una base de datos que hoy no existen.

## 7. Cierre

La implementación descrita corresponde a una herramienta funcional, autocontenida y de bajo costo operativo, adecuada para uso individual o en red local, que cumple el objetivo definido en el documento de Ingeniería de Requerimientos: generar resúmenes de documentos PDF de forma privada mediante IA local.
