/**
 * Cliente API para comunicación con el backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';

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

// ===== RESERVAS =====

export const reservasAPI = {
  /**
   * Obtener todas las reservas con filtros opcionales
   */
  async getAll(filtros = {}) {
    const params = new URLSearchParams(filtros);
    return fetchAPI(`/api/reservas?${params}`);
  },

  /**
   * Obtener una reserva por ID
   */
  async getById(id) {
    return fetchAPI(`/api/reservas/${id}`);
  },

  /**
   * Crear nueva reserva
   */
  async create(reserva) {
    return fetchAPI('/api/reservas', {
      method: 'POST',
      body: JSON.stringify(reserva),
    });
  },

  /**
   * Actualizar reserva
   */
  async update(id, datos) {
    return fetchAPI(`/api/reservas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  },

  /**
   * Cambiar estado de reserva
   */
  async cambiarEstado(id, estado, datos = {}) {
    return fetchAPI(`/api/reservas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado, ...datos }),
    });
  },

  /**
   * Eliminar reserva
   */
  async delete(id) {
    return fetchAPI(`/api/reservas/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== CLIENTES =====

export const clientesAPI = {
  /**
   * Obtener todos los clientes
   */
  async getAll(filtros = {}) {
    const params = new URLSearchParams(filtros);
    return fetchAPI(`/api/clientes?${params}`);
  },

  /**
   * Obtener un cliente por ID
   */
  async getById(id) {
    return fetchAPI(`/api/clientes/${id}`);
  },

  /**
   * Obtener reservas de un cliente
   */
  async getReservas(id, params = {}) {
    const query = new URLSearchParams(params);
    return fetchAPI(`/api/clientes/${id}/reservas?${query}`);
  },

  /**
   * Obtener estadísticas de un cliente
   */
  async getEstadisticas(id) {
    return fetchAPI(`/api/clientes/${id}/estadisticas`);
  },

  /**
   * Obtener historial de clasificación
   */
  async getHistorialClasificacion(id) {
    return fetchAPI(`/api/clientes/${id}/historial-clasificacion`);
  },

  /**
   * Crear nuevo cliente
   */
  async create(cliente) {
    return fetchAPI('/api/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  },

  /**
   * Actualizar cliente
   */
  async update(id, datos) {
    return fetchAPI(`/api/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  },

  /**
   * Actualizar clasificación
   */
  async actualizarClasificacion(id, clasificacion, razon) {
    return fetchAPI(`/api/clientes/${id}/clasificacion`, {
      method: 'PATCH',
      body: JSON.stringify({ clasificacion, razon }),
    });
  },

  /**
   * Recalcular estadísticas
   */
  async recalcular(id) {
    return fetchAPI(`/api/clientes/${id}/recalcular`, {
      method: 'POST',
    });
  },

  /**
   * Eliminar cliente
   */
  async delete(id) {
    return fetchAPI(`/api/clientes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== MESAS =====

export const mesasAPI = {
  /**
   * Obtener todas las posiciones de mesas
   */
  async getAll() {
    return fetchAPI('/api/mesas');
  },

  /**
   * Actualizar posición de una mesa
   */
  async updatePosicion(mesa, x, y) {
    return fetchAPI(`/api/mesas/${mesa}`, {
      method: 'PUT',
      body: JSON.stringify({ x, y }),
    });
  },

  /**
   * Actualizar múltiples posiciones
   */
  async updatePosiciones(posiciones) {
    return fetchAPI('/api/mesas/actualizar-posiciones', {
      method: 'POST',
      body: JSON.stringify({ posiciones }),
    });
  },

  /**
   * Restablecer posiciones
   */
  async restablecer() {
    return fetchAPI('/api/mesas/restablecer', {
      method: 'POST',
    });
  },
};

// ===== ANALYTICS =====

export const analyticsAPI = {
  /**
   * Obtener dashboard general
   */
  async getDashboard(desde, hasta) {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    return fetchAPI(`/api/analytics/dashboard?${params}`);
  },

  /**
   * Obtener tendencias
   */
  async getTendencias(periodo = 'mes') {
    return fetchAPI(`/api/analytics/tendencias?periodo=${periodo}`);
  },

  /**
   * Obtener análisis de ocupación
   */
  async getOcupacion(fecha) {
    return fetchAPI(`/api/analytics/ocupacion?fecha=${fecha}`);
  },

  /**
   * Obtener clientes VIP
   */
  async getClientesVIP() {
    return fetchAPI('/api/analytics/clientes-vip');
  },

  /**
   * Obtener clientes poco fiables
   */
  async getClientesPocoFiables() {
    return fetchAPI('/api/analytics/clientes-poco-fiables');
  },

  /**
   * Obtener reporte de ingresos
   */
  async getIngresos(desde, hasta, agrupar = 'mes') {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    params.append('agrupar', agrupar);
    return fetchAPI(`/api/analytics/ingresos?${params}`);
  },
};

export default {
  reservas: reservasAPI,
  clientes: clientesAPI,
  mesas: mesasAPI,
  analytics: analyticsAPI,
};
