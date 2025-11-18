import { useState, useEffect } from 'react';
import { reservasAPI, mesasAPI } from '@/lib/api';
import { obtenerCapacidadMesa, calcularCapacidadTotal } from '@/lib/utils';
import { MESAS_TOTALES } from '@/lib/constants';

export default function ModalReserva({ datos, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    pax: '',
    notas: '',
    combinarMesas: false,
    mesasAdicionales: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mesasDisponibles, setMesasDisponibles] = useState([]);

  useEffect(() => {
    if (formData.combinarMesas) {
      cargarMesasDisponibles();
    }
  }, [formData.combinarMesas]);

  async function cargarMesasDisponibles() {
    try {
      const todasReservas = await reservasAPI.getAll({
        fecha: datos.fecha,
        turno: datos.turno
      });

      const mesasOcupadas = new Set();
      todasReservas.forEach(r => {
        if (r.hora === datos.hora) {
          mesasOcupadas.add(r.mesa);
          if (r.mesas_combinadas) {
            JSON.parse(r.mesas_combinadas).forEach(m => mesasOcupadas.add(m));
          }
        }
      });

      const disponibles = [];
      for (let i = 1; i <= MESAS_TOTALES; i++) {
        const mesa = `M${i}`;
        if (mesa !== datos.mesa && !mesasOcupadas.has(mesa)) {
          disponibles.push(mesa);
        }
      }

      setMesasDisponibles(disponibles);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function toggleMesaAdicional(mesa) {
    setFormData(prev => {
      const mesasAdicionales = prev.mesasAdicionales.includes(mesa)
        ? prev.mesasAdicionales.filter(m => m !== mesa)
        : [...prev.mesasAdicionales, mesa];
      return { ...prev, mesasAdicionales };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nombre || !formData.telefono || !formData.pax) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    const pax = parseInt(formData.pax);
    const capacidadPrincipal = obtenerCapacidadMesa(datos.mesa);

    // Validar combinación de mesas
    let mesasCombinadas = null;
    let capacidadTotal = capacidadPrincipal;

    if (formData.combinarMesas) {
      if (formData.mesasAdicionales.length === 0) {
        setError('Debe seleccionar al menos una mesa adicional');
        return;
      }
      mesasCombinadas = [datos.mesa, ...formData.mesasAdicionales];
      capacidadTotal = calcularCapacidadTotal(mesasCombinadas);
    }

    if (pax > capacidadTotal) {
      setError(`La capacidad total es de ${capacidadTotal} personas`);
      return;
    }

    setLoading(true);

    try {
      await reservasAPI.create({
        fecha: datos.fecha,
        turno: datos.turno,
        hora: datos.hora,
        mesa: datos.mesa,
        mesasCombinadas,
        nombreCliente: formData.nombre,
        telefonoCliente: formData.telefono,
        pax,
        notas: formData.notas
      });

      onSave && onSave();
      onClose();

      // Toast notification
      mostrarToast('✅ Reserva creada correctamente', 'success');
    } catch (error) {
      setError(error.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  }

  function mostrarToast(mensaje, tipo) {
    // Implementación simple de toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-primary">
            📝 Nueva Reserva - {datos.mesa}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-accent text-white hover:bg-opacity-80"
          >
            ×
          </button>
        </div>

        {/* Info de la reserva */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm">
            <strong>Fecha:</strong> {datos.fecha} | <strong>Turno:</strong> {datos.turno} | <strong>Hora:</strong> {datos.hora}
          </p>
          <p className="text-sm mt-1">
            <strong>Capacidad mesa {datos.mesa}:</strong> {obtenerCapacidadMesa(datos.mesa)} personas
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">Nombre del Cliente *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="input"
              placeholder="600111222"
              required
            />
          </div>

          {/* PAX */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">Número de Comensales (PAX) *</label>
            <input
              type="number"
              name="pax"
              value={formData.pax}
              onChange={handleChange}
              className="input"
              min="1"
              required
            />
          </div>

          {/* Combinar Mesas */}
          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="combinarMesas"
                checked={formData.combinarMesas}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="font-semibold">Combinar mesas</span>
            </label>
          </div>

          {/* Mesas Adicionales */}
          {formData.combinarMesas && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <label className="block font-semibold mb-2">Mesas Adicionales</label>
              <div className="grid grid-cols-5 gap-2">
                {mesasDisponibles.map(mesa => (
                  <button
                    key={mesa}
                    type="button"
                    onClick={() => toggleMesaAdicional(mesa)}
                    className={`px-3 py-2 rounded border-2 transition-all ${
                      formData.mesasAdicionales.includes(mesa)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-gray-300 hover:border-primary'
                    }`}
                  >
                    {mesa}
                  </button>
                ))}
              </div>
              {formData.mesasAdicionales.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  Capacidad total: {calcularCapacidadTotal([datos.mesa, ...formData.mesasAdicionales])} personas
                </p>
              )}
            </div>
          )}

          {/* Notas */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Notas Adicionales</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              className="input resize-none"
              rows="3"
              placeholder="Alergias, preferencias, cumpleaños..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : '💾 Guardar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
