const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');
const app = express();
const pool = require('./db');

// CORS - Permitir todas las solicitudes
app.use(cors());  // Esto debería cubrir la mayoría de los casos

// Si necesitas configurarlo manualmente:
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');  // Permite solicitudes desde cualquier origen
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');  // Métodos permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Encabezados permitidos

  // Si la solicitud es un 'OPTIONS' (pre-flight request), responder inmediatamente con un 200 OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());  // Parsear JSON
const port = process.env.PORT || 3000;

let historial = [];

app.post('/api/lector-tarjeta', (req, res) => {
  console.log(req.body);
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: 'UID faltante' });

  const entrada = { uid, timestamp: new Date() };
  historial.push(entrada);

  console.log('UID recibido:', uid);
  res.json({ message: 'UID recibido correctamente', entrada });
});

app.post('/api/empleados-remotos', async (req, res) => {
  const { nombre, apellido, correo, contraseña, telefono, fecha_nacimiento } = req.body;
  if (!nombre || !apellido || !correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    // Verificar si el correo ya existe para evitar duplicados
    const [existing] = await pool.query(
      'SELECT id FROM empleados_remotos WHERE correo = ?',
      [correo]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const [result] = await pool.query(
      'INSERT INTO empleados_remotos (nombre, apellido, correo, contraseña, telefono, fecha_nacimiento) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido, correo, hashedPassword, telefono, fecha_nacimiento]
    );
    res.status(201).json({ message: 'Empleado remoto registrado', id: result.insertId });
  } catch (error) {
    console.error('Error al insertar empleado remoto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  const { correo, contraseña } = req.body;
  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, apellido, correo, contraseña FROM empleados_remotos WHERE correo = ?',
      [correo]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // Para simplicidad, no se usa token, solo se devuelve info usuario sin contraseña
    delete user.contraseña;
    res.json({ message: 'Login exitoso', usuario: user });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/registro-entrada', async (req, res) => {
  const { usuarioId } = req.body;
  if (!usuarioId) {
    return res.status(400).json({ error: 'ID de usuario es obligatorio' });
  }
  try {
    const fechaHoraActual = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
    const [result] = await pool.query(
      'INSERT INTO entradas_remotos (usuario_id, fecha_hora) VALUES (?, ?)',
      [usuarioId, fechaHoraActual]
    );
    res.status(201).json({ message: 'Entrada registrada', id: result.insertId });
  } catch (error) {
    console.error('Error al registrar entrada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/historial', (req, res) => {
  res.json(historial);
});

app.get('/api/historial-entradas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.nombre, e.apellido, r.fecha_hora
      FROM entradas_remotos r
      JOIN empleados_remotos e ON r.usuario_id = e.id
      ORDER BY r.fecha_hora DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener historial de entradas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT uid, identificacion, nombre, correo, telefono FROM empleados_remotos');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  const { uid, identificacion, nombre, correo, telefono } = req.body;
  if (!uid || !identificacion || !nombre) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    // Verificar si el UID ya existe
    const [existing] = await pool.query('SELECT uid FROM empleados_remotos WHERE uid = ?', [uid]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El UID ya está registrado' });
    }
    await pool.query(
      'INSERT INTO empleados_remotos (uid, identificacion, nombre, correo, telefono) VALUES (?, ?, ?, ?, ?)',
      [uid, identificacion, nombre, correo || null, telefono || null]
    );
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/usuarios/:uid', async (req, res) => {
  const { uid } = req.params;
  const { identificacion, nombre, correo, telefono } = req.body;
  if (!identificacion || !nombre) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE empleados_remotos SET identificacion = ?, nombre = ?, correo = ?, telefono = ? WHERE uid = ?',
      [identificacion, nombre, correo || null, telefono || null, uid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/usuarios/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM empleados_remotos WHERE uid = ?', [uid]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para accesos
app.get('/api/accesos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.uid, e.nombre, e.identificacion, r.timestamp
      FROM accesos r
      LEFT JOIN empleados_remotos e ON r.uid = e.uid
      ORDER BY r.timestamp DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener registros de acceso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
