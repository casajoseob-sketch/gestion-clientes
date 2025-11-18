const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ===== OBTENER TODAS LAS RESERVAS =====
// GET /api/reservas?fecha=YYYY-MM-DD&turno=comida
router.get('/', async (req, res) => {
  try {
    const { fecha, turno, estado } = req.query;

    let query = supabase
      .from('reservas')
      .select(`
        *,
        clientes (
          id,
          nombre,
          telefono,
          clasificacion
        )
      `)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (fecha) {
      query = query.eq('fecha', fecha);
    }

    if (turno) {
      query = query.eq('turno', turno);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== OBTENER UNA RESERVA POR ID =====
// GET /api/reservas/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        clientes (
          id,
          nombre,
          telefono,
          clasificacion
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== CREAR NUEVA RESERVA =====
// POST /api/reservas
router.post('/', async (req, res) => {
  try {
    const {
      fecha,
      turno,
      hora,
      mesa,
      mesasCombinadas,
      nombreCliente,
      telefonoCliente,
      pax,
      notas,
      importeTotal,
      importePorComensal
    } = req.body;

    // Validaciones
    if (!fecha || !turno || !hora || !mesa || !nombreCliente || !telefonoCliente || !pax) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar disponibilidad de las mesas
    const mesasAVerificar = mesasCombinadas || [mesa];
    const disponibilidad = await verificarDisponibilidad(fecha, turno, hora, mesasAVerificar);

    if (!disponibilidad.disponible) {
      return res.status(409).json({
        error: 'Mesa no disponible',
        mesa: disponibilidad.mesaOcupada
      });
    }

    // Buscar o crear cliente
    let clienteId = null;
    const { data: clienteExistente } = await supabase
      .from('clientes')
      .select('id')
      .eq('telefono', telefonoCliente)
      .single();

    if (clienteExistente) {
      clienteId = clienteExistente.id;

      // Actualizar nombre del cliente si es diferente
      await supabase
        .from('clientes')
        .update({ nombre: nombreCliente })
        .eq('id', clienteId);
    } else {
      // Crear nuevo cliente
      const { data: nuevoCliente, error: errorCliente } = await supabase
        .from('clientes')
        .insert({
          nombre: nombreCliente,
          telefono: telefonoCliente
        })
        .select()
        .single();

      if (errorCliente) throw errorCliente;
      clienteId = nuevoCliente.id;
    }

    // Crear reserva
    const { data, error } = await supabase
      .from('reservas')
      .insert({
        cliente_id: clienteId,
        fecha,
        turno,
        hora,
        mesa,
        mesas_combinadas: mesasCombinadas ? JSON.stringify(mesasCombinadas) : null,
        nombre_cliente: nombreCliente,
        telefono_cliente: telefonoCliente,
        pax,
        notas,
        estado: 'confirmada',
        importe_total: importeTotal,
        importe_por_comensal: importePorComensal
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ACTUALIZAR RESERVA =====
// PUT /api/reservas/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('reservas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== CAMBIAR ESTADO DE RESERVA =====
// PATCH /api/reservas/:id/estado
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, canceladaPor, importeTotal, importePorComensal } = req.body;

    if (!['confirmada', 'completada', 'cancelada', 'no_show'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const updates = { estado };

    // Si es cancelación, agregar metadata
    if (estado === 'cancelada') {
      updates.cancelada_por = canceladaPor || 'cliente';
      updates.fecha_cancelacion = new Date().toISOString();

      // Calcular tiempo de antelación en horas
      const { data: reserva } = await supabase
        .from('reservas')
        .select('fecha, hora')
        .eq('id', id)
        .single();

      if (reserva) {
        const fechaReserva = new Date(`${reserva.fecha}T${reserva.hora}`);
        const ahora = new Date();
        const horasAntelacion = Math.floor((fechaReserva - ahora) / (1000 * 60 * 60));
        updates.tiempo_antelacion_cancelacion = horasAntelacion;
      }
    }

    // Si es completada, agregar importes
    if (estado === 'completada' && (importeTotal || importePorComensal)) {
      updates.importe_total = importeTotal;
      updates.importe_por_comensal = importePorComensal;
    }

    const { data, error } = await supabase
      .from('reservas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al cambiar estado de reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ELIMINAR RESERVA =====
// DELETE /api/reservas/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== FUNCIÓN AUXILIAR: VERIFICAR DISPONIBILIDAD =====
async function verificarDisponibilidad(fecha, turno, hora, mesas) {
  try {
    for (const mesa of mesas) {
      // Buscar reservas que ocupen esta mesa en el mismo horario
      const { data, error } = await supabase
        .from('reservas')
        .select('id, mesa, mesas_combinadas')
        .eq('fecha', fecha)
        .eq('turno', turno)
        .eq('hora', hora)
        .in('estado', ['confirmada', 'completada']);

      if (error) throw error;

      // Verificar si la mesa está ocupada
      const ocupada = data.some(reserva => {
        if (reserva.mesa === mesa) return true;
        if (reserva.mesas_combinadas) {
          const mesasCombinadas = JSON.parse(reserva.mesas_combinadas);
          return mesasCombinadas.includes(mesa);
        }
        return false;
      });

      if (ocupada) {
        return { disponible: false, mesaOcupada: mesa };
      }
    }

    return { disponible: true };
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    throw error;
  }
}

module.exports = router;
