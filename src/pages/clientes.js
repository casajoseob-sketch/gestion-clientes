import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { clientesAPI } from '@/lib/api';
import {
  obtenerIconoClasificacion,
  obtenerColorClasificacion,
  formatearMoneda,
  formatearFechaHumana,
  capitalizar
} from '@/lib/utils';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    buscar: '',
    clasificacion: '',
    ordenar: 'nombre'
  });

  useEffect(() => {
    cargarClientes();
  }, [filtros.clasificacion, filtros.ordenar]);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros.buscar, clientes]);

  async function cargarClientes() {
    setLoading(true);
    try {
      const params = {};
      if (filtros.clasificacion) params.clasificacion = filtros.clasificacion;
      if (filtros.ordenar) params.ordenar = filtros.ordenar;

      const data = await clientesAPI.getAll(params);
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltros() {
    let filtrados = [...clientes];

    if (filtros.buscar) {
      const busqueda = filtros.buscar.toLowerCase();
      filtrados = filtrados.filter(c =>
        c.nombre.toLowerCase().includes(busqueda) ||
        c.telefono.includes(busqueda)
      );
    }

    setClientesFiltrados(filtrados);
  }

  function handleFiltroChange(campo, valor) {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Cargando clientes...</span>
        </div>
      </Layout>
    );
  }

  const estadisticas = {
    total: clientes.length,
    vip: clientes.filter(c => c.clasificacion === 'vip').length,
    standard: clientes.filter(c => c.clasificacion === 'standard').length,
    poco_fiable: clientes.filter(c => c.clasificacion === 'poco_fiable').length
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            👥 Gestión de Clientes
          </h2>
          <p className="text-gray-600 mt-1">
            Visualiza y gestiona tus clientes con clasificación automática
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-sm opacity-90">Total Clientes</div>
            <div className="text-3xl font-bold mt-2">{estadisticas.total}</div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="text-sm opacity-90">🏆 VIP</div>
            <div className="text-3xl font-bold mt-2">{estadisticas.vip}</div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-sm opacity-90">⭐ Standard</div>
            <div className="text-3xl font-bold mt-2">{estadisticas.standard}</div>
          </div>

          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="text-sm opacity-90">⚠️ Poco Fiable</div>
            <div className="text-3xl font-bold mt-2">{estadisticas.poco_fiable}</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                🔍 Buscar
              </label>
              <input
                type="text"
                value={filtros.buscar}
                onChange={(e) => handleFiltroChange('buscar', e.target.value)}
                placeholder="Nombre o teléfono..."
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                🏷️ Clasificación
              </label>
              <select
                value={filtros.clasificacion}
                onChange={(e) => handleFiltroChange('clasificacion', e.target.value)}
                className="input"
              >
                <option value="">Todas</option>
                <option value="vip">VIP</option>
                <option value="standard">Standard</option>
                <option value="poco_fiable">Poco Fiable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                📊 Ordenar por
              </label>
              <select
                value={filtros.ordenar}
                onChange={(e) => handleFiltroChange('ordenar', e.target.value)}
                className="input"
              >
                <option value="nombre">Nombre</option>
                <option value="visitas">Más visitas</option>
                <option value="importe">Mayor gasto</option>
                <option value="reciente">Más reciente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Clientes */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Clasificación</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Visitas</th>
                  <th>Cancelaciones</th>
                  <th>No-Shows</th>
                  <th>Importe Total</th>
                  <th>Ticket Medio</th>
                  <th>Última Visita</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <span className={`badge ${obtenerColorClasificacion(cliente.clasificacion)}`}>
                          {obtenerIconoClasificacion(cliente.clasificacion)}{' '}
                          {capitalizar(cliente.clasificacion).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="font-semibold">{cliente.nombre}</td>
                      <td className="font-mono text-sm">{cliente.telefono}</td>
                      <td className="text-center font-semibold text-green-600">
                        {cliente.total_visitas}
                      </td>
                      <td className="text-center font-semibold text-orange-600">
                        {cliente.total_cancelaciones}
                      </td>
                      <td className="text-center font-semibold text-red-600">
                        {cliente.total_no_shows}
                      </td>
                      <td className="font-semibold">
                        {formatearMoneda(cliente.importe_total || 0)}
                      </td>
                      <td className="font-semibold">
                        {formatearMoneda(cliente.importe_medio_por_comensal || 0)}
                      </td>
                      <td className="text-sm text-gray-600">
                        {cliente.ultima_visita
                          ? formatearFechaHumana(cliente.ultima_visita)
                          : 'Nunca'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">ℹ️ Clasificación Automática</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>🏆 VIP:</strong> ≥10 visitas, ticket medio ≥30€, {'<'}10% problemas</p>
            <p><strong>⭐ Standard:</strong> Comportamiento normal</p>
            <p><strong>⚠️ Poco Fiable:</strong> {'>'}30% cancelaciones o no-shows</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
