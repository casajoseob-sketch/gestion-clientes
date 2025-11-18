const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ===== DASHBOARD GENERAL =====
// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const fechaDesde = desde || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
    const fechaHasta = hasta || new Date().toISOString().split('T')[0];

    // Total de clientes
    const { count: totalClientes } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    // Clientes por clasificación
    const { data: clientesPorClasificacion } = await supabase
      .from('clientes')
      .select('clasificacion')
      .select('clasificacion, count:clasificacion.count()');

    // Total de reservas en el período
    const { count: totalReservas } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .gte('fecha', fechaDesde)
      .lte('fecha', fechaHasta);

    // Reservas por estado
    const { data: reservasPorEstado } = await supabase
      .from('reservas')
      .select('estado')
      .gte('fecha', fechaDesde)
      .lte('fecha', fechaHasta);

    const estadisticasEstado = reservasPorEstado.reduce((acc, r) => {
      acc[r.estado] = (acc[r.estado] || 0) + 1;
      return acc;
    }, {});

    // Ingresos totales
    const { data: reservasCompletadas } = await supabase
      .from('reservas')
      .select('importe_total')
      .eq('estado', 'completada')
      .gte('fecha', fechaDesde)
      .lte('fecha', fechaHasta);

    const ingresosTotales = reservasCompletadas.reduce((sum, r) => sum + parseFloat(r.importe_total || 0), 0);

    // Ticket medio
    const ticketMedio = reservasCompletadas.length > 0
      ? ingresosTotales / reservasCompletadas.length
      : 0;

    // Top 10 clientes VIP
    const { data: topClientes } = await supabase
      .from('clientes')
      .select('id, nombre, telefono, total_visitas, importe_total, clasificacion')
      .order('importe_total', { ascending: false })
      .limit(10);

    // Tasa de cancelación
    const totalReservasArray = Object.values(estadisticasEstado).reduce((a, b) => a + b, 0);
    const tasaCancelacion = totalReservasArray > 0
      ? ((estadisticasEstado.cancelada || 0) + (estadisticasEstado.no_show || 0)) / totalReservasArray * 100
      : 0;

    // Ocupación por mesa (más solicitadas)
    const { data: reservasPorMesa } = await supabase
      .from('reservas')
      .select('mesa')
      .gte('fecha', fechaDesde)
      .lte('fecha', fechaHasta)
      .in('estado', ['confirmada', 'completada']);

    const ocupacionMesas = reservasPorMesa.reduce((acc, r) => {
      acc[r.mesa] = (acc[r.mesa] || 0) + 1;
      return acc;
    }, {});

    const mesasMasUsadas = Object.entries(ocupacionMesas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([mesa, count]) => ({ mesa, reservas: count }));

    res.json({
      periodo: { desde: fechaDesde, hasta: fechaHasta },
      resumen: {
        totalClientes,
        totalReservas,
        ingresosTotales: parseFloat(ingresosTotales.toFixed(2)),
        ticketMedio: parseFloat(ticketMedio.toFixed(2)),
        tasaCancelacion: parseFloat(tasaCancelacion.toFixed(2))
      },
      clientesPorClasificacion: {
        vip: clientesPorClasificacion?.find(c => c.clasificacion === 'vip')?.count || 0,
        standard: clientesPorClasificacion?.find(c => c.clasificacion === 'standard')?.count || 0,
        poco_fiable: clientesPorClasificacion?.find(c => c.clasificacion === 'poco_fiable')?.count || 0
      },
      reservasPorEstado: estadisticasEstado,
      topClientes,
      mesasMasUsadas
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ESTADÍSTICAS POR PERÍODO =====
// GET /api/analytics/tendencias
router.get('/tendencias', async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query; // 'dia', 'semana', 'mes'

    let fechaDesde;
    const fechaHasta = new Date().toISOString().split('T')[0];

    switch (periodo) {
      case 'dia':
        fechaDesde = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
        break;
      case 'semana':
        fechaDesde = new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split('T')[0];
        break;
      case 'mes':
        fechaDesde = new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0];
        break;
      default:
        fechaDesde = new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0];
    }

    const { data: reservas } = await supabase
      .from('reservas')
      .select('fecha, estado, importe_total, pax')
      .gte('fecha', fechaDesde)
      .lte('fecha', fechaHasta)
      .order('fecha', { ascending: true });

    // Agrupar por período
    const tendencias = {};

    reservas.forEach(r => {
      let clave;
      if (periodo === 'dia') {
        clave = r.fecha; // YYYY-MM-DD
      } else if (periodo === 'semana') {
        const fecha = new Date(r.fecha);
        const inicioSemana = new Date(fecha.setDate(fecha.getDate() - fecha.getDay()));
        clave = inicioSemana.toISOString().split('T')[0];
      } else {
        clave = r.fecha.substring(0, 7); // YYYY-MM
      }

      if (!tendencias[clave]) {
        tendencias[clave] = {
          periodo: clave,
          reservas: 0,
          completadas: 0,
          canceladas: 0,
          no_shows: 0,
          ingresos: 0,
          pax: 0
        };
      }

      tendencias[clave].reservas++;
      if (r.estado === 'completada') {
        tendencias[clave].completadas++;
        tendencias[clave].ingresos += parseFloat(r.importe_total || 0);
        tendencias[clave].pax += r.pax;
      } else if (r.estado === 'cancelada') {
        tendencias[clave].canceladas++;
      } else if (r.estado === 'no_show') {
        tendencias[clave].no_shows++;
      }
    });

    const resultado = Object.values(tendencias).map(t => ({
      ...t,
      ingresos: parseFloat(t.ingresos.toFixed(2)),
      ticketMedio: t.completadas > 0 ? parseFloat((t.ingresos / t.completadas).toFixed(2)) : 0
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener tendencias:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ANÁLISIS DE OCUPACIÓN =====
// GET /api/analytics/ocupacion
router.get('/ocupacion', async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

    // Obtener todas las reservas del día
    const { data: reservas } = await supabase
      .from('reservas')
      .select('turno, hora, mesa, mesas_combinadas, pax, estado')
      .eq('fecha', fechaConsulta)
      .in('estado', ['confirmada', 'completada']);

    // Calcular ocupación por turno
    const ocupacionComida = {};
    const ocupacionCena = {};

    const horariosComida = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
    const horariosCena = ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];

    horariosComida.forEach(h => ocupacionComida[h] = 0);
    horariosCena.forEach(h => ocupacionCena[h] = 0);

    reservas.forEach(r => {
      const mesasUsadas = r.mesas_combinadas ? JSON.parse(r.mesas_combinadas).length : 1;

      if (r.turno === 'comida') {
        ocupacionComida[r.hora] = (ocupacionComida[r.hora] || 0) + mesasUsadas;
      } else {
        ocupacionCena[r.hora] = (ocupacionCena[r.hora] || 0) + mesasUsadas;
      }
    });

    // Total de comensales por turno
    const paxComida = reservas
      .filter(r => r.turno === 'comida')
      .reduce((sum, r) => sum + r.pax, 0);

    const paxCena = reservas
      .filter(r => r.turno === 'cena')
      .reduce((sum, r) => sum + r.pax, 0);

    res.json({
      fecha: fechaConsulta,
      comida: {
        reservas: Object.values(ocupacionComida).filter(v => v > 0).length,
        mesasOcupadas: Math.max(...Object.values(ocupacionComida)),
        paxTotal: paxComida,
        ocupacionPorHora: Object.entries(ocupacionComida).map(([hora, mesas]) => ({
          hora,
          mesas
        }))
      },
      cena: {
        reservas: Object.values(ocupacionCena).filter(v => v > 0).length,
        mesasOcupadas: Math.max(...Object.values(ocupacionCena)),
        paxTotal: paxCena,
        ocupacionPorHora: Object.entries(ocupacionCena).map(([hora, mesas]) => ({
          hora,
          mesas
        }))
      }
    });
  } catch (error) {
    console.error('Error al obtener ocupación:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== CLIENTES VIP Y ANÁLISIS =====
// GET /api/analytics/clientes-vip
router.get('/clientes-vip', async (req, res) => {
  try {
    const { data: clientesVIP } = await supabase
      .from('clientes')
      .select('*')
      .eq('clasificacion', 'vip')
      .order('importe_total', { ascending: false });

    // Obtener última visita de cada uno
    const clientesConDetalle = await Promise.all(
      clientesVIP.map(async (cliente) => {
        const { data: ultimaReserva } = await supabase
          .from('reservas')
          .select('fecha, importe_total')
          .eq('cliente_id', cliente.id)
          .eq('estado', 'completada')
          .order('fecha', { ascending: false })
          .limit(1)
          .single();

        return {
          ...cliente,
          ultimaReserva: ultimaReserva || null
        };
      })
    );

    res.json(clientesConDetalle);
  } catch (error) {
    console.error('Error al obtener clientes VIP:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== CLIENTES POCO FIABLES =====
// GET /api/analytics/clientes-poco-fiables
router.get('/clientes-poco-fiables', async (req, res) => {
  try {
    const { data: clientesProblematicos } = await supabase
      .from('clientes')
      .select('*')
      .eq('clasificacion', 'poco_fiable')
      .order('total_cancelaciones', { ascending: false });

    // Calcular porcentaje de problemas
    const clientesConPorcentaje = clientesProblematicos.map(cliente => {
      const totalReservas = cliente.total_visitas + cliente.total_cancelaciones + cliente.total_no_shows;
      const porcentajeProblemas = totalReservas > 0
        ? ((cliente.total_cancelaciones + cliente.total_no_shows) / totalReservas * 100).toFixed(2)
        : 0;

      return {
        ...cliente,
        porcentajeProblemas: parseFloat(porcentajeProblemas)
      };
    });

    res.json(clientesConPorcentaje);
  } catch (error) {
    console.error('Error al obtener clientes poco fiables:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== REPORTE DE INGRESOS =====
// GET /api/analytics/ingresos
router.get('/ingresos', async (req, res) => {
  try {
    const { desde, hasta, agrupar = 'mes' } = req.query;
    const fechaDesde = desde || new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0];
    const fechaHasta = hasta || new Date().toISOString().split('T')[0];

    const { data: reservas } = await supabase
      .from('reservas')
      .select('fecha, turno, importe_total, pax')
      .eq('estado', 'completada')
      .gte('fecha', fechaDesde)
      .lte('fecha', fechaHasta)
      .order('fecha', { ascending: true });

    // Agrupar ingresos
    const ingresos = {};

    reservas.forEach(r => {
      const clave = agrupar === 'dia' ? r.fecha : r.fecha.substring(0, 7);

      if (!ingresos[clave]) {
        ingresos[clave] = {
          periodo: clave,
          ingresoComida: 0,
          ingresoCena: 0,
          paxComida: 0,
          paxCena: 0,
          reservasComida: 0,
          reservasCena: 0
        };
      }

      const importe = parseFloat(r.importe_total || 0);

      if (r.turno === 'comida') {
        ingresos[clave].ingresoComida += importe;
        ingresos[clave].paxComida += r.pax;
        ingresos[clave].reservasComida++;
      } else {
        ingresos[clave].ingresoCena += importe;
        ingresos[clave].paxCena += r.pax;
        ingresos[clave].reservasCena++;
      }
    });

    const resultado = Object.values(ingresos).map(i => ({
      ...i,
      ingresoComida: parseFloat(i.ingresoComida.toFixed(2)),
      ingresoCena: parseFloat(i.ingresoCena.toFixed(2)),
      ingresoTotal: parseFloat((i.ingresoComida + i.ingresoCena).toFixed(2)),
      ticketMedioComida: i.reservasComida > 0 ? parseFloat((i.ingresoComida / i.reservasComida).toFixed(2)) : 0,
      ticketMedioCena: i.reservasCena > 0 ? parseFloat((i.ingresoCena / i.reservasCena).toFixed(2)) : 0
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
