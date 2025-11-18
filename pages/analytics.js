import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { analyticsAPI } from '@/lib/api';
import { formatearMoneda, formatearPorcentaje, obtenerIconoClasificacion } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [tendencias, setTendencias] = useState([]);
  const [clientesVIP, setClientesVIP] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');

  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [dashboardData, tendenciasData, vipData] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getTendencias(periodo),
        analyticsAPI.getClientesVIP()
      ]);

      setDashboard(dashboardData);
      setTendencias(tendenciasData);
      setClientesVIP(vipData);
    } catch (error) {
      console.error('Error al cargar analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Cargando analytics...</span>
        </div>
      </Layout>
    );
  }

  if (!dashboard) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-600">
          No hay datos disponibles
        </div>
      </Layout>
    );
  }

  const COLORS = ['#0fb9b1', '#c19031', '#e74c3c', '#f39c12', '#2ecc71'];

  const dataClasificacion = [
    { name: 'VIP', value: dashboard.clientesPorClasificacion.vip },
    { name: 'Standard', value: dashboard.clientesPorClasificacion.standard },
    { name: 'Poco Fiable', value: dashboard.clientesPorClasificacion.poco_fiable }
  ];

  const dataEstados = Object.entries(dashboard.reservasPorEstado).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value
  }));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Dashboard de Analytics
          </h2>
          <div className="flex items-center space-x-2">
            <label className="font-semibold text-gray-700">Período:</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="input max-w-xs"
            >
              <option value="dia">Últimos 30 días</option>
              <option value="semana">Últimas 12 semanas</option>
              <option value="mes">Últimos 12 meses</option>
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white card-hover">
            <div className="text-sm opacity-90">Total Clientes</div>
            <div className="text-3xl font-bold mt-2">{dashboard.resumen.totalClientes}</div>
            <div className="text-xs mt-1 opacity-75">👥 Clientes registrados</div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white card-hover">
            <div className="text-sm opacity-90">Total Reservas</div>
            <div className="text-3xl font-bold mt-2">{dashboard.resumen.totalReservas}</div>
            <div className="text-xs mt-1 opacity-75">📋 En el período</div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white card-hover">
            <div className="text-sm opacity-90">Ingresos Totales</div>
            <div className="text-3xl font-bold mt-2">
              {formatearMoneda(dashboard.resumen.ingresosTotales)}
            </div>
            <div className="text-xs mt-1 opacity-75">💰 Facturación</div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white card-hover">
            <div className="text-sm opacity-90">Ticket Medio</div>
            <div className="text-3xl font-bold mt-2">
              {formatearMoneda(dashboard.resumen.ticketMedio)}
            </div>
            <div className="text-xs mt-1 opacity-75">💵 Por reserva</div>
          </div>

          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white card-hover">
            <div className="text-sm opacity-90">Tasa Cancelación</div>
            <div className="text-3xl font-bold mt-2">
              {formatearPorcentaje(dashboard.resumen.tasaCancelacion)}
            </div>
            <div className="text-xs mt-1 opacity-75">⚠️ Cancelaciones</div>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendencias */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              📈 Tendencias de Reservas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tendencias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reservas" stroke="#0fb9b1" name="Reservas" />
                <Line type="monotone" dataKey="completadas" stroke="#2ecc71" name="Completadas" />
                <Line type="monotone" dataKey="canceladas" stroke="#e74c3c" name="Canceladas" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ingresos */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              💰 Ingresos por Período
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tendencias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ingresos" fill="#c19031" name="Ingresos (€)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clasificación de Clientes */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              👥 Clasificación de Clientes
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataClasificacion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataClasificacion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Estados de Reservas */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              📊 Estados de Reservas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataEstados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0fb9b1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clientes VIP */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            🏆 Top 10 Clientes VIP
          </h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Visitas</th>
                  <th>Importe Total</th>
                  <th>Ticket Medio</th>
                  <th>Clasificación</th>
                </tr>
              </thead>
              <tbody>
                {clientesVIP.slice(0, 10).map((cliente, index) => (
                  <tr key={cliente.id}>
                    <td className="font-bold text-lg">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </td>
                    <td className="font-semibold">{cliente.nombre}</td>
                    <td className="font-mono text-sm">{cliente.telefono}</td>
                    <td className="text-center font-semibold">{cliente.total_visitas}</td>
                    <td className="font-semibold text-green-600">
                      {formatearMoneda(cliente.importe_total)}
                    </td>
                    <td className="font-semibold">
                      {formatearMoneda(cliente.importe_medio_por_comensal)}
                    </td>
                    <td>
                      <span className="badge bg-yellow-100 text-yellow-800">
                        {obtenerIconoClasificacion(cliente.clasificacion)} VIP
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mesas Más Usadas */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            🪑 Mesas Más Solicitadas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {dashboard.mesasMasUsadas.map((mesa) => (
              <div key={mesa.mesa} className="bg-gradient-to-br from-primary to-[#0a9d96] text-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{mesa.mesa}</div>
                <div className="text-sm mt-1">{mesa.reservas} reservas</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
