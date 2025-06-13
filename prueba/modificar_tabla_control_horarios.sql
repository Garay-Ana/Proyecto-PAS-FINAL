-- Script para modificar la tabla control_horarios
-- Eliminar columna empleado_remoto_id (sin IF EXISTS para compatibilidad MySQL)
ALTER TABLE control_horarios
DROP COLUMN empleado_remoto_id;

-- Agregar columna tipo_empleado si no existe
ALTER TABLE control_horarios
ADD COLUMN tipo_empleado ENUM('usuario', 'remoto') NOT NULL DEFAULT 'usuario';

-- Asegurar que empleado_id sea INT NOT NULL
ALTER TABLE control_horarios
MODIFY COLUMN empleado_id INT NOT NULL;

-- Crear índice para empleado_id y tipo_empleado para optimizar consultas
CREATE INDEX idx_empleado_tipo ON control_horarios (empleado_id, tipo_empleado);

-- Nota: Se asume que la tabla control_horarios ya existe y tiene la columna empleado_id
