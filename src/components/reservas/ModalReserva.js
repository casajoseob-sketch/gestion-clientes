import { useState, useEffect, useCallback, useMemo } from 'react';
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
    cargarMesasDisponibles();
  }, []);

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
            const mesas = typeof r.mesas_combinadas === 'string'
              ? JSON.parse(r.mesas_combinadas)
              : r.mesas_combinadas;
            mesas.forEach(m => mesasOcupadas.add(m));
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
      // En caso de error, mostrar todas las mesas excepto la actual
      const todasMesas = [];
      for (let i = 1; i <= MESAS_TOTALES; i++) {
        const mesa = `M${i}`;
        if (mesa !== datos.mesa) {
          todasMesas.push(mesa);
        }
      }
      setMesasDisponibles(todasMesas);
    }
  }

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const toggleMesaAdicional = useCallback((mesa) => {
    setFormData(prev => {
      const mesasAdicionales = prev.mesasAdicionales.includes(mesa)
        ? prev.mesasAdicionales.filter(m => m !== mesa)
        : [...prev.mesasAdicionales, mesa];
      return { ...prev, mesasAdicionales };
    });
  }, []);

  const capacidadMesaPrincipal = useMemo(() =>
    obtenerCapacidadMesa(datos.mesa),
    [datos.mesa]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nombre || !formData.telefono || !formData.pax) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    const pax = parseInt(formData.pax);
    const capacidadPrincipal = capacidadMesaPrincipal;

    // Validar combinación de mesas
    let mesasCombinadas = null;
    let capacidadTotal = capacidadPrincipal;

    if (formData.mesasAdicionales.length > 0) {
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

          {/* Combinar Mesas - Checkbox */}
          <div className="mb-4">
            <label className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
              <input
                type="checkbox"
                name="combinarMesas"
                checked={formData.combinarMesas}
                onChange={handleChange}
                className="w-5 h-5 cursor-pointer"
              />
              <div className="flex-1">
                <span className="font-semibold text-lg">🔗 Combinar con otras mesas</span>
                <p className="text-sm text-gray-600 mt-1">
                  Para grupos grandes, selecciona mesas adicionales
                </p>
              </div>
            </label>
          </div>

          {/* Selector de Mesas - Solo visible si checkbox activado */}
          {formData.combinarMesas && (
            <div className="mb-4 p-5 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border-3 border-orange-400 shadow-md animate-fade-in">
              <div className="mb-4">
                <h3 className="font-bold text-xl mb-2 text-gray-900 flex items-center">
                  <span className="text-3xl mr-2">🪑</span>
                  Selecciona las mesas a combinar
                </h3>
                <p className="text-sm text-gray-700">
                  <strong className="text-orange-600">Mesa principal: {datos.mesa}</strong> (capacidad: {capacidadMesaPrincipal} personas)
                </p>
              </div>

              {mesasDisponibles.length === 0 ? (
                <div className="text-center py-6 bg-white rounded-lg border-2 border-gray-200">
                  <p className="text-gray-500 text-lg">⚠️ No hay otras mesas disponibles</p>
                  <p className="text-sm text-gray-400 mt-1">en este horario para combinar</p>
                </div>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-lg border-2 border-orange-300 mb-4">
                    <p className="font-semibold text-gray-800 mb-2 text-base">
                      👉 Haz CLICK en las mesas que quieres JUNTAR con {datos.mesa}:
                    </p>
                    <p className="text-xs text-gray-600">
                      (Puedes seleccionar varias. Las mesas naranjas están seleccionadas)
                    </p>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 mb-4">
                    {mesasDisponibles.map(mesa => {
                      const capacidad = obtenerCapacidadMesa(mesa);
                      const seleccionada = formData.mesasAdicionales.includes(mesa);

                      return (
                        <button
                          key={mesa}
                          type="button"
                          onClick={() => toggleMesaAdicional(mesa)}
                          className={`p-4 rounded-xl border-3 transition-all font-bold text-center shadow-md hover:shadow-xl ${
                            seleccionada
                              ? 'bg-orange-500 text-white border-orange-700 shadow-lg scale-110 ring-4 ring-orange-200'
                              : 'bg-white border-gray-300 hover:border-orange-400 hover:scale-105'
                          }`}
                        >
                          <div className="text-lg font-black">{mesa}</div>
                          <div className="text-sm mt-1 opacity-90">{capacidad} pers.</div>
                        </button>
                      );
                    })}
                  </div>

                  {formData.mesasAdicionales.length > 0 ? (
                    <div className="bg-green-50 p-5 rounded-lg border-3 border-green-400 shadow-lg">
                      <div className="text-center">
                        <div className="text-2xl mb-2">✅</div>
                        <p className="font-black text-green-800 text-xl mb-2">
                          MESAS COMBINADAS
                        </p>
                        <p className="font-bold text-gray-700 text-lg mb-3">
                          {datos.mesa} + {formData.mesasAdicionales.join(' + ')}
                        </p>
                        <div className="bg-white p-3 rounded-lg inline-block">
                          <p className="text-sm text-gray-600">Capacidad Total:</p>
                          <p className="text-3xl font-black text-green-600">
                            {calcularCapacidadTotal([datos.mesa, ...formData.mesasAdicionales])}
                          </p>
                          <p className="text-sm text-gray-600">personas</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 text-center">
                      <p className="text-gray-600 text-sm">
                        💡 <strong>Selecciona al menos una mesa adicional</strong>
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Haz click en los botones de arriba
                      </p>
                    </div>
                  )}
                </>
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
