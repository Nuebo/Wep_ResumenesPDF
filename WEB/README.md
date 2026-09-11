# 📄 Generador de Resúmenes PDF con IA (Ollama) — con Login y Base de Datos (MySQL / XAMPP)

## Proyecto Integrador - Unidades Tecnológicas de Santander (UTS)

**Programa**: Tecnología en Desarrollo de Software
**Docente**: Wilson Castaño Galviz

---

## 📋 Descripción

Aplicación web que permite a un usuario **registrarse, iniciar sesión**, cargar un PDF, extraer su texto en el navegador (PDF.js), generar un resumen con un modelo de IA local (**Ollama**), y **guardar automáticamente el PDF original y el resumen** en una base de datos **MySQL (servida por XAMPP)**, para poder consultarlos después desde la sección "Mis Resúmenes".

> Esta versión reemplaza la base de datos SQLite anterior por **MySQL usando XAMPP**. Todo lo demás (frontend, Ollama, autenticación, historial, buscador, asistente de IA) funciona exactamente igual.

## 🏗️ Arquitectura

```
┌──────────────────────────┐        ┌───────────────────────────┐
│   FRONTEND (navegador)   │        │   BACKEND (Node/Express)  │
│                           │        │                            │
│  login.html               │──────▶│  /api/auth/register        │
│  register.html             │──────▶│  /api/auth/login           │
│  index.html (protegido)   │──────▶│  /api/documents (guardar)  │
│  historial.html            │──────▶│  /api/documents (listar)   │
│                           │        │                            │
│  PDF.js (extrae texto)    │        │  MySQL (XAMPP): usuarios,  │
│                           │        │  documentos y resúmenes    │
└─────────────┬─────────────┘        │  /uploads (PDFs guardados) │
              │ fetch() directo      └───────────────────────────┘
              ▼
┌───────────────────────────┐
│   Ollama (local, IA)      │
│  http://localhost:11434   │
└───────────────────────────┘
```

**Importante:** el PDF **nunca se envía a Ollama a través del backend**; el navegador llama directamente a Ollama para generar el resumen (por privacidad). El backend solo se usa para **login/registro** y para **guardar/consultar el historial** (PDF + resumen) en MySQL.

## 📦 Estructura del proyecto

```
WEB/
├── index.html              # App principal (requiere sesión iniciada)
├── login.html               # Iniciar sesión
├── register.html            # Crear cuenta
├── historial.html            # "Mis Resúmenes" guardados
├── INICIAR_XAMPP.bat          # Abre el Panel de Control de XAMPP (iniciar MySQL)
├── INICIAR_OLLAMA.bat        # Inicia Ollama (Windows)
├── INICIAR_SERVIDOR.bat      # Instala e inicia el backend (Windows)
├── scripts/
│   ├── config.js             # URL del backend
│   ├── auth.js               # Helpers de sesión (token, logout, fetch autenticado)
│   ├── login.js
│   ├── register.js
│   ├── historial.js
│   └── script.js             # Lógica principal (extracción PDF + IA + guardado)
├── styles/
│   └── style.css
└── backend/
    ├── server.js              # Servidor Express (inicializa MySQL antes de arrancar)
    ├── db.js                  # Conexión a MySQL (XAMPP) + creación automática de tablas
    ├── schema.sql              # (Opcional) esquema SQL para crear todo a mano en phpMyAdmin
    ├── package.json
    ├── .env.example
    ├── middleware/
    │   └── auth.js             # Verificación de token JWT
    ├── routes/
    │   ├── auth.routes.js       # /api/auth/register, /login, /me
    │   └── documents.routes.js  # /api/documents (CRUD del historial)
    └── uploads/                # Aquí se guardan los PDFs subidos (se crea solo)
```

## 🗄️ Base de datos (MySQL / XAMPP)

Se usa **MySQL**, el motor de base de datos que trae **XAMPP** integrado (junto con phpMyAdmin para verlo visualmente si quieres).

A diferencia de la versión anterior con SQLite, aquí **no se crea ningún archivo local**: los datos viven dentro del servidor MySQL que XAMPP levanta en tu equipo (por defecto en `localhost:3306`).

**Creación automática:** la primera vez que inicias el backend (`npm start` / `INICIAR_SERVIDOR.bat`), el archivo `backend/db.js`:
1. Se conecta a MySQL.
2. Crea la base de datos `resumen_pdf_db` si no existe.
3. Crea las tablas `users` y `documents` si no existen.

No necesitas importar nada manualmente. Aun así, se incluye `backend/schema.sql` por si prefieres crear la base de datos tú mismo desde la pestaña "SQL" de phpMyAdmin.

**Tabla `users`**

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT (AUTO_INCREMENT) | Identificador |
| name | VARCHAR(255) | Nombre del usuario |
| email | VARCHAR(255) único | Correo, usado para iniciar sesión |
| password_hash | VARCHAR(255) | Contraseña cifrada con bcrypt (nunca en texto plano) |
| created_at | TIMESTAMP | Fecha de registro |

**Tabla `documents`**

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT (AUTO_INCREMENT) | Identificador |
| user_id | INT | Dueño del documento (clave foránea a `users`, ON DELETE CASCADE) |
| original_filename | VARCHAR(500) | Nombre original del PDF |
| stored_filename | VARCHAR(500) | Nombre con el que se guardó en `backend/uploads/` |
| word_count | INT | Palabras del documento original |
| language | VARCHAR(10) | Idioma del resumen (es/en) |
| model | VARCHAR(255) | Modelo de Ollama usado |
| summary_text | LONGTEXT | Texto del resumen generado |
| created_at | TIMESTAMP | Fecha de creación |

## 🔐 Autenticación

- Contraseñas cifradas con **bcrypt** (nunca se guardan en texto plano).
- Sesión manejada con **JWT** (token firmado, expira en 7 días), guardado en `localStorage` del navegador.
- Cada petición al historial/documentos envía el token en el header `Authorization: Bearer <token>`.
- Un usuario **solo puede ver, descargar o eliminar sus propios documentos** (se valida `user_id` en cada consulta).

## 🚀 Instalación y puesta en marcha

### Requisitos
- [Node.js](https://nodejs.org) 18 o superior
- [XAMPP](https://www.apachefriends.org) instalado (usa el módulo **MySQL**; Apache no es necesario para esta app)
- [Ollama](https://ollama.ai) instalado, con un modelo descargado (ej. `mistral`)

### Pasos

1. **Iniciar MySQL con XAMPP:**
   - Windows: ejecuta `INICIAR_XAMPP.bat` (abre el Panel de Control de XAMPP).
   - En el panel, haz clic en **"Start"** junto a **MySQL** (debe quedar en verde).
   - Deja el Panel de Control abierto mientras usas la aplicación.

2. **Iniciar Ollama** (con CORS habilitado):
   - Windows: ejecutar `INICIAR_OLLAMA.bat`
   - Asegúrate de tener la variable `OLLAMA_ORIGINS=*` configurada antes de iniciarlo.

3. **Iniciar el backend:**
   - Windows: doble clic en `INICIAR_SERVIDOR.bat` (instala dependencias la primera vez, crea `.env`, y luego levanta el servidor en `http://localhost:3000`, creando la base de datos MySQL automáticamente).
   - Manual (cualquier sistema operativo):
     ```bash
     cd backend
     cp .env.example .env
     npm install
     npm start
     ```
   - Si tu instalación de XAMPP tiene un usuario/contraseña distinto para MySQL, edítalo en `backend/.env` (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`).

4. **Abrir la aplicación:**
   - Abre `login.html` en el navegador (o `index.html`, que te redirigirá a `login.html` si no has iniciado sesión).
   - Regístrate con nombre, correo y contraseña.
   - Inicia sesión y comienza a generar resúmenes: cada uno se guardará automáticamente en "Mis Resúmenes".

## 🤖 Asistente de IA (Ollama)

Un botón flotante (🤖) disponible en `index.html` y `historial.html` abre un panel de chat que habla **directamente con Ollama** (mismo mecanismo que el generador de resúmenes, sin pasar por el backend).

- Tiene sus propios campos de URL/modelo (se guardan en `localStorage`, independientes de los del formulario principal).
- Si el usuario acaba de generar un resumen, o acaba de abrir el detalle de un documento en "Mis Resúmenes", el asistente **usa ese resumen como contexto**, para poder responder preguntas como "¿de qué trata este documento?" o "dame 3 puntos clave de este PDF".
- La conversación vive solo en memoria del navegador (no se guarda en la base de datos).

## 🔍 Buscador de PDFs por nombre

En "Mis Resúmenes" (`historial.html`) hay una barra de búsqueda: al escribir parte del nombre de un PDF ya subido y presionar **Buscar** (o Enter), el sistema:

1. Filtra en la base de datos los documentos del usuario cuyo nombre de archivo coincide (búsqueda parcial, sin distinguir mayúsculas/minúsculas gracias a la collation `utf8mb4_unicode_ci`).
2. Si la búsqueda encuentra **un solo resultado**, muestra automáticamente qué PDF es junto con su resumen completo, sin necesidad de hacer clic en "Ver".
3. Si hay varios resultados, se listan en la tabla para que el usuario elija cuál ver.

Esto se resuelve con el endpoint `GET /api/documents?q=<texto>` en el backend (`WHERE original_filename LIKE '%texto%'`).

## 🧭 Flujo de uso

1. El usuario se registra o inicia sesión (`register.html` / `login.html`).
2. Es redirigido a `index.html`, donde carga un PDF y genera un resumen (igual que antes, usando Ollama).
3. Al generarse el resumen con éxito, la app **envía automáticamente** el PDF original y el resumen al backend (`POST /api/documents`), que los guarda en `backend/uploads/` y en la tabla `documents` de MySQL.
4. En `historial.html` ("Mis Resúmenes") el usuario puede ver todos sus documentos procesados, abrir el detalle del resumen, descargar el PDF original o eliminar el registro.

## ⚠️ Notas importantes

- El backend corre en `http://localhost:3000` por defecto (ver `scripts/config.js` para cambiarlo).
- Los archivos PDF se guardan en `backend/uploads/`; al eliminar un documento desde "Mis Resúmenes", también se borra su archivo físico.
- Cambia `JWT_SECRET` en `backend/.env` antes de usar esto en un entorno real (no solo de práctica académica).
- Si quieres ver los datos visualmente, entra a `http://localhost/phpmyadmin` (con XAMPP corriendo) y busca la base de datos `resumen_pdf_db`.
- Si tu MySQL de XAMPP tiene contraseña para `root`, o corre en un puerto distinto a 3306, actualiza `backend/.env` en consecuencia.
- Esta versión requiere que **XAMPP (módulo MySQL) esté corriendo** antes de iniciar el backend; si no lo está, el backend mostrará un mensaje de error claro al arrancar.
