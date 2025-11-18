/**
 * Cliente API para el Sistema de Reservas
 * Conecta el frontend HTML con el backend Express
 */

// Configuración de la API
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : window.location.origin;

/**
 * Función auxiliar para hacer peticiones HTTP
 */
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===== API DE RESERVAS =====

/**
 * Obtener todas las reservas con filtros opcionales
 */
async function obtenerReservas(filtros = {}) {
    const params = new URLSearchParams(filtros);
    return fetchAPI(`/api/reservas?${params}`);
}

/**
 * Obtener una reserva por ID
 */
async function obtenerReservaPorId(id) {
    return fetchAPI(`/api/reservas/${id}`);
}

/**
 * Crear nueva reserva
 */
async function crearReserva(reserva) {
    return fetchAPI('/api/reservas', {
        method: 'POST',
        body: JSON.stringify(reserva),
    });
}

/**
 * Actualizar reserva
 */
async function actualizarReserva(id, datos) {
    return fetchAPI(`/api/reservas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(datos),
    });
}

/**
 * Cambiar estado de reserva
 */
async function cambiarEstadoReserva(id, estado, datos = {}) {
    return fetchAPI(`/api/reservas/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado, ...datos }),
    });
}

/**
 * Eliminar reserva
 */
async function eliminarReserva(id) {
    return fetchAPI(`/api/reservas/${id}`, {
        method: 'DELETE',
    });
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Mostrar notificación toast
 */
function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Mostrar loading
 */
function mostrarLoading(containerId, show = true) {
    const loading = document.getElementById(containerId);
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

/**
 * Formatear fecha a formato humano (DD/MM/YYYY)
 */
function formatearFechaHumana(fecha) {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Obtener fecha de hoy en formato YYYY-MM-DD
 */
function obtenerFechaHoy() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Obtener emoji según turno
 */
function obtenerEmojiTurno(turno) {
    return turno === 'comida' ? '🌅' : '🌙';
}

/**
 * Capitalizar primera letra
 */
function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Exportar funciones globalmente
window.API = {
    obtenerReservas,
    obtenerReservaPorId,
    crearReserva,
    actualizarReserva,
    cambiarEstadoReserva,
    eliminarReserva,
    mostrarToast,
    mostrarLoading,
    formatearFechaHumana,
    obtenerFechaHoy,
    obtenerEmojiTurno,
    capitalizar
};
