# 🎓 Sistema Inteligente de Gestión y Análisis Documental

## Proyecto Integrador - Unidades Tecnológicas de Santander (UTS)

**Programa**: Tecnología en Desarrollo de Software  
**Semestre**: VI  
**Docente**: Wilson Castaño Galviz  
**Año**: 2024

---

## 📋 Descripción General

Este es un **proyecto integrador empresarial** que busca transformar una carpeta de documentos en un **sistema inteligente** capaz de:

- 📄 **Gestionar documentos** en múltiples formatos (PDF, DOCX, TXT)
- 🧠 **Procesar con Inteligencia Artificial** para extraer información
- 🏷️ **Clasificar automáticamente** documentos en categorías
- 📝 **Generar resúmenes** inteligentes
- 🔍 **Buscar semánticamente** dentro de los documentos
- 💬 **Responder preguntas** en lenguaje natural
- 📊 **Visualizar estadísticas** en un dashboard completo

---

## 🎯 Objetivos

### Objetivo General
Diseñar, desarrollar, probar, documentar e implementar una **aplicación empresarial web** que integre gestión documental con **Inteligencia Artificial** para convertir información no estructurada en información útil.

### Objetivos Específicos
1. Implementar sistema robusto de autenticación y autorización
2. Desarrollar módulo de procesamiento de documentos con IA
3. Crear interfaz intuitiva para gestión de repositorios
4. Implementar búsqueda semántica y consultas en lenguaje natural
5. Documentar completamente el ciclo de desarrollo
6. Demostrar integración real de IA en todas las fases

---

## 📦 Características Principales

### 👤 Autenticación
- [x] Registro de usuarios
- [x] Sistema de login seguro
- [x] Gestión de roles y permisos
- [x] Recuperación de contraseña

### 📁 Gestión de Repositorios
- [x] Crear/editar/eliminar repositorios
- [x] Compartir repositorios con otros usuarios
- [x] Control de acceso granular
- [x] Historial de cambios

### 📄 Administración de Documentos
- [x] Carga de archivos múltiples
- [x] Soporte PDF, DOCX, TXT (mínimo)
- [x] Validación de formatos y tamaños
- [x] Descarga de documentos procesados
- [x] Eliminación segura

### 🤖 Inteligencia Artificial
- [x] Extracción automática de texto
- [x] Clasificación en 3+ categorías
- [x] Generación de resúmenes
- [x] Extracción de información estructurada
- [x] Búsqueda semántica basada en embeddings
- [x] Respuesta a preguntas con RAG

### 🔍 Búsqueda y Consulta
- [x] Búsqueda de texto completo
- [x] Búsqueda semántica (similarity search)
- [x] Filtros avanzados
- [x] Preguntas en lenguaje natural
- [x] Historial de búsquedas

### 📊 Dashboard
- [x] Estadísticas generales
- [x] Gráficos de uso
- [x] Indicadores por categoría
- [x] Actividad reciente
- [x] Alertas y notificaciones

---

## 🏗️ Arquitectura Técnica

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  - Dashboard           - Búsqueda                        │
│  - Upload             - Chat IA                          │
│  - Repositorios       - Perfil Usuario                   │
└──────────────┬──────────────────────────────────────────┘
               │
         HTTP/REST/GraphQL
               │
┌──────────────▼──────────────────────────────────────────┐
│                   BACKEND API                            │
│  - Routes             - Controllers                      │
│  - Services           - Middleware                       │
│  - Authentication     - Validation                       │
└──┬─────────────┬──────────────┬────────────────────┬────┘
   │             │              │                    │
   ▼             ▼              ▼                    ▼
┌────────┐ ┌──────────┐ ┌────────────┐  ┌──────────────┐
│ PostgreSQL   │ Pinecone  │ S3/Storage │  │   OpenAI    │
│  (Relational │(Vectorial)│  (Files)   │  │    API      │
│   Database)  │           │            │  │             │
└────────┘ └──────────┘ └────────────┘  └──────────────┘

┌────────────────────────────────────────────────────────┐
│          Módulo de Inteligencia Artificial              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  Extractors  │ │ Classifiers  │ │ Summarizers  │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Embeddings   │ │  RAG Engine  │ │  NLP Tasks   │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Stack Recomendado

| Componente | Opciones |
|-----------|----------|
| Frontend | React, Vue.js, Angular |
| Backend | Node.js + Express, Python + Flask/Django, Java + Spring |
| BD Relacional | PostgreSQL, MySQL |
| BD Vectorial | Pinecone, Weaviate, Milvus |
| IA | OpenAI API, Claude, Google PaLM |
| Almacenamiento | AWS S3, Google Cloud Storage, Storage local |
| Despliegue | Docker, Kubernetes, Cloud Provider |

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+ o Python 3.9+
- PostgreSQL 13+
- OpenAI API Key
- Docker (recomendado)

### Instalación en 5 pasos

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd proyecto-documentos

# 2. Configurar entorno
cp .env.example .env
# Editar .env con tus claves

# 3. Lanzar con Docker
docker-compose up -d

# 4. Inicializar BD
docker-compose exec backend npm run migrate

# 5. Acceder a la app
# Frontend: http://localhost:3001
# API: http://localhost:3000
```

**Para instalación manual detallada**, ver [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)

---

## 📚 Documentación Completa

### Guías Disponibles

| Archivo | Contenido |
|---------|----------|
| [GUIA_COMPLETA.md](./GUIA_COMPLETA.md) | Guía exhaustiva con todos los requisitos |
| [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) | Estructura de carpetas y organización |
| [API_ENDPOINTS.md](./API_ENDPOINTS.md) | Referencia completa de API REST |
| [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) | Setup y configuración inicial |

### Documentación del Ciclo de Desarrollo

Estos documentos deben ser completados durante el proyecto:

1. **01-ANALISIS.md** (20% evaluación)
   - Requisitos funcionales y no funcionales
   - Historias de usuario
   - Casos de uso
   - Matriz de trazabilidad

2. **02-DISEÑO.md** (20% evaluación)
   - Arquitectura del sistema
   - Diagramas UML
   - Modelo Entidad-Relación
   - Diseño de API

3. **03-DESARROLLO.md** (20% evaluación)
   - Código fuente comentado
   - Estructura de carpetas
   - Manual técnico de instalación

4. **04-PRUEBAS.md** (15% evaluación)
   - Plan de pruebas
   - Mínimo 10 casos de prueba
   - Evidencias de ejecución

5. **05-IMPLEMENTACION.md** (10% evaluación)
   - Proceso de despliegue
   - Manual de usuario
   - Manual de administración

---

## 🧪 Testing

### Tipos de Pruebas

```bash
# Pruebas unitarias
npm run test:unit

# Pruebas de integración
npm run test:integration

# Pruebas e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

### Casos de Prueba Mínimos (10 requeridos)

1. Autenticación - Registro y login
2. Carga de documentos válidos e inválidos
3. Clasificación automática de documentos
4. Generación de resúmenes
5. Búsqueda semántica
6. Consultas con IA
7. Extracción de información
8. Gestión de repositorios
9. Validaciones de errores
10. Pruebas de seguridad

---

## 🔐 Seguridad

### Medidas Implementadas
- ✅ Autenticación JWT
- ✅ Validación de inputs
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ CORS configurado
- ✅ Variables de entorno (.env)
- ✅ Rate limiting
- ✅ Validación de tipos de archivo
- ✅ Sanitización de datos

### Variables Sensibles (.env)
```env
# NUNCA commit esto en Git
OPENAI_API_KEY=sk-...
JWT_SECRET=tu-secret-seguro
DB_PASSWORD=contraseña
PINECONE_API_KEY=...
```

---

## 📊 Entregables Obligatorios

- [ ] 01 – Documento de Análisis
- [ ] 02 – Documento de Diseño
- [ ] 03 – Documento de Desarrollo
- [ ] 04 – Plan y Evidencias de Pruebas
- [ ] 05 – Documento de Implementación
- [ ] 06 – Manual de Usuario
- [ ] 07 – Manual Técnico/Administración
- [ ] 08 – Matriz de Trazabilidad
- [ ] 09 – Código Fuente en Git
- [ ] 10 – Base de Datos y Scripts
- [ ] 11 – Repositorio de 30 Documentos de Prueba
- [ ] 12 – Video de Demostración (≤5 min)
- [ ] 13 – Presentación y Sustentación

---

## ✅ Checklist de Evaluación

### Análisis (20%)
- [ ] Requisitos claros y numerados
- [ ] Historias de usuario con criterios
- [ ] Casos de uso detallados
- [ ] Matriz de trazabilidad

### Diseño (20%)
- [ ] Arquitectura bien documentada
- [ ] Diagramas UML completos
- [ ] Modelo de datos claro
- [ ] API bien definida

### Desarrollo (20%)
- [ ] Aplicación funcional
- [ ] Código limpio y comentado
- [ ] IA realmente integrada
- [ ] Buenas prácticas de programación

### Pruebas (15%)
- [ ] Plan de pruebas documentado
- [ ] Mínimo 10 casos de prueba
- [ ] Evidencias de ejecución
- [ ] Trazabilidad requisito-prueba

### Implementación (10%)
- [ ] Proceso de despliegue claro
- [ ] Manuales de usuario y admin
- [ ] Sistema funcionando

### Documentación (5%)
- [ ] Organizadas y coherentes
- [ ] Referencias cruzadas

### Sustentación (10%)
- [ ] Demostración en vivo
- [ ] Explicación de decisiones
- [ ] Todos comprenden el proyecto

---

## 📞 Contacto y Soporte

- **Docente**: Wilson Castaño Galviz
- **Institución**: Unidades Tecnológicas de Santander (UTS)
- **Programa**: Tecnología en Desarrollo de Software
- **Semestre**: VI

---

## 🔗 Enlaces Útiles

### Documentación Oficial
- [OpenAI API Docs](https://platform.openai.com/docs)
- [LangChain Documentation](https://docs.langchain.com/)
- [Pinecone Vector DB](https://www.pinecone.io/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [React Documentation](https://react.dev/)

### Recursos de IA
- [RAG Explained](https://aws.amazon.com/es/what-is/retrieval-augmented-generation/)
- [Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Vector Databases](https://www.pinecone.io/learn/vector-database/)
- [NLP Basics](https://www.tensorflow.org/tutorials/text)

### Desarrollo
- [Git Documentation](https://git-scm.com/doc)
- [Docker Guide](https://docs.docker.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [Web Security](https://owasp.org/www-project-top-ten/)

---

## 📈 Roadmap del Proyecto

```
Semana 1-2: Análisis y Diseño
├─ Definir requisitos
├─ Crear diagramas
└─ Diseñar arquitectura

Semana 3-5: Desarrollo Backend
├─ Setup de BD
├─ API de autenticación
├─ API de documentos
└─ Integración con IA

Semana 6-7: Desarrollo Frontend
├─ Interfaz de usuario
├─ Búsqueda y consultas
└─ Dashboard

Semana 8: Testing
├─ Pruebas funcionales
├─ Pruebas de IA
└─ Pruebas de seguridad

Semana 9: Implementación
├─ Despliegue
├─ Documentación final
└─ Preparación de sustentación

Semana 10: Sustentación
└─ Presentación y defensa
```

---

## 💡 Tips para el Éxito

1. **Empezar por el análisis**: Dedica tiempo a entender bien los requisitos
2. **Documentar todo**: La documentación es 5% de la nota
3. **Integrar IA desde el inicio**: No es opcional
4. **Hacer pruebas reales**: Las evidencias deben ser reales
5. **Usar Git**: Demuestra progreso y control de versiones
6. **Trabajo en equipo**: Todos deben entender el proyecto completo
7. **Comunicar decisiones**: Justifica por qué elegiste cada tecnología

---

## 🎓 Condiciones Académicas

- ✅ Solución desarrollada por el equipo
- ✅ Uso de IA generativa como apoyo (no reemplazo)
- ✅ Credenciales no en repositorio
- ✅ Documentación corresponde a sistema real
- ✅ Evidencias de pruebas son reales
- ✅ Todos los integrantes conocen el proyecto

---

## 📄 Licencia

Este proyecto es académico y está bajo supervisión de la UTS.

---

## 🎉 ¡A Empezar!

```bash
# Clona el proyecto
git clone <repo-url>

# Instala dependencias
npm install  # o pip install -r requirements.txt

# Configura .env
cp .env.example .env

# ¡Comienza a desarrollar!
npm start
```

**Próximo paso**: Consulta [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) para comenzar.

---

**Última actualización**: 2024-01  
**Versión**: 1.0  
**Estado**: 🟢 Activo

