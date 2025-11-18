import { useState, useEffect } from 'react';
import { reservasAPI, mesasAPI } from '@/lib/api';
import { obtenerFechaHoy, obtenerTipoMesa } from '@/lib/utils';
import ModalReserva from './ModalReserva';
import ModalInfoReserva from './ModalInfoReserva';

export default function VistaPlano() {
  const [fecha, setFecha] = useState(obtenerFechaHoy());
  const [turno, setTurno] = useState('comida');
  const [reservas, setReservas] = useState([]);
  const [posiciones, setPosiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalReserva, setModalReserva] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [fecha, turno]);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [reservasData, posicionesData] = await Promise.all([
        reservasAPI.getAll({ fecha, turno }),
        mesasAPI.getAll()
      ]);
      setReservas(reservasData);
      setPosiciones(posicionesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  }

  function obtenerEstadoMesa(mesa) {
    const reserva = reservas.find(r => {
      if (r.mesa === mesa) return true;
      if (r.mesas_combinadas) {
        const mesas = typeof r.mesas_combinadas === 'string'
          ? JSON.parse(r.mesas_combinadas)
          : r.mesas_combinadas;
        return mesas.includes(mesa);
      }
      return false;
    });

    if (!reserva) return { estado: 'disponible', reserva: null, mesasCombinadas: null };

    const esMesaPrincipal = reserva.mesa === mesa;
    const tieneCombinacion = reserva.mesas_combinadas && reserva.mesas_combinadas.length > 1;

    let mesasCombinadas = null;
    if (tieneCombinacion) {
      mesasCombinadas = typeof reserva.mesas_combinadas === 'string'
        ? JSON.parse(reserva.mesas_combinadas)
        : reserva.mesas_combinadas;
    }

    return {
      estado: !esMesaPrincipal && tieneCombinacion ? 'combinada' : 'reservada',
      reserva,
      mesasCombinadas,
      esMesaPrincipal
    };
  }

  function handleClickMesa(mesa, estado, reserva) {
    if (reserva) {
      setModalInfo(reserva);
    } else {
      // Buscar primera hora disponible
      const horarios = turno === 'comida'
        ? ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]
        : ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];

      // Por simplicidad, usar la primera hora
      const hora = horarios[0];
      setModalReserva({ fecha, turno, hora, mesa });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Cargando plano...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Controles */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">📅 Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">🍴 Turno:</label>
          <select
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            className="input"
          >
            <option value="comida">Comida 🌅</option>
            <option value="cena">Cena 🌙</option>
          </select>
        </div>
      </div>

      {/* Info */}
      <div className="mb-4 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          💡 <strong>Click en una mesa</strong> para ver detalles o crear una reserva
        </p>
      </div>

      {/* Plano */}
      <div className="bg-white rounded-lg shadow-lg p-8 overflow-x-auto">
        <div
          className="relative"
          style={{
            width: '1600px',
            height: '1200px',
            backgroundImage: 'repeating-linear-gradient(0deg, #f0f0f0 0px, #f0f0f0 1px, transparent 1px, transparent 50px), repeating-linear-gradient(90deg, #f0f0f0 0px, #f0f0f0 1px, transparent 1px, transparent 50px)'
          }}
        >
          {posiciones.map((pos) => {
            const { estado, reserva, mesasCombinadas, esMesaPrincipal } = obtenerEstadoMesa(pos.mesa);

            const esRectangular = pos.tipo === 'rectangular';
            const width = esRectangular ? 100 : 80;
            const height = esRectangular ? 60 : 80;

            const claseEstado = {
              disponible: 'bg-green-100 border-green-500 hover:bg-green-200',
              reservada: mesasCombinadas ? 'bg-orange-100 border-orange-500' : 'bg-red-100 border-red-500',
              combinada: 'bg-yellow-100 border-yellow-500 border-dashed'
            }[estado];

            return (
              <div
                key={pos.mesa}
                onClick={() => handleClickMesa(pos.mesa, estado, reserva)}
                className={`
                  absolute flex items-center justify-center font-semibold
                  border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg
                  ${claseEstado}
                  ${esRectangular ? 'rounded-lg' : 'rounded-full'}
                `}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                }}
              >
                <div className="text-center text-sm">
                  {/* Mesa principal con combinación */}
                  {esMesaPrincipal && mesasCombinadas ? (
                    <>
                      <div className="font-bold text-xs">{mesasCombinadas.join('+')}</div>
                      <div className="text-xs mt-1">
                        {reserva.nombre_cliente.split(' ')[0]}
                      </div>
                    </>
                  ) : estado === 'combinada' && reserva ? (
                    /* Mesa secundaria combinada */
                    <>
                      <div className="font-bold">{pos.mesa}</div>
                      <div className="text-xs mt-1">→ {reserva.mesa}</div>
                    </>
                  ) : (
                    /* Mesa normal */
                    <>
                      <div className="font-bold">{pos.mesa}</div>
                      {reserva && (
                        <div className="text-xs mt-1">
                          {reserva.nombre_cliente.split(' ')[0]}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded mr-2"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-red-100 border-2 border-red-500 rounded mr-2"></div>
          <span>Reservada</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-orange-100 border-2 border-orange-500 rounded mr-2"></div>
          <span>Combinada (Principal)</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-500 border-dashed rounded mr-2"></div>
          <span>Combinada (Secundaria)</span>
        </div>
      </div>

      {/* Modales */}
      {modalReserva && (
        <ModalReserva
          datos={modalReserva}
          onClose={() => setModalReserva(null)}
          onSave={() => {
            setModalReserva(null);
            cargarDatos();
          }}
        />
      )}

      {modalInfo && (
        <ModalInfoReserva
          reserva={modalInfo}
          onClose={() => setModalInfo(null)}
          onUpdate={cargarDatos}
        />
      )}
    </div>
  );
}
