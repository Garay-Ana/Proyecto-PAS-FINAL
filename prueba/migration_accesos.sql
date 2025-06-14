-- Modificaciones en la estructura de la tabla accesos
ALTER TABLE `accesos` 
MODIFY COLUMN `usuario_id` INT NULL DEFAULT NULL COMMENT 'ID del usuario asociado',
MODIFY COLUMN `control_horario_id` INT NULL DEFAULT NULL COMMENT 'ID del registro en control_horarios',
MODIFY COLUMN `es_registrado` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=no registrado, 1=registrado',
ADD INDEX `idx_usuario_id` (`usuario_id`),
ADD INDEX `idx_control_horario_id` (`control_horario_id`),
ADD INDEX `idx_uid_timestamp` (`uid`, `timestamp`);

-- Actualización de registros existentes para vincularlos con usuarios
UPDATE accesos a
JOIN usuarios u ON a.uid = u.uid
SET a.usuario_id = u.id,
    a.es_registrado = 1
WHERE a.es_registrado = 0;

-- Vincular con control_horarios donde sea posible
UPDATE accesos a
JOIN control_horarios ch ON a.usuario_id = ch.usuario_id 
                        AND DATE(a.timestamp) = DATE(ch.timestamp)
SET a.control_horario_id = ch.id
WHERE a.control_horario_id IS NULL;

-- Agregar claves foráneas para integridad referencial
ALTER TABLE `accesos`
ADD CONSTRAINT `fk_acceso_usuario`
FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
ON DELETE SET NULL ON UPDATE CASCADE,

ADD CONSTRAINT `fk_acceso_control_horario`
FOREIGN KEY (`control_horario_id`) REFERENCES `control_horarios` (`id`)
ON DELETE SET NULL ON UPDATE CASCADE;

-- Creación del trigger para actualizar accesos tras inserción en control_horarios
DELIMITER //
CREATE TRIGGER after_control_horarios_insert
AFTER INSERT ON control_horarios
FOR EACH ROW
BEGIN
    -- Actualiza el registro de acceso más reciente con este UID
    UPDATE accesos
    SET usuario_id = NEW.usuario_id,
        control_horario_id = NEW.id,
        es_registrado = 1
    WHERE uid = (SELECT uid FROM usuarios WHERE id = NEW.usuario_id)
    AND timestamp <= NEW.timestamp
    ORDER BY timestamp DESC
    LIMIT 1;
END//
DELIMITER ;
