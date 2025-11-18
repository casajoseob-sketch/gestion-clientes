/**
 * Constantes de la aplicación
 */

export const MESAS_TOTALES = 20;
export const MESAS_RECTANGULARES = 13; // M1-M13
export const MESAS_CIRCULARES = 7; // M14-M20
export const CAPACIDAD_RECTANGULAR = 4;
export const CAPACIDAD_CIRCULAR = 6;
export const PIN_EDICION = "1234";

export const HORARIOS_COMIDA = [
  "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30"
];

export const HORARIOS_CENA = [
  "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30", "23:00", "23:30"
];

export const TURNOS = {
  COMIDA: 'comida',
  CENA: 'cena'
};

export const ESTADOS_RESERVA = {
  CONFIRMADA: 'confirmada',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
  NO_SHOW: 'no_show'
};

export const CLASIFICACIONES_CLIENTE = {
  VIP: 'vip',
  STANDARD: 'standard',
  POCO_FIABLE: 'poco_fiable'
};

export const COLORES = {
  primary: '#0fb9b1',
  secondary: '#c19031',
  accent: '#e74c3c',
  warning: '#f39c12',
  success: '#2ecc71',
};

export const TIPO_MESA = {
  RECTANGULAR: 'rectangular',
  CIRCULAR: 'circular'
};
