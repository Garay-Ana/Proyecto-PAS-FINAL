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

app.get('/api/empleados-remotos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM empleados_remotos');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener empleados remotos:', error);
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

app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, uid, identificacion, nombre_completo, correo, telefono, rol, fecha_registro FROM usuarios');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error });
  }
});

app.post('/api/usuarios', async (req, res) => {
  const { uid, identificacion, nombre_completo, correo, telefono, rol } = req.body;
  if (!uid || !identificacion || !nombre_completo || !rol) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  if (telefono && telefono.length > 15) {
    return res.status(400).json({ error: 'El teléfono es demasiado largo' });
  }
  try {
    // Verificar si el UID ya existe
    const [existing] = await pool.query('SELECT uid FROM usuarios WHERE uid = ?', [uid]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El UID ya está registrado' });
    }
    await pool.query(
      'INSERT INTO usuarios (uid, identificacion, nombre_completo, correo, telefono, rol) VALUES (?, ?, ?, ?, ?, ?)',
      [uid, identificacion, nombre_completo, correo || null, telefono || null, rol]
    );
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/usuarios/:uid', async (req, res) => {
  const { uid } = req.params;
  const { identificacion, nombre_completo, correo, telefono, rol } = req.body;
  if (!identificacion || !nombre_completo || !rol) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET identificacion = ?, nombre_completo = ?, correo = ?, telefono = ?, rol = ? WHERE uid = ?',
      [identificacion, nombre_completo, correo || null, telefono || null, rol, uid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error });
  }
});

app.delete('/api/usuarios/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE uid = ?', [uid]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/accesos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.uid, r.usuario_id, r.timestamp, r.es_registrado, u.nombre_completo AS nombre
      FROM accesos r
      LEFT JOIN usuarios u ON r.usuario_id = u.uid
      ORDER BY r.timestamp DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener registros de acceso:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error });
  }
});

app.post('/api/asignar-tarjeta', async (req, res) => {
  const { gerenteUid, usuarioUid, tarjetaId } = req.body;
  if (!gerenteUid || !usuarioUid || !tarjetaId) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    // Verificar que el gerente existe y tiene rol 'gerente'
    const [gerenteRows] = await pool.query('SELECT rol FROM usuarios WHERE uid = ?', [gerenteUid]);
    if (gerenteRows.length === 0 || gerenteRows[0].rol !== 'gerente') {
      return res.status(403).json({ error: 'Acceso denegado: no es gerente' });
    }
    // Verificar que el usuario existe
    const [usuarioRows] = await pool.query('SELECT uid FROM usuarios WHERE uid = ?', [usuarioUid]);
    if (usuarioRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Aquí se debería hacer la asignación de la tarjeta al usuario
    // Por ejemplo, insertar en una tabla asignaciones_tarjetas (que habría que crear)
    await pool.query(
      'INSERT INTO asignaciones_tarjetas (usuario_uid, tarjeta_id, asignado_por, fecha_asignacion) VALUES (?, ?, ?, NOW())',
      [usuarioUid, tarjetaId, gerenteUid]
    );
    res.status(201).json({ message: 'Tarjeta asignada correctamente' });
  } catch (error) {
    console.error('Error al asignar tarjeta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const jwt = require('jsonwebtoken'); // Optional: for token generation if needed

// Registro de gerente
app.post('/api/gerentes/register', async (req, res) => {
  const { identificacion, nombre_completo, correo, telefono, password } = req.body;
  if (!identificacion || !nombre_completo || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    // Verificar si la identificación ya existe
    const [existingIdent] = await pool.query('SELECT identificacion FROM gerentes WHERE identificacion = ?', [identificacion]);
    if (existingIdent.length > 0) {
      return res.status(409).json({ error: 'La identificación ya está registrada' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO gerentes (identificacion, nombre_completo, correo, telefono, password) VALUES (?, ?, ?, ?, ?)',
      [identificacion, nombre_completo, correo || null, telefono || null, hashedPassword]
    );
    res.status(201).json({ message: 'Gerente registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar gerente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de gerente con JWT
app.post('/api/gerentes/login', async (req, res) => {
  const { identificacion, password } = req.body;
  if (!identificacion || !password) {
    return res.status(400).json({ error: 'Identificación y contraseña son obligatorios' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, identificacion, nombre_completo, correo, telefono, password FROM gerentes WHERE identificacion = ?',
      [identificacion]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    delete user.password;
    // Generar token JWT
    const token = jwt.sign({ id: user.id, identificacion: user.identificacion }, 'secret_key', { expiresIn: '1h' });
    res.json({ message: 'Login exitoso', gerente: user, token });
  } catch (error) {
    console.error('Error en login gerente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para la tabla tiempos

// Obtener todos los registros de tiempos
app.get('/api/tiempos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tiempos ORDER BY entrada DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tiempos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Procesar entrada o salida
app.post('/api/tiempos/process', async (req, res) => {
  const { uid, timestamp } = req.body;
  if (!uid || !timestamp) {
    return res.status(400).json({ error: 'Faltan datos obligatorios: uid y timestamp' });
  }
  try {
    // Buscar registro abierto (sin salida) para el uid
    const [openRecords] = await pool.query(
      'SELECT * FROM tiempos WHERE uid = ? AND salida IS NULL ORDER BY entrada DESC LIMIT 1',
      [uid]
    );

    if (openRecords.length === 0) {
      // No hay registro abierto, insertar nuevo con entrada = timestamp
      const [result] = await pool.query(
        'INSERT INTO tiempos (uid, entrada, salida) VALUES (?, ?, NULL)',
        [uid, timestamp]
      );
      const [newRecord] = await pool.query('SELECT * FROM tiempos WHERE id = ?', [result.insertId]);
      res.status(201).json(newRecord[0]);
    } else {
      // Hay registro abierto, actualizar salida con timestamp
      const openRecord = openRecords[0];
      await pool.query(
        'UPDATE tiempos SET salida = ? WHERE id = ?',
        [timestamp, openRecord.id]
      );
      const [updatedRecord] = await pool.query('SELECT * FROM tiempos WHERE id = ?', [openRecord.id]);
      res.json(updatedRecord[0]);
    }
  } catch (error) {
    console.error('Error al procesar tiempos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoints para gestión de horarios

// Obtener horarios por empleado
// Endpoints para la nueva tabla control_horarios

// Obtener todos los horarios
app.get('/api/control-horarios', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ch.*, 
        COALESCE(u.nombre_completo, er.nombre) AS nombre_completo
      FROM control_horarios ch
      LEFT JOIN usuarios u ON ch.empleado_id = u.id AND ch.tipo_empleado = 'usuario'
      LEFT JOIN empleados_remotos er ON ch.empleado_remoto_id = er.id AND ch.tipo_empleado = 'remoto'
      ORDER BY ch.fecha DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener control de horarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo horario
app.post('/api/control-horarios', async (req, res) => {
  const { empleado_id, tipo_empleado, fecha, hora_entrada, hora_salida, duracion } = req.body;
  if (!empleado_id || !tipo_empleado || !fecha || !hora_entrada || !hora_salida || !duracion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    // Validar existencia de empleado_id según tipo_empleado
    if (tipo_empleado === 'usuario') {
      const [usuarios] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [empleado_id]);
      if (usuarios.length === 0) {
        return res.status(400).json({ error: 'Usuario no encontrado' });
      }
    } else if (tipo_empleado === 'remoto') {
      const [remotos] = await pool.query('SELECT id FROM empleados_remotos WHERE id = ?', [empleado_id]);
      if (remotos.length === 0) {
        return res.status(400).json({ error: 'Empleado remoto no encontrado' });
      }
    } else {
      return res.status(400).json({ error: 'Tipo de empleado inválido' });
    }

    // Insertar en la columna correspondiente según tipo_empleado
    let query = '';
    let params = [];
    if (tipo_empleado === 'usuario') {
      query = 'INSERT INTO control_horarios (empleado_id, tipo_empleado, fecha, hora_entrada, hora_salida, duracion, creado_en) VALUES (?, ?, ?, ?, ?, ?, NOW())';
      params = [empleado_id, tipo_empleado, fecha, hora_entrada, hora_salida, duracion];
    } else {
      query = 'INSERT INTO control_horarios (empleado_remoto_id, tipo_empleado, fecha, hora_entrada, hora_salida, duracion, creado_en) VALUES (?, ?, ?, ?, ?, ?, NOW())';
      params = [empleado_id, tipo_empleado, fecha, hora_entrada, hora_salida, duracion];
    }

    const [result] = await pool.query(query, params);
    res.status(201).json({ id: result.insertId, empleado_id, tipo_empleado, fecha, hora_entrada, hora_salida, duracion });
  } catch (error) {
    console.error('Error al crear control de horario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Editar horario
app.put('/api/control-horarios/:id', async (req, res) => {
  const { id } = req.params;
  const { empleado_id, tipo_empleado, fecha, hora_entrada, hora_salida, duracion } = req.body;
  if (!empleado_id || !tipo_empleado || !fecha || !hora_entrada || !hora_salida || !duracion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    // Actualizar en la columna correspondiente según tipo_empleado
    let query = '';
    let params = [];
    if (tipo_empleado === 'usuario') {
      query = 'UPDATE control_horarios SET empleado_id = ?, tipo_empleado = ?, fecha = ?, hora_entrada = ?, hora_salida = ?, duracion = ? WHERE id = ?';
      params = [empleado_id, tipo_empleado, fecha, hora_entrada, hora_salida, duracion, id];
    } else {
      query = 'UPDATE control_horarios SET empleado_remoto_id = ?, tipo_empleado = ?, fecha = ?, hora_entrada = ?, hora_salida = ?, duracion = ? WHERE id = ?';
      params = [empleado_id, tipo_empleado, fecha, hora_entrada, hora_salida, duracion, id];
    }

    await pool.query(query, params);
    res.json({ id, empleado_id, tipo_empleado, fecha, hora_entrada, hora_salida, duracion });
  } catch (error) {
    console.error('Error al actualizar control de horario:', error);
    res.status(500).json({ error: 'Error al actualizar control de horario' });
  }
});

// Eliminar horario
app.delete('/api/control-horarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM control_horarios WHERE id = ?', [id]);
    res.json({ message: 'Control de horario eliminado' });
  } catch (error) {
    console.error('Error al eliminar control de horario:', error);
    res.status(500).json({ error: 'Error al eliminar control de horario' });
  }
});

app.get('/api/gerentes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, identificacion, nombre_completo, correo, telefono FROM gerentes');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener gerentes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
