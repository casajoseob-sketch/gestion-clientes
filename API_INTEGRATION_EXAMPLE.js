/**
 * EJEMPLO DE INTEGRACIÓN DE LA API
 *
 * Este archivo muestra cómo reemplazar localStorage con llamadas a la API
 * en el frontend HTML actual.
 *
 * Copiar y adaptar estas funciones en el archivo HTML original.
 */

// ===== CONFIGURACIÓN =====
const API_URL = process.env.API_URL || 'http://localhost:3001';

// ===== FUNCIONES DE API - RESERVAS =====

/**
 * Obtener todas las reservas (reemplaza obtenerReservas())
 */
async function obtenerReservasAPI(filtros = {}) {
  try {
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${API_URL}/api/reservas?${params}`);

    if (!response.ok) {
      throw new Error('Error al obtener reservas');
    }

    const reservas = await response.json();

    // Adaptar formato de la API al formato del frontend
    return reservas.map(r => ({
      id: r.id,
      fecha: r.fecha,
      turno: r.turno,
      hora: r.hora,
      mesa: r.mesa,
      mesasCombinadas: r.mesas_combinadas ? JSON.parse(r.mesas_combinadas) : null,
      nombre: r.nombre_cliente,
      telefono: r.telefono_cliente,
      pax: r.pax,
      notas: r.notas,
      estado: r.estado
    }));
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar las reservas');
    return [];
  }
}

/**
 * Crear nueva reserva (reemplaza agregarReserva())
 */
async function crearReservaAPI(reserva) {
  try {
    const response = await fetch(`${API_URL}/api/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fecha: reserva.fecha,
        turno: reserva.turno,
        hora: reserva.hora,
        mesa: reserva.mesa,
        mesasCombinadas: reserva.mesasCombinadas,
        nombreCliente: reserva.nombre,
        telefonoCliente: reserva.telefono,
        pax: reserva.pax,
        notas: reserva.notas
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear reserva');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    alert(error.message);
    throw error;
  }
}

/**
 * Eliminar reserva (reemplaza eliminarReserva())
 */
async function eliminarReservaAPI(id) {
  try {
    const response = await fetch(`${API_URL}/api/reservas/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Error al eliminar reserva');
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar la reserva');
    return false;
  }
}

/**
 * Actualizar estado de reserva (nuevo)
 */
async function actualizarEstadoReservaAPI(id, estado, datos = {}) {
  try {
    const response = await fetch(`${API_URL}/api/reservas/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        estado,
        ...datos
      })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar estado');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar el estado de la reserva');
    throw error;
  }
}

// ===== FUNCIONES DE API - CLIENTES =====

/**
 * Obtener todos los clientes
 */
async function obtenerClientesAPI(filtros = {}) {
  try {
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${API_URL}/api/clientes?${params}`);

    if (!response.ok) {
      throw new Error('Error al obtener clientes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

/**
 * Obtener estadísticas de un cliente
 */
async function obtenerEstadisticasClienteAPI(clienteId) {
  try {
    const response = await fetch(`${API_URL}/api/clientes/${clienteId}/estadisticas`);

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

/**
 * Obtener historial de reservas de un cliente
 */
async function obtenerHistorialClienteAPI(clienteId) {
  try {
    const response = await fetch(`${API_URL}/api/clientes/${clienteId}/reservas`);

    if (!response.ok) {
      throw new Error('Error al obtener historial');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// ===== FUNCIONES DE API - MESAS =====

/**
 * Obtener posiciones de mesas (reemplaza localStorage de posiciones)
 */
async function obtenerPosicionesMesasAPI() {
  try {
    const response = await fetch(`${API_URL}/api/mesas`);

    if (!response.ok) {
      throw new Error('Error al obtener posiciones');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

/**
 * Guardar posiciones de mesas (reemplaza localStorage)
 */
async function guardarPosicionesMesasAPI(posiciones) {
  try {
    const response = await fetch(`${API_URL}/api/mesas/actualizar-posiciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ posiciones })
    });

    if (!response.ok) {
      throw new Error('Error al guardar posiciones');
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar las posiciones de las mesas');
    return false;
  }
}

// ===== FUNCIONES DE API - ANALYTICS =====

/**
 * Obtener dashboard de analytics
 */
async function obtenerDashboardAPI(desde, hasta) {
  try {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);

    const response = await fetch(`${API_URL}/api/analytics/dashboard?${params}`);

    if (!response.ok) {
      throw new Error('Error al obtener dashboard');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

/**
 * Obtener tendencias
 */
async function obtenerTendenciasAPI(periodo = 'mes') {
  try {
    const response = await fetch(`${API_URL}/api/analytics/tendencias?periodo=${periodo}`);

    if (!response.ok) {
      throw new Error('Error al obtener tendencias');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

/**
 * Obtener ocupación de un día
 */
async function obtenerOcupacionAPI(fecha) {
  try {
    const response = await fetch(`${API_URL}/api/analytics/ocupacion?fecha=${fecha}`);

    if (!response.ok) {
      throw new Error('Error al obtener ocupación');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

/**
 * Obtener clientes VIP
 */
async function obtenerClientesVIPAPI() {
  try {
    const response = await fetch(`${API_URL}/api/analytics/clientes-vip`);

    if (!response.ok) {
      throw new Error('Error al obtener clientes VIP');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

/**
 * Obtener clientes poco fiables
 */
async function obtenerClientesPocoFiablesAPI() {
  try {
    const response = await fetch(`${API_URL}/api/analytics/clientes-poco-fiables`);

    if (!response.ok) {
      throw new Error('Error al obtener clientes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// ===== EJEMPLO DE USO EN EL HTML ACTUAL =====

/*
  PASO 1: Reemplazar funciones de localStorage

  ANTES:
  function obtenerReservas() {
    const reservas = localStorage.getItem('reservas');
    return reservas ? JSON.parse(reservas) : [];
  }

  DESPUÉS:
  async function obtenerReservas() {
    return await obtenerReservasAPI();
  }

  PASO 2: Actualizar funciones que usan obtenerReservas()

  ANTES:
  function renderGrid() {
    const fecha = document.getElementById('gridFecha').value;
    const reservas = obtenerReservas().filter(r => r.fecha === fecha);
    // ... resto del código
  }

  DESPUÉS:
  async function renderGrid() {
    const fecha = document.getElementById('gridFecha').value;
    const reservas = await obtenerReservasAPI({ fecha });
    // ... resto del código
  }

  PASO 3: Actualizar event handlers para usar async/await

  ANTES:
  function guardarReserva() {
    // validaciones...
    agregarReserva(reserva);
    renderGrid();
    renderPlano();
    renderLista();
  }

  DESPUÉS:
  async function guardarReserva() {
    // validaciones...
    try {
      await crearReservaAPI(reserva);
      await renderGrid();
      await renderPlano();
      await renderLista();
      alert('✅ Reserva guardada correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  }
*/

// ===== FUNCIÓN AUXILIAR: MANEJO DE ERRORES =====

/**
 * Wrapper para manejar errores de API de forma consistente
 */
async function llamarAPI(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

// ===== EXPORTAR FUNCIONES (si usas módulos) =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Reservas
    obtenerReservasAPI,
    crearReservaAPI,
    eliminarReservaAPI,
    actualizarEstadoReservaAPI,

    // Clientes
    obtenerClientesAPI,
    obtenerEstadisticasClienteAPI,
    obtenerHistorialClienteAPI,

    // Mesas
    obtenerPosicionesMesasAPI,
    guardarPosicionesMesasAPI,

    // Analytics
    obtenerDashboardAPI,
    obtenerTendenciasAPI,
    obtenerOcupacionAPI,
    obtenerClientesVIPAPI,
    obtenerClientesPocoFiablesAPI
  };
}
