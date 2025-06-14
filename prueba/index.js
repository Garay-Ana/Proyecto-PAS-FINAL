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

app.post('/api/registro-asistencia', async (req, res) => {
  const { uid, tipo } = req.body; // tipo puede ser 'usuario' o 'remoto'
  if (!uid || !tipo) return res.status(400).json({ error: 'UID y tipo son requeridos' });

  try {
    // Obtener empleado según el tipo
    let empleado;
    if (tipo === 'usuario') {
      [empleado] = await pool.query('SELECT id FROM usuarios WHERE uid = ?', [uid]);
    } else if (tipo === 'remoto') {
      [empleado] = await pool.query('SELECT id FROM empleados_remotos WHERE uid = ?', [uid]);
    } else {
      return res.status(400).json({ error: 'Tipo de empleado inválido' });
    }

    if (empleado.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const empleadoId = empleado[0].id;
    const now = moment().tz('America/Bogota');
    const fecha = now.format('YYYY-MM-DD');
    const hora = now.format('HH:mm:ss');

    // Buscar registro abierto
    const [openRecord] = await pool.query(
      `SELECT id FROM control_horarios 
       WHERE ${tipo === 'usuario' ? 'empleado_id' : 'empleado_remoto_id'} = ? 
       AND fecha = ? AND hora_salida IS NULL 
       ORDER BY hora_entrada DESC LIMIT 1`,
      [empleadoId, fecha]
    );

    if (openRecord.length > 0) {
      // Registrar salida
      await pool.query(
        'UPDATE control_horarios SET hora_salida = ?, duración = TIMESTAMPDIFF(MINUTE, hora_entrada, ?) WHERE id = ?',
        [hora, hora, openRecord[0].id]
      );
      return res.json({ message: 'Salida registrada', empleadoId, fecha, hora });
    } else {
      // Registrar entrada
      const [result] = await pool.query(
        'INSERT INTO control_horarios (empleado_id, empleado_remoto_id, tipo_empleado, fecha, hora_entrada) VALUES (?, ?, ?, ?, ?)',
        [
          tipo === 'usuario' ? empleadoId : null,
          tipo === 'remoto' ? empleadoId : null,
          tipo,
          fecha,
          hora
        ]
      );
      return res.json({ message: 'Entrada registrada', empleadoId, fecha, hora });
    }
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
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
      SELECT r.id, r.uid, r.usuario_id, DATE_FORMAT(r.timestamp, '%Y-%m-%d %H:%i:%s') AS timestamp, r.es_registrado, u.nombre_completo AS nombre
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
  const { tipo_empleado, empleado_id, fecha_inicio, fecha_fin } = req.query;

  try {
    let query = `
      SELECT ch.*, 
        CASE
          WHEN ch.tipo_empleado = 'usuario' THEN u.nombre_completo
          WHEN ch.tipo_empleado = 'remoto' THEN CONCAT(er.nombre, ' ', er.apellido)
        END AS nombre_empleado
      FROM control_horarios ch
      LEFT JOIN usuarios u ON ch.empleado_id = u.id AND ch.tipo_empleado = 'usuario'
      LEFT JOIN empleados_remotos er ON ch.empleado_remoto_id = er.id AND ch.tipo_empleado = 'remoto'
      WHERE 1=1
    `;
    const params = [];

    // Filtros opcionales
    if (tipo_empleado) {
      query += ' AND ch.tipo_empleado = ?';
      params.push(tipo_empleado);
    }

    if (empleado_id) {
      query += ' AND (ch.empleado_id = ? OR ch.empleado_remoto_id = ?)';
      params.push(empleado_id, empleado_id);
    }

    if (fecha_inicio && fecha_fin) {
      query += ' AND ch.fecha BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += ' ORDER BY ch.fecha DESC, ch.hora_entrada DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener control de horarios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalle: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Crear nuevo horario
app.post('/api/control-horarios', async (req, res) => {
  console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));

  try {
    // Validación de campos requeridos
    const requiredFields = {
      'tipo_empleado': "'usuario' o 'remoto'",
      'fecha': 'Formato YYYY-MM-DD',
      'hora_entrada': 'Formato HH:MM:SS'
    };

    const missingFields = Object.keys(requiredFields).filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        detalles: missingFields.map(field => ({
          campo: field,
          descripcion: requiredFields[field]
        })),
        datos_recibidos: req.body
      });
    }

    // Validación de tipo de empleado
    if (!['usuario', 'remoto'].includes(req.body.tipo_empleado)) {
      return res.status(400).json({
        error: 'Tipo de empleado inválido',
        valores_aceptados: ['usuario', 'remoto'],
        valor_recibido: req.body.tipo_empleado
      });
    }

    // Configuración según tipo de empleado
    const empleadoConfig = {
      idField: req.body.tipo_empleado === 'usuario' ? 'empleado_id' : 'empleado_remoto_id',
      tableName: req.body.tipo_empleado === 'usuario' ? 'usuarios' : 'empleados_remotos'
    };

    // Validar ID de empleado
    if (!req.body[empleadoConfig.idField]) {
      return res.status(400).json({
        error: 'ID de empleado faltante',
        campo_requerido: empleadoConfig.idField,
        tipo_empleado: req.body.tipo_empleado
      });
    }

    // Verificar que el empleado existe
    const [empleado] = await pool.query(
      `SELECT id FROM ${empleadoConfig.tableName} WHERE id = ?`,
      [req.body[empleadoConfig.idField]]
    );

    if (empleado.length === 0) {
      return res.status(404).json({
        error: 'Empleado no encontrado',
        [empleadoConfig.idField]: req.body[empleadoConfig.idField],
        tabla_buscada: empleadoConfig.tableName
      });
    }

    // Validación de formatos de fecha y hora
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.fecha)) {
      return res.status(400).json({
        error: 'Formato de fecha inválido',
        formato_requerido: 'YYYY-MM-DD',
        fecha_recibida: req.body.fecha
      });
    }

    if (!/^\d{2}:\d{2}:\d{2}$/.test(req.body.hora_entrada)) {
      return res.status(400).json({
        error: 'Formato de hora entrada inválido',
        formato_requerido: 'HH:MM:SS',
        hora_recibida: req.body.hora_entrada
      });
    }

    if (req.body.hora_salida && !/^\d{2}:\d{2}:\d{2}$/.test(req.body.hora_salida)) {
      return res.status(400).json({
        error: 'Formato de hora salida inválido',
        formato_requerido: 'HH:MM:SS',
        hora_recibida: req.body.hora_salida
      });
    }

    // Calcular duración si hay hora_salida
    let duracion = null;
    if (req.body.hora_salida) {
      try {
        const entrada = moment(req.body.hora_entrada, 'HH:mm:ss');
        const salida = moment(req.body.hora_salida, 'HH:mm:ss');
        const diffMinutes = salida.diff(entrada, 'minutes');
        
        if (diffMinutes < 0) {
          return res.status(400).json({
            error: 'La hora de salida debe ser posterior a la hora de entrada',
            hora_entrada: req.body.hora_entrada,
            hora_salida: req.body.hora_salida
          });
        }

        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        duracion = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
      } catch (error) {
        console.error('Error calculando duración:', error);
        return res.status(400).json({
          error: 'Error al calcular duración',
          detalles: 'Formato de hora inválido'
        });
      }
    }

    // Preparar datos para inserción
    const horarioData = {
      empleado_id: req.body.tipo_empleado === 'usuario' ? req.body.empleado_id : null,
      empleado_remoto_id: req.body.tipo_empleado === 'remoto' ? req.body.empleado_remoto_id : null,
      tipo_empleado: req.body.tipo_empleado,
      fecha: req.body.fecha,
      hora_entrada: req.body.hora_entrada,
      hora_salida: req.body.hora_salida || null,
      duracion: duracion
    };

    // Para evitar error de clave foránea, si empleado_id es null y tipo_empleado es remoto, asignar NULL explícito
    if (horarioData.empleado_id === 0) {
      horarioData.empleado_id = null;
    }

    console.log('Datos preparados para inserción:', horarioData);

    // Ejecutar inserción
    const [result] = await pool.query('INSERT INTO control_horarios SET ?', [horarioData]);

    // Obtener el registro recién creado
    const [nuevoHorario] = await pool.query(`
      SELECT ch.*, 
        CASE
          WHEN ch.tipo_empleado = 'usuario' THEN u.nombre_completo
          WHEN ch.tipo_empleado = 'remoto' THEN CONCAT(er.nombre, ' ', er.apellido)
        END AS nombre_empleado
      FROM control_horarios ch
      LEFT JOIN usuarios u ON ch.empleado_id = u.id AND ch.tipo_empleado = 'usuario'
      LEFT JOIN empleados_remotos er ON ch.empleado_remoto_id = er.id AND ch.tipo_empleado = 'remoto'
      WHERE ch.id = ?
    `, [result.insertId]);

    console.log('Horario guardado exitosamente:', nuevoHorario[0]);

    return res.status(201).json({
      success: true,
      message: 'Horario guardado correctamente',
      data: nuevoHorario[0]
    });

  } catch (error) {
    console.error('Error al guardar horario:', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
        sql: error.sql
      },
      body: req.body
    });

    const responseError = {
      error: 'Error al guardar horario',
      detalles: process.env.NODE_ENV === 'development' ? error.message : null
    };

    // Manejar errores específicos de MySQL
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      responseError.detalles = 'El empleado referenciado no existe en la base de datos';
    } else if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
      responseError.detalles = 'Formato de fecha u hora incorrecto';
    } else if (error.code === 'ER_DUP_ENTRY') {
      responseError.detalles = 'Registro duplicado';
    }

    res.status(500).json({ error: 'Error interno del servidor', detalle: error });
  }
});
// Editar horario
app.put('/api/control-horarios/:id', async (req, res) => {
  const { id } = req.params;
  const { hora_salida } = req.body; // Ahora solo necesitamos actualizar la hora de salida

  if (!hora_salida) {
    return res.status(400).json({ error: 'hora_salida es requerida' });
  }

  try {
    // Obtener el registro existente
    const [registro] = await pool.query('SELECT * FROM control_horarios WHERE id = ?', [id]);
    if (registro.length === 0) {
      return res.status(404).json({ error: 'Registro de horario no encontrado' });
    }

    const hora_entrada = registro[0].hora_entrada;
    
    // Calcular duración en formato "XXh XXm"
    const entrada = moment(hora_entrada, 'HH:mm:ss');
    const salida = moment(hora_salida, 'HH:mm:ss');
    const diffMinutes = salida.diff(entrada, 'minutes');
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    const duracion = `${hours}h ${minutes}m`;

    // Actualizar solo hora_salida y duración
    await pool.query(
      'UPDATE control_horarios SET hora_salida = ?, duración = ? WHERE id = ?',
      [hora_salida, duracion, id]
    );

    // Obtener el registro actualizado
    const [updated] = await pool.query('SELECT * FROM control_horarios WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Horario actualizado exitosamente',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    res.status(500).json({ 
      error: 'Error al actualizar horario',
      detalles: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Eliminar horario
app.delete('/api/control-horarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar que el registro existe
    const [existing] = await pool.query('SELECT * FROM control_horarios WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Registro de horario no encontrado' });
    }

    await pool.query('DELETE FROM control_horarios WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Control de horario eliminado exitosamente',
      registro_eliminado: existing[0]
    });
  } catch (error) {
    console.error('Error al eliminar control de horario:', error);
    res.status(500).json({ 
      error: 'Error al eliminar control de horario',
      detalle: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});
const TIMEZONE = 'America/Bogota';

// Endpoint POST para registrar asistencia por RFID
app.post('/api/asistencia/rfid', async (req, res) => {
  console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));

  try {
    if (!req.body.uid) {
      return res.status(400).json({
        error: 'UID requerido',
        status: 'UID_FALTANTE'
      });
    }

    const timestamp = moment().tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
    const horaActual = moment().tz(TIMEZONE).format('HH:mm:ss');
    const fechaActual = moment().tz(TIMEZONE).format('YYYY-MM-DD');

    // 1. Registrar el acceso en accesos (equivalente a rfid_registros)
    const [accesoResult] = await pool.query(
      `INSERT INTO accesos SET ?`,
      {
        uid: req.body.uid,
        timestamp: timestamp,
        es_registrado: 0 // Temporalmente 0 hasta verificar
      }
    );

    // 2. Buscar usuario asociado al UID
    const [usuario] = await pool.query(`
      SELECT u.*, h.hora_inicio1, h.hora_inicio2, h.hora_fin1, h.hora_fin2 
      FROM usuarios u
      LEFT JOIN horarios h ON u.horario_id = h.id
      WHERE u.uid = ? AND u.activo = 1
      LIMIT 1
    `, [req.body.uid]);

    if (usuario.length === 0) {
      console.log('UID no registrado:', req.body.uid);
      return res.status(200).json({
        status: 'UID_NO_REGISTRADO',
        message: 'Tarjeta no asociada a usuario activo'
      });
    }

    const usuarioData = usuario[0];

    // 3. Buscar registros del día actual para determinar si es entrada o salida
    const [registrosHoy] = await pool.query(`
      SELECT tipo_registro, timestamp 
      FROM control_horarios 
      WHERE usuario_id = ? AND DATE(timestamp) = ?
      ORDER BY timestamp DESC
    `, [usuarioData.id, fechaActual]);

    // Determinar si es entrada o salida
    let esEntrada = true;
    let ultimaEntrada = null;
    
    if (registrosHoy.length > 0) {
      // Verificar si el último registro es una entrada sin salida
      const ultimoRegistro = registrosHoy[0];
      esEntrada = ultimoRegistro.tipo_registro === 'salida';
      
      // Si el último registro es una entrada, guardamos su timestamp
      if (!esEntrada) {
        ultimaEntrada = ultimoRegistro.timestamp;
      }
    }

    const tipoRegistro = esEntrada ? 'entrada' : 'salida';

    // 4. Insertar en control_horarios
    const horarioData = {
      usuario_id: usuarioData.id,
      timestamp: timestamp,
      tipo_registro: tipoRegistro,
      es_registrado: 1
    };

    // Variables para la respuesta
    let diferenciaTiempo = null;
    let duracionTurno = null;
    let estado = null;

    if (esEntrada) {
      // Calcular diferencia para entrada
      if (usuarioData.hora_inicio1) {
        const horaReferencia = determinarHoraReferencia(usuarioData, horaActual);
        diferenciaTiempo = calcularDiferencia(horaReferencia, horaActual);
        estado = determinarEstado(diferenciaTiempo);
        horarioData.diferencia_tiempo = diferenciaTiempo;
        horarioData.estado = estado;
      }
    } else {
      // Calcular duración del turno si es salida
      if (ultimaEntrada) {
        duracionTurno = calcularDuracion(
          moment(ultimaEntrada).format('HH:mm:ss'),
          horaActual
        );
        horarioData.duracion = duracionTurno;
        
        // También podemos calcular horas trabajadas exactas
        const horasTrabajadas = moment.duration(moment(horaActual, 'HH:mm:ss').diff(moment(ultimaEntrada).format('HH:mm:ss'), 'HH:mm:ss'));
        horarioData.horas_trabajadas = horasTrabajadas.asHours().toFixed(2);
      }
    }

    const [horarioResult] = await pool.query(
      `INSERT INTO control_horarios SET ?`,
      horarioData
    );

    // 5. Actualizar accesos con control_horario_id y usuario_id
    await pool.query(
      `UPDATE accesos SET 
          usuario_id = ?,
          control_horario_id = ?,
          es_registrado = 1
       WHERE id = ?`,
      [usuarioData.id, horarioResult.insertId, accesoResult.insertId]
    );

    // 6. Si es salida, actualizar el registro de entrada con la duración
    if (!esEntrada && ultimaEntrada) {
      await pool.query(
        `UPDATE control_horarios SET 
            duracion = ?,
            horas_trabajadas = ?
         WHERE usuario_id = ? AND timestamp = ? AND tipo_registro = 'entrada'`,
        [duracionTurno, horarioData.horas_trabajadas, usuarioData.id, ultimaEntrada]
      );
    }

    // Respuesta mejorada
    const response = {
      success: true,
      registro: {
        tipo: tipoRegistro,
        usuario: usuarioData.nombre_completo || `${usuarioData.nombre} ${usuarioData.apellido}`,
        timestamp: timestamp,
        diferencia: diferenciaTiempo,
        duracion: duracionTurno,
        estado: estado,
        horas_trabajadas: horarioData.horas_trabajadas,
        pendiente_salida: esEntrada // Indica si hay una entrada pendiente de salida
      }
    };

    // Si es entrada, verificar si hay salidas pendientes de días anteriores
    if (esEntrada) {
      const [salidasPendientes] = await pool.query(`
        SELECT COUNT(*) as pendientes 
        FROM control_horarios 
        WHERE usuario_id = ? AND tipo_registro = 'entrada' AND 
              DATE(timestamp) < ? AND 
              NOT EXISTS (
                SELECT 1 FROM control_horarios 
                WHERE usuario_id = ? AND tipo_registro = 'salida' AND 
                      DATE(timestamp) = DATE(control_horarios.timestamp)
              )
      `, [usuarioData.id, fechaActual, usuarioData.id]);

      if (salidasPendientes[0].pendientes > 0) {
        response.alert = `Tienes ${salidasPendientes[0].pendientes} salidas pendientes de días anteriores`;
      }
    }

    return res.status(201).json(response);

  } catch (error) {
    console.error('Error en registro RFID:', error);
    return res.status(500).json({
      error: 'Error en el servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Funciones auxiliares mejoradas
function determinarHoraReferencia(usuario, horaActual) {
  if (!usuario.hora_inicio1) return null;
  
  const actual = moment(horaActual, 'HH:mm:ss');
  const entrada1 = moment(usuario.hora_inicio1, 'HH:mm:ss');
  
  // Si solo tiene un horario de entrada
  if (!usuario.hora_inicio2) {
    return usuario.hora_inicio1;
  }
  
  const entrada2 = moment(usuario.hora_inicio2, 'HH:mm:ss');
  const diff1 = actual.diff(entrada1, 'minutes');
  const diff2 = actual.diff(entrada2, 'minutes');

  return (diff1 >= 0 && (diff1 <= diff2 || diff2 < 0)) 
      ? usuario.hora_inicio1 
      : usuario.hora_inicio2;
}

function calcularDiferencia(referencia, actual) {
  if (!referencia) return 'Sin horario de referencia';
  
  const ref = moment(referencia, 'HH:mm:ss');
  const act = moment(actual, 'HH:mm:ss');
  const minutos = act.diff(ref, 'minutes');
  
  return minutos === 0 ? 'A tiempo' : 
         minutos < 0 ? `${Math.abs(minutos)} min temprano` : 
         `${minutos} min tarde`;
}

function determinarEstado(diferencia) {
  if (typeof diferencia !== 'string') return 'Presente';
  
  const minutosMatch = diferencia.match(/(\d+) min tarde/);
  if (!minutosMatch) return 'Presente';
  
  const minutosTarde = parseInt(minutosMatch[1]);
  return minutosTarde > 5 ? 'Tarde' : 'Presente';
}

function calcularDuracion(inicio, fin) {
  const inicioMoment = moment(inicio, 'HH:mm:ss');
  const finMoment = moment(fin, 'HH:mm:ss');
  
  // Calcular diferencia en milisegundos
  const diffMs = finMoment.diff(inicioMoment);
  
  // Convertir a horas, minutos, segundos
  const duration = moment.duration(diffMs);
  const horas = Math.floor(duration.asHours());
  const minutos = duration.minutes();
  const segundos = duration.seconds();
  
  // Formatear según necesidad
  if (horas > 0) {
    return `${horas}h ${minutos}m ${segundos}s`;
  } else if (minutos > 0) {
    return `${minutos}m ${segundos}s`;
  } else {
    return `${segundos}s`;
  }
}

app.get('/api/asistencia/rfid', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.uid, a.usuario_id, a.timestamp, a.es_registrado, 
        u.nombre_completo AS usuario_nombre,
        ch.duracion
      FROM accesos a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN control_horarios ch ON a.control_horario_id = ch.id
      ORDER BY a.timestamp DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener registros de asistencia RFID:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});

