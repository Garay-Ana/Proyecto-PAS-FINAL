-- Script para agregar columna tipo_empleado en la tabla control_horarios
ALTER TABLE control_horarios
ADD COLUMN tipo_empleado VARCHAR(20) NOT NULL DEFAULT 'usuario';

-- Nota: El valor por defecto es 'usuario' para mantener compatibilidad con datos existentes.
