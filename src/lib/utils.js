/**
 * Funciones utilidad
 */

import { CAPACIDAD_RECTANGULAR, CAPACIDAD_CIRCULAR, MESAS_RECTANGULARES } from './constants';

/**
 * Obtener la capacidad de una mesa
 */
export function obtenerCapacidadMesa(mesa) {
  const num = parseInt(mesa.substring(1));
  return num <= MESAS_RECTANGULARES ? CAPACIDAD_RECTANGULAR : CAPACIDAD_CIRCULAR;
}

/**
 * Formatear fecha a YYYY-MM-DD
 */
export function formatearFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtener fecha de hoy en formato YYYY-MM-DD
 */
export function obtenerFechaHoy() {
  return formatearFecha(new Date());
}

/**
 * Formatear fecha para mostrar (DD/MM/YYYY)
 */
export function formatearFechaHumana(fecha) {
  if (!fecha) return '';
  const [year, month, day] = fecha.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Verificar si una mesa es rectangular
 */
export function esMesaRectangular(mesa) {
  const num = parseInt(mesa.substring(1));
  return num <= MESAS_RECTANGULARES;
}

/**
 * Obtener tipo de mesa
 */
export function obtenerTipoMesa(mesa) {
  return esMesaRectangular(mesa) ? 'rectangular' : 'circular';
}

/**
 * Calcular capacidad total de mesas combinadas
 */
export function calcularCapacidadTotal(mesas) {
  if (!Array.isArray(mesas)) return 0;
  return mesas.reduce((total, mesa) => total + obtenerCapacidadMesa(mesa), 0);
}

/**
 * Generar ID único (timestamp)
 */
export function generarId() {
  return Date.now();
}

/**
 * Obtener emoji según turno
 */
export function obtenerEmojiTurno(turno) {
  return turno === 'comida' ? '🌅' : '🌙';
}

/**
 * Obtener color según clasificación de cliente
 */
export function obtenerColorClasificacion(clasificacion) {
  const colores = {
    vip: 'text-yellow-600 bg-yellow-50',
    standard: 'text-blue-600 bg-blue-50',
    poco_fiable: 'text-red-600 bg-red-50'
  };
  return colores[clasificacion] || colores.standard;
}

/**
 * Obtener icono según clasificación
 */
export function obtenerIconoClasificacion(clasificacion) {
  const iconos = {
    vip: '🏆',
    standard: '⭐',
    poco_fiable: '⚠️'
  };
  return iconos[clasificacion] || iconos.standard;
}

/**
 * Capitalizar primera letra
 */
export function capitalizar(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formatear número como moneda
 */
export function formatearMoneda(cantidad) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(cantidad);
}

/**
 * Formatear porcentaje
 */
export function formatearPorcentaje(valor) {
  return `${valor.toFixed(2)}%`;
}

/**
 * Validar email
 */
export function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validar teléfono español
 */
export function validarTelefono(telefono) {
  const re = /^[6-9]\d{8}$/;
  return re.test(telefono.replace(/\s/g, ''));
}

/**
 * Descargar JSON
 */
export function descargarJSON(data, filename) {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', filename);
  linkElement.click();
}

/**
 * Obtener estado con color
 */
export function obtenerEstadoConColor(estado) {
  const estados = {
    confirmada: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
    completada: { label: 'Completada', color: 'bg-green-100 text-green-800' },
    cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    no_show: { label: 'No Show', color: 'bg-orange-100 text-orange-800' }
  };
  return estados[estado] || estados.confirmada;
}
