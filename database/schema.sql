-- ===== SCHEMA DE BASE DE DATOS PARA CASA JOSÉ =====
-- Este esquema se debe ejecutar en Supabase

-- Tabla de Clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    notas TEXT,

    -- Clasificación
    clasificacion VARCHAR(50) DEFAULT 'standard',
    -- Valores: 'vip', 'standard', 'poco_fiable'

    -- Estadísticas
    total_visitas INTEGER DEFAULT 0,
    total_cancelaciones INTEGER DEFAULT 0,
    total_no_shows INTEGER DEFAULT 0,
    importe_total DECIMAL(10, 2) DEFAULT 0,
    importe_medio_por_comensal DECIMAL(10, 2) DEFAULT 0,
    ultima_visita DATE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Reservas
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,

    -- Datos de reserva
    fecha DATE NOT NULL,
    turno VARCHAR(10) NOT NULL, -- 'comida' o 'cena'
    hora TIME NOT NULL,
    mesa VARCHAR(10) NOT NULL,
    mesas_combinadas JSONB, -- Array de mesas: ["M1", "M2", "M3"]

    -- Datos del cliente
    nombre_cliente VARCHAR(255) NOT NULL,
    telefono_cliente VARCHAR(20) NOT NULL,
    pax INTEGER NOT NULL,
    notas TEXT,

    -- Estado de la reserva
    estado VARCHAR(50) DEFAULT 'confirmada',
    -- Valores: 'confirmada', 'completada', 'cancelada', 'no_show'

    -- Datos económicos
    importe_total DECIMAL(10, 2),
    importe_por_comensal DECIMAL(10, 2),

    -- Metadata
    cancelada_por VARCHAR(100), -- 'cliente' o 'restaurante'
    fecha_cancelacion TIMESTAMP WITH TIME ZONE,
    tiempo_antelacion_cancelacion INTEGER, -- en horas

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Posiciones de Mesas (para la vista de plano)
CREATE TABLE mesas_posiciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa VARCHAR(10) UNIQUE NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'rectangular' o 'circular'
    capacidad INTEGER NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Historial de Cambios de Clasificación
CREATE TABLE historial_clasificacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    clasificacion_anterior VARCHAR(50),
    clasificacion_nueva VARCHAR(50),
    razon TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_reservas_fecha ON reservas(fecha);
CREATE INDEX idx_reservas_cliente_id ON reservas(cliente_id);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_clasificacion ON clientes(clasificacion);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON reservas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas del cliente
CREATE OR REPLACE FUNCTION actualizar_estadisticas_cliente(cliente_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_vis INTEGER;
    total_canc INTEGER;
    total_noshows INTEGER;
    imp_total DECIMAL(10, 2);
    imp_medio DECIMAL(10, 2);
    ult_visita DATE;
    nueva_clasificacion VARCHAR(50);
    clasificacion_actual VARCHAR(50);
    porcentaje_problemas DECIMAL(5, 2);
BEGIN
    -- Obtener estadísticas
    SELECT
        COUNT(*) FILTER (WHERE estado = 'completada'),
        COUNT(*) FILTER (WHERE estado = 'cancelada'),
        COUNT(*) FILTER (WHERE estado = 'no_show'),
        COALESCE(SUM(importe_total) FILTER (WHERE estado = 'completada'), 0),
        COALESCE(AVG(importe_por_comensal) FILTER (WHERE estado = 'completada'), 0),
        MAX(fecha) FILTER (WHERE estado = 'completada')
    INTO total_vis, total_canc, total_noshows, imp_total, imp_medio, ult_visita
    FROM reservas
    WHERE cliente_id = cliente_uuid;

    -- Calcular porcentaje de problemas
    IF (total_vis + total_canc + total_noshows) > 0 THEN
        porcentaje_problemas := ((total_canc + total_noshows)::DECIMAL / (total_vis + total_canc + total_noshows)) * 100;
    ELSE
        porcentaje_problemas := 0;
    END IF;

    -- Obtener clasificación actual
    SELECT clasificacion INTO clasificacion_actual FROM clientes WHERE id = cliente_uuid;

    -- Determinar nueva clasificación
    IF porcentaje_problemas > 30 THEN
        nueva_clasificacion := 'poco_fiable';
    ELSIF total_vis >= 10 AND imp_medio >= 30 AND porcentaje_problemas < 10 THEN
        nueva_clasificacion := 'vip';
    ELSE
        nueva_clasificacion := 'standard';
    END IF;

    -- Actualizar cliente
    UPDATE clientes
    SET
        total_visitas = total_vis,
        total_cancelaciones = total_canc,
        total_no_shows = total_noshows,
        importe_total = imp_total,
        importe_medio_por_comensal = imp_medio,
        ultima_visita = ult_visita,
        clasificacion = nueva_clasificacion
    WHERE id = cliente_uuid;

    -- Registrar cambio de clasificación si cambió
    IF clasificacion_actual IS DISTINCT FROM nueva_clasificacion THEN
        INSERT INTO historial_clasificacion (cliente_id, clasificacion_anterior, clasificacion_nueva, razon)
        VALUES (
            cliente_uuid,
            clasificacion_actual,
            nueva_clasificacion,
            FORMAT('Visitas: %s, Cancelaciones: %s, No-shows: %s, %% Problemas: %s, Importe medio: %s',
                   total_vis, total_canc, total_noshows, ROUND(porcentaje_problemas, 2), ROUND(imp_medio, 2))
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas cuando cambia una reserva
CREATE OR REPLACE FUNCTION trigger_actualizar_estadisticas()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar estadísticas del cliente afectado
    IF TG_OP = 'DELETE' THEN
        IF OLD.cliente_id IS NOT NULL THEN
            PERFORM actualizar_estadisticas_cliente(OLD.cliente_id);
        END IF;
        RETURN OLD;
    ELSE
        IF NEW.cliente_id IS NOT NULL THEN
            PERFORM actualizar_estadisticas_cliente(NEW.cliente_id);
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reservas_estadisticas
    AFTER INSERT OR UPDATE OR DELETE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_actualizar_estadisticas();

-- Insertar posiciones de mesas por defecto
INSERT INTO mesas_posiciones (mesa, x, y, tipo, capacidad) VALUES
    ('M1', 100, 100, 'rectangular', 4),
    ('M2', 250, 100, 'rectangular', 4),
    ('M3', 400, 100, 'rectangular', 4),
    ('M4', 550, 100, 'rectangular', 4),
    ('M5', 100, 250, 'rectangular', 4),
    ('M6', 250, 250, 'rectangular', 4),
    ('M7', 400, 250, 'rectangular', 4),
    ('M8', 550, 250, 'rectangular', 4),
    ('M9', 100, 400, 'rectangular', 4),
    ('M10', 250, 400, 'rectangular', 4),
    ('M11', 400, 400, 'rectangular', 4),
    ('M12', 550, 400, 'rectangular', 4),
    ('M13', 100, 550, 'rectangular', 4),
    ('M14', 800, 100, 'circular', 6),
    ('M15', 950, 100, 'circular', 6),
    ('M16', 1100, 100, 'circular', 6),
    ('M17', 800, 250, 'circular', 6),
    ('M18', 950, 250, 'circular', 6),
    ('M19', 1100, 250, 'circular', 6),
    ('M20', 800, 400, 'circular', 6);

-- Vista para análisis de clientes
CREATE VIEW vista_analytics_clientes AS
SELECT
    c.id,
    c.nombre,
    c.telefono,
    c.clasificacion,
    c.total_visitas,
    c.total_cancelaciones,
    c.total_no_shows,
    c.importe_total,
    c.importe_medio_por_comensal,
    c.ultima_visita,
    CASE
        WHEN (c.total_visitas + c.total_cancelaciones + c.total_no_shows) > 0
        THEN ROUND(((c.total_cancelaciones + c.total_no_shows)::DECIMAL / (c.total_visitas + c.total_cancelaciones + c.total_no_shows) * 100), 2)
        ELSE 0
    END as porcentaje_problemas,
    CASE
        WHEN c.ultima_visita IS NULL THEN 'Nunca'
        WHEN c.ultima_visita >= CURRENT_DATE - INTERVAL '7 days' THEN 'Esta semana'
        WHEN c.ultima_visita >= CURRENT_DATE - INTERVAL '30 days' THEN 'Este mes'
        WHEN c.ultima_visita >= CURRENT_DATE - INTERVAL '90 days' THEN 'Últimos 3 meses'
        ELSE 'Hace más de 3 meses'
    END as recencia
FROM clientes c;

-- Comentarios en las tablas
COMMENT ON TABLE clientes IS 'Tabla principal de clientes del restaurante';
COMMENT ON TABLE reservas IS 'Tabla de todas las reservas con su estado y datos económicos';
COMMENT ON TABLE mesas_posiciones IS 'Posiciones de las mesas en el plano del restaurante';
COMMENT ON TABLE historial_clasificacion IS 'Historial de cambios en la clasificación de clientes';
COMMENT ON COLUMN clientes.clasificacion IS 'Clasificación del cliente: vip, standard, poco_fiable';
COMMENT ON COLUMN reservas.estado IS 'Estado de la reserva: confirmada, completada, cancelada, no_show';
