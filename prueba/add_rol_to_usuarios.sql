-- Script para agregar el campo "rol" en la tabla usuarios
ALTER TABLE usuarios
ADD COLUMN rol VARCHAR(50) NOT NULL DEFAULT 'usuario';
