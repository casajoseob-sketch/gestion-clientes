import { useState } from 'react';
import { reservasAPI } from '@/lib/api';
import { obtenerEmojiTurno, capitalizar, obtenerEstadoConColor } from '@/lib/utils';

export default function ModalInfoReserva({ reserva, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [estado, setEstado] = useState(reserva.estado);
  const [importeTotal, setImporteTotal] = useState(reserva.importe_total || '');
  const [importePorComensal, setImportePorComensal] = useState(reserva.importe_por_comensal || '');

  const mesasCombinadas = reserva.mesas_combinadas
    ? (typeof reserva.mesas_combinadas === 'string'
        ? JSON.parse(reserva.mesas_combinadas)
        : reserva.mesas_combinadas)
    : null;

  const mesasTexto = mesasCombinadas
    ? mesasCombinadas.join(', ')
    : reserva.mesa;

  async function handleEliminar() {
    if (!confirm(`¿Está seguro de eliminar la reserva de ${reserva.nombre_cliente}?`)) {
      return;
    }

    setLoading(true);
    try {
      await reservasAPI.delete(reserva.id);
      onUpdate && onUpdate();
      onClose();
      mostrarToast('🗑️ Reserva eliminada correctamente', 'success');
    } catch (error) {
      mostrarToast('Error al eliminar la reserva', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCambiarEstado() {
    setLoading(true);
    try {
      const datos = {};

      if (estado === 'completada' && (importeTotal || importePorComensal)) {
        datos.importeTotal = parseFloat(importeTotal);
        datos.importePorComensal = parseFloat(importePorComensal);
      }

      await reservasAPI.cambiarEstado(reserva.id, estado, datos);
      onUpdate && onUpdate();
      setModoEditar(false);
      mostrarToast('✅ Estado actualizado correctamente', 'success');
    } catch (error) {
      mostrarToast('Error al actualizar el estado', 'error');
    } finally {
      setLoading(false);
    }
  }

  function mostrarToast(mensaje, tipo) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  const estadoInfo = obtenerEstadoConColor(reserva.estado);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-primary">
            ℹ️ Información de Reserva
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-accent text-white hover:bg-opacity-80"
          >
            ×
          </button>
        </div>

        {/* Información */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-semibold">📅 {reserva.fecha}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Turno</p>
                <p className="font-semibold">
                  {obtenerEmojiTurno(reserva.turno)} {capitalizar(reserva.turno)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hora</p>
                <p className="font-semibold">🕐 {reserva.hora}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mesa(s)</p>
                <p className="font-semibold">🪑 {mesasTexto}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold">👤 {reserva.nombre_cliente}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-semibold">📞 {reserva.telefono_cliente}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Comensales</p>
                <p className="font-semibold">👥 {reserva.pax} personas</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span className={`badge ${estadoInfo.color}`}>
                  {estadoInfo.label}
                </span>
              </div>
            </div>

            {reserva.notas && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Notas</p>
                <p className="mt-1 text-gray-800">📝 {reserva.notas}</p>
              </div>
            )}
          </div>

          {/* Modo Edición de Estado */}
          {modoEditar ? (
            <div className="bg-yellow-50 p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Estado</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="input"
                >
                  <option value="confirmada">Confirmada</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              {estado === 'completada' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Importe Total (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={importeTotal}
                      onChange={(e) => setImporteTotal(e.target.value)}
                      className="input"
                      placeholder="50.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Importe por Comensal (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={importePorComensal}
                      onChange={(e) => setImportePorComensal(e.target.value)}
                      className="input"
                      placeholder="12.50"
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handleCambiarEstado}
                  className="btn btn-success flex-1"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : '✓ Guardar'}
                </button>
                <button
                  onClick={() => {
                    setModoEditar(false);
                    setEstado(reserva.estado);
                  }}
                  className="btn btn-ghost flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setModoEditar(true)}
              className="w-full btn btn-warning"
            >
              ✏️ Cambiar Estado
            </button>
          )}
        </div>

        {/* Botones */}
        <div className="mt-6 pt-4 border-t flex justify-between">
          <button
            onClick={handleEliminar}
            className="btn btn-danger"
            disabled={loading}
          >
            🗑️ Eliminar
          </button>
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
