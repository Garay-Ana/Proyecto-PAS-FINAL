ALTER TABLE control_horarios
ADD COLUMN empleado_remoto_id INT NULL;

ALTER TABLE control_horarios
ADD CONSTRAINT fk_empleado_remoto
FOREIGN KEY (empleado_remoto_id) REFERENCES empleados_remotos(id);
