const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ===== OBTENER TODAS LAS POSICIONES DE MESAS =====
// GET /api/mesas
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mesas_posiciones')
      .select('*')
      .order('mesa', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ACTUALIZAR POSICIÓN DE UNA MESA =====
// PUT /api/mesas/:mesa
router.put('/:mesa', async (req, res) => {
  try {
    const { mesa } = req.params;
    const { x, y } = req.body;

    if (x === undefined || y === undefined) {
      return res.status(400).json({ error: 'Se requieren coordenadas x e y' });
    }

    const { data, error } = await supabase
      .from('mesas_posiciones')
      .update({ x, y })
      .eq('mesa', mesa)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al actualizar posición de mesa:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ACTUALIZAR MÚLTIPLES POSICIONES =====
// POST /api/mesas/actualizar-posiciones
router.post('/actualizar-posiciones', async (req, res) => {
  try {
    const { posiciones } = req.body;

    if (!Array.isArray(posiciones)) {
      return res.status(400).json({ error: 'Se requiere un array de posiciones' });
    }

    // Actualizar cada posición
    const promesas = posiciones.map(pos => {
      return supabase
        .from('mesas_posiciones')
        .update({ x: pos.x, y: pos.y })
        .eq('mesa', pos.mesa);
    });

    await Promise.all(promesas);

    res.json({ message: 'Posiciones actualizadas correctamente' });
  } catch (error) {
    console.error('Error al actualizar posiciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== RESTABLECER POSICIONES A VALORES POR DEFECTO =====
// POST /api/mesas/restablecer
router.post('/restablecer', async (req, res) => {
  try {
    const posicionesDefault = [
      { mesa: 'M1', x: 100, y: 100 },
      { mesa: 'M2', x: 250, y: 100 },
      { mesa: 'M3', x: 400, y: 100 },
      { mesa: 'M4', x: 550, y: 100 },
      { mesa: 'M5', x: 100, y: 250 },
      { mesa: 'M6', x: 250, y: 250 },
      { mesa: 'M7', x: 400, y: 250 },
      { mesa: 'M8', x: 550, y: 250 },
      { mesa: 'M9', x: 100, y: 400 },
      { mesa: 'M10', x: 250, y: 400 },
      { mesa: 'M11', x: 400, y: 400 },
      { mesa: 'M12', x: 550, y: 400 },
      { mesa: 'M13', x: 100, y: 550 },
      { mesa: 'M14', x: 800, y: 100 },
      { mesa: 'M15', x: 950, y: 100 },
      { mesa: 'M16', x: 1100, y: 100 },
      { mesa: 'M17', x: 800, y: 250 },
      { mesa: 'M18', x: 950, y: 250 },
      { mesa: 'M19', x: 1100, y: 250 },
      { mesa: 'M20', x: 800, y: 400 }
    ];

    const promesas = posicionesDefault.map(pos => {
      return supabase
        .from('mesas_posiciones')
        .update({ x: pos.x, y: pos.y })
        .eq('mesa', pos.mesa);
    });

    await Promise.all(promesas);

    res.json({ message: 'Posiciones restablecidas correctamente' });
  } catch (error) {
    console.error('Error al restablecer posiciones:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
