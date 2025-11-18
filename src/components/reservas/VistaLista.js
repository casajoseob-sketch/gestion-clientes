import { useState, useEffect } from 'react';
import { reservasAPI } from '@/lib/api';
import { MESAS_TOTALES } from '@/lib/constants';
import {
  obtenerEmojiTurno,
  capitalizar,
  formatearFechaHumana,
  obtenerEstadoConColor
} from '@/lib/utils';
import ModalInfoReserva from './ModalInfoReserva';

export default function VistaLista() {
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    buscar: '',
    fecha: '',
    mesa: ''
  });
  const [modalInfo, setModalInfo] = useState(null);

  useEffect(() => {
    cargarReservas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, reservas]);

  async function cargarReservas() {
    setLoading(true);
    try {
      const data = await reservasAPI.getAll();
      setReservas(data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltros() {
    let filtradas = [...reservas];

    // Filtro de búsqueda
    if (filtros.buscar) {
      const busqueda = filtros.buscar.toLowerCase();
      filtradas = filtradas.filter(r =>
        r.nombre_cliente.toLowerCase().includes(busqueda) ||
        r.telefono_cliente.includes(busqueda)
      );
    }

    // Filtro de fecha
    if (filtros.fecha) {
      filtradas = filtradas.filter(r => r.fecha === filtros.fecha);
    }

    // Filtro de mesa
    if (filtros.mesa) {
      filtradas = filtradas.filter(r => {
        if (r.mesa === filtros.mesa) return true;
        if (r.mesas_combinadas) {
          const mesas = typeof r.mesas_combinadas === 'string'
            ? JSON.parse(r.mesas_combinadas)
            : r.mesas_combinadas;
          return mesas.includes(filtros.mesa);
        }
        return false;
      });
    }

    // Ordenar por fecha y hora
    filtradas.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`);
      const fechaB = new Date(`${b.fecha}T${b.hora}`);
      return fechaB - fechaA; // Más recientes primero
    });

    setReservasFiltradas(filtradas);
  }

  function handleFiltroChange(campo, valor) {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }

  async function handleEliminar(id, nombre) {
    if (!confirm(`¿Está seguro de eliminar la reserva de ${nombre}?`)) {
      return;
    }

    try {
      await reservasAPI.delete(id);
      cargarReservas();
      mostrarToast('🗑️ Reserva eliminada correctamente', 'success');
    } catch (error) {
      mostrarToast('Error al eliminar la reserva', 'error');
    }
  }

  function mostrarToast(mensaje, tipo) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Cargando reservas...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            🔍 Buscar por nombre o teléfono
          </label>
          <input
            type="text"
            value={filtros.buscar}
            onChange={(e) => handleFiltroChange('buscar', e.target.value)}
            placeholder="Juan, 600111222..."
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            📅 Filtrar por fecha
          </label>
          <input
            type="date"
            value={filtros.fecha}
            onChange={(e) => handleFiltroChange('fecha', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            🪑 Filtrar por mesa
          </label>
          <select
            value={filtros.mesa}
            onChange={(e) => handleFiltroChange('mesa', e.target.value)}
            className="input"
          >
            <option value="">Todas las mesas</option>
            {Array.from({ length: MESAS_TOTALES }, (_, i) => (
              <option key={i + 1} value={`M${i + 1}`}>
                M{i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Reservas</p>
          <p className="text-2xl font-bold text-blue-600">{reservas.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Confirmadas</p>
          <p className="text-2xl font-bold text-green-600">
            {reservas.filter(r => r.estado === 'confirmada').length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Completadas</p>
          <p className="text-2xl font-bold text-purple-600">
            {reservas.filter(r => r.estado === 'completada').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Canceladas</p>
          <p className="text-2xl font-bold text-red-600">
            {reservas.filter(r => r.estado === 'cancelada' || r.estado === 'no_show').length}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Turno</th>
              <th>Hora</th>
              <th>Mesa(s)</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>PAX</th>
              <th>Estado</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-8 text-gray-500">
                  No se encontraron reservas
                </td>
              </tr>
            ) : (
              reservasFiltradas.map((reserva) => {
                const mesasCombinadas = reserva.mesas_combinadas
                  ? (typeof reserva.mesas_combinadas === 'string'
                      ? JSON.parse(reserva.mesas_combinadas)
                      : reserva.mesas_combinadas)
                  : null;

                const mesasTexto = mesasCombinadas
                  ? mesasCombinadas.join(', ')
                  : reserva.mesa;

                const estadoInfo = obtenerEstadoConColor(reserva.estado);

                return (
                  <tr key={reserva.id} className="hover:bg-gray-50">
                    <td>{formatearFechaHumana(reserva.fecha)}</td>
                    <td>
                      {obtenerEmojiTurno(reserva.turno)} {capitalizar(reserva.turno)}
                    </td>
                    <td className="font-mono">{reserva.hora}</td>
                    <td className="font-semibold">{mesasTexto}</td>
                    <td>{reserva.nombre_cliente}</td>
                    <td className="font-mono text-sm">{reserva.telefono_cliente}</td>
                    <td className="font-semibold text-center">{reserva.pax}</td>
                    <td>
                      <span className={`badge ${estadoInfo.color}`}>
                        {estadoInfo.label}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600 max-w-xs truncate">
                      {reserva.notas || '-'}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setModalInfo(reserva)}
                          className="btn btn-primary text-xs px-2 py-1"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEliminar(reserva.id, reserva.nombre_cliente)}
                          className="btn btn-danger text-xs px-2 py-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalInfo && (
        <ModalInfoReserva
          reserva={modalInfo}
          onClose={() => setModalInfo(null)}
          onUpdate={() => {
            setModalInfo(null);
            cargarReservas();
          }}
        />
      )}
    </div>
  );
}
