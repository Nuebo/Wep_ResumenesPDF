// URL base del backend. Cambiar si el servidor corre en otra IP/puerto
// (por ejemplo, para usarlo desde otro equipo de la misma red local).
const API_BASE_URL = 'http://localhost:3000/api';

// Configuración por defecto del motor de IA que genera los resúmenes.
// Se usan automáticamente sin mostrarse en pantalla; el usuario final
// no necesita saber qué motor corre detrás. Solo aparecen si se abre
// "Configuración avanzada" para ajustarlos manualmente.
const AI_ENGINE_DEFAULT_URL = 'http://localhost:11434';
const AI_ENGINE_DEFAULT_MODEL = 'mistral';
