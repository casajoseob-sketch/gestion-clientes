const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ===== OBTENER TODOS LOS CLIENTES =====
// GET /api/clientes?clasificacion=vip&ordenar=visitas
router.get('/', async (req, res) => {
  try {
    const { clasificacion, ordenar, buscar } = req.query;

    let query = supabase
      .from('clientes')
      .select('*');

    if (clasificacion) {
      query = query.eq('clasificacion', clasificacion);
    }

    if (buscar) {
      query = query.or(`nombre.ilike.%${buscar}%,telefono.ilike.%${buscar}%`);
    }

    // Ordenamiento
    if (ordenar === 'visitas') {
      query = query.order('total_visitas', { ascending: false });
    } else if (ordenar === 'importe') {
      query = query.order('importe_total', { ascending: false });
    } else if (ordenar === 'reciente') {
      query = query.order('ultima_visita', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('nombre', { ascending: true });
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== OBTENER UN CLIENTE POR ID =====
// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== OBTENER HISTORIAL DE RESERVAS DE UN CLIENTE =====
// GET /api/clientes/:id/reservas
router.get('/:id/reservas', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('cliente_id', id)
      .order('fecha', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener historial de reservas:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== OBTENER ESTADÍSTICAS DE UN CLIENTE =====
// GET /api/clientes/:id/estadisticas
router.get('/:id/estadisticas', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener cliente
    const { data: cliente, error: errorCliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (errorCliente) throw errorCliente;

    // Obtener estadísticas adicionales
    const { data: reservasPorMes } = await supabase
      .from('reservas')
      .select('fecha, pax, importe_total, estado')
      .eq('cliente_id', id)
      .order('fecha', { ascending: false });

    // Agrupar por mes
    const estadisticasPorMes = {};
    reservasPorMes?.forEach(r => {
      const mes = r.fecha.substring(0, 7); // YYYY-MM
      if (!estadisticasPorMes[mes]) {
        estadisticasPorMes[mes] = {
          mes,
          visitas: 0,
          cancelaciones: 0,
          totalPax: 0,
          importeTotal: 0
        };
      }

      if (r.estado === 'completada') {
        estadisticasPorMes[mes].visitas++;
        estadisticasPorMes[mes].totalPax += r.pax;
        estadisticasPorMes[mes].importeTotal += parseFloat(r.importe_total || 0);
      } else if (r.estado === 'cancelada' || r.estado === 'no_show') {
        estadisticasPorMes[mes].cancelaciones++;
      }
    });

    res.json({
      ...cliente,
      estadisticasPorMes: Object.values(estadisticasPorMes)
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== OBTENER HISTORIAL DE CLASIFICACIÓN =====
// GET /api/clientes/:id/historial-clasificacion
router.get('/:id/historial-clasificacion', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('historial_clasificacion')
      .select('*')
      .eq('cliente_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener historial de clasificación:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== CREAR NUEVO CLIENTE =====
// POST /api/clientes
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, email, notas } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });
    }

    // Verificar si ya existe
    const { data: existente } = await supabase
      .from('clientes')
      .select('id')
      .eq('telefono', telefono)
      .single();

    if (existente) {
      return res.status(409).json({ error: 'Ya existe un cliente con este teléfono' });
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nombre,
        telefono,
        email,
        notas
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ACTUALIZAR CLIENTE =====
// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email, notas } = req.body;

    const { data, error } = await supabase
      .from('clientes')
      .update({
        nombre,
        telefono,
        email,
        notas
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ACTUALIZAR CLASIFICACIÓN MANUAL =====
// PATCH /api/clientes/:id/clasificacion
router.patch('/:id/clasificacion', async (req, res) => {
  try {
    const { id } = req.params;
    const { clasificacion, razon } = req.body;

    if (!['vip', 'standard', 'poco_fiable'].includes(clasificacion)) {
      return res.status(400).json({ error: 'Clasificación inválida' });
    }

    // Obtener clasificación actual
    const { data: cliente } = await supabase
      .from('clientes')
      .select('clasificacion')
      .eq('id', id)
      .single();

    // Actualizar clasificación
    const { data, error } = await supabase
      .from('clientes')
      .update({ clasificacion })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar en historial
    await supabase
      .from('historial_clasificacion')
      .insert({
        cliente_id: id,
        clasificacion_anterior: cliente.clasificacion,
        clasificacion_nueva: clasificacion,
        razon: razon || 'Cambio manual'
      });

    res.json(data);
  } catch (error) {
    console.error('Error al actualizar clasificación:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ELIMINAR CLIENTE =====
// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== RECALCULAR ESTADÍSTICAS DE UN CLIENTE =====
// POST /api/clientes/:id/recalcular
router.post('/:id/recalcular', async (req, res) => {
  try {
    const { id } = req.params;

    // Llamar a la función de PostgreSQL
    const { error } = await supabase.rpc('actualizar_estadisticas_cliente', {
      cliente_uuid: id
    });

    if (error) throw error;

    // Obtener datos actualizados
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    res.json(data);
  } catch (error) {
    console.error('Error al recalcular estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
