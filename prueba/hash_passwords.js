const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function hashPasswords() {
  const pool = mysql.createPool({
    host: 'bn7j0bwyqvaappo6c1i3-mysql.services.clever-cloud.com',
    user: 'uxkuoqgy1dvfmnao',
    password: 'tebjKip3puV82pFVKN7U',
    database: 'bn7j0bwyqvaappo6c1i3',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const [rows] = await pool.query('SELECT id, contraseña FROM empleados_remotos');
    for (const row of rows) {
      const hashed = await bcrypt.hash(row.contraseña, 10);
      await pool.query('UPDATE empleados_remotos SET contraseña = ? WHERE id = ?', [hashed, row.id]);
      console.log(`Contraseña del usuario ${row.id} actualizada.`);
    }
    console.log('Todas las contraseñas han sido cifradas.');
  } catch (error) {
    console.error('Error al cifrar contraseñas:', error);
  } finally {
    await pool.end();
  }
}

hashPasswords();
