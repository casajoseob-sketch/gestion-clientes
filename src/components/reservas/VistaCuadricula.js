import { useState, useEffect } from 'react';
import { reservasAPI } from '@/lib/api';
import { HORARIOS_COMIDA, HORARIOS_CENA, MESAS_TOTALES } from '@/lib/constants';
import { obtenerFechaHoy, obtenerEmojiTurno } from '@/lib/utils';
import ModalReserva from './ModalReserva';
import ModalInfoReserva from './ModalInfoReserva';

export default function VistaCuadricula() {
  const [fecha, setFecha] = useState(obtenerFechaHoy());
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalReserva, setModalReserva] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);

  useEffect(() => {
    cargarReservas();
  }, [fecha]);

  async function cargarReservas() {
    setLoading(true);
    try {
      const data = await reservasAPI.getAll({ fecha });
      setReservas(data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  }

  function obtenerReserva(turno, hora, mesa) {
    return reservas.find(r => {
      if (r.turno !== turno || r.hora !== hora) return false;

      // Verificar mesa principal
      if (r.mesa === mesa) return true;

      // Verificar mesas combinadas
      if (r.mesas_combinadas) {
        const mesasCombinadas = typeof r.mesas_combinadas === 'string'
          ? JSON.parse(r.mesas_combinadas)
          : r.mesas_combinadas;
        return mesasCombinadas.includes(mesa);
      }

      return false;
    });
  }

  function abrirModalReserva(fecha, turno, hora, mesa) {
    setModalReserva({ fecha, turno, hora, mesa });
  }

  function abrirModalInfo(reserva) {
    setModalInfo(reserva);
  }

  function renderCelda(turno, hora, mesa) {
    const reserva = obtenerReserva(turno, hora, mesa);

    if (reserva) {
      const esCombinada = reserva.mesa !== mesa;
      const nombreCorto = reserva.nombre_cliente.split(' ')[0];

      return (
        <td
          key={mesa}
          className={esCombinada ? 'grid-cell-combinada' : 'grid-cell-reservada'}
          onClick={() => abrirModalInfo(reserva)}
        >
          {nombreCorto}
        </td>
      );
    }

    return (
      <td
        key={mesa}
        className="grid-cell grid-cell-disponible"
        onClick={() => abrirModalReserva(fecha, turno, hora, mesa)}
      >
        +
      </td>
    );
  }

  function renderFila(turno, hora, colorFondo) {
    const celdas = [];
    for (let i = 1; i <= MESAS_TOTALES; i++) {
      celdas.push(renderCelda(turno, hora, `M${i}`));
    }

    return (
      <tr key={`${turno}-${hora}`} className={colorFondo}>
        <td className="border-2 border-gray-300 px-4 py-3 font-semibold bg-secondary text-white whitespace-nowrap">
          {hora} {obtenerEmojiTurno(turno)}
        </td>
        {celdas}
      </tr>
    );
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
      {/* Controles */}
      <div className="mb-6 flex items-center space-x-4">
        <label className="font-semibold text-gray-700">📅 Fecha:</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="input max-w-xs"
        />
        <button
          onClick={() => setFecha(obtenerFechaHoy())}
          className="btn btn-ghost text-sm"
        >
          Hoy
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-primary text-white px-4 py-3 sticky left-0 z-10">
                Hora / Mesa
              </th>
              {Array.from({ length: MESAS_TOTALES }, (_, i) => (
                <th key={i + 1} className="bg-primary text-white px-4 py-3">
                  M{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Horarios de Comida */}
            {HORARIOS_COMIDA.map(hora => renderFila('comida', hora, 'bg-blue-50'))}

            {/* Separador */}
            <tr>
              <td colSpan={MESAS_TOTALES + 1} className="h-2 bg-gray-300"></td>
            </tr>

            {/* Horarios de Cena */}
            {HORARIOS_CENA.map(hora => renderFila('cena', hora, 'bg-yellow-50'))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-white border-2 border-gray-300 mr-2"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-red-50 border-2 border-red-200 mr-2"></div>
          <span>Reservada</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-green-50 border-2 border-green-400 border-dashed mr-2"></div>
          <span>Combinada</span>
        </div>
      </div>

      {/* Modales */}
      {modalReserva && (
        <ModalReserva
          datos={modalReserva}
          onClose={() => setModalReserva(null)}
          onSave={() => {
            setModalReserva(null);
            cargarReservas();
          }}
        />
      )}

      {modalInfo && (
        <ModalInfoReserva
          reserva={modalInfo}
          onClose={() => setModalInfo(null)}
          onUpdate={cargarReservas}
        />
      )}
    </div>
  );
}
