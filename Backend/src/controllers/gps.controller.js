import pool from '../config/db.js';

export async function ping(req, res, next) {
  const { unidad_id, latitud, longitud, velocidad_kmh, rumbo, conductor_activo } = req.body;
  if (!unidad_id || !latitud || !longitud)
    return res.status(400).json({ error: 'unidad_id, latitud y longitud son requeridos' });
  try {
    await pool.query(
      `INSERT INTO posicion_actual (unidad_id,latitud,longitud,velocidad_kmh,rumbo,conductor_activo)
       VALUES (?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE latitud=VALUES(latitud),longitud=VALUES(longitud),
         velocidad_kmh=VALUES(velocidad_kmh),rumbo=VALUES(rumbo),
         conductor_activo=VALUES(conductor_activo),updated_at=NOW()`,
      [unidad_id, latitud, longitud, velocidad_kmh||0, rumbo||null, conductor_activo?1:0]
    );
    const [asig] = await pool.query(
      'SELECT id FROM asignaciones WHERE unidad_id=? AND activo=1 LIMIT 1', [unidad_id]
    );
    await pool.query(
      `INSERT INTO historial_posiciones (unidad_id,asignacion_id,latitud,longitud,velocidad_kmh,rumbo)
       VALUES (?,?,?,?,?,?)`,
      [unidad_id, asig[0]?.id||null, latitud, longitud, velocidad_kmh||0, rumbo||null]
    );
    res.json({ ok: true });
  } catch(err) { next(err); }
}

export async function live(req, res, next) {
  const { ruta_id } = req.query;
  let sql = `SELECT pa.*,u.numero_economico,u.placa,a.ruta_id,r.nombre as ruta,r.color_hex
             FROM posicion_actual pa
             JOIN unidades u    ON u.id=pa.unidad_id
             LEFT JOIN asignaciones a ON a.unidad_id=pa.unidad_id AND a.activo=1
             LEFT JOIN rutas r  ON r.id=a.ruta_id
             WHERE pa.conductor_activo=1`;
  const params = [];
  if (ruta_id) { sql += ' AND a.ruta_id=?'; params.push(ruta_id); }
  try { res.json((await pool.query(sql, params))[0]); }
  catch(err) { next(err); }
}

export async function historial(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT latitud,longitud,velocidad_kmh,rumbo,registrado_at
       FROM historial_posiciones
       WHERE unidad_id=? AND registrado_at >= NOW() - INTERVAL 2 HOUR
       ORDER BY registrado_at DESC`,
      [req.params.unidad_id]
    );
    res.json(rows);
  } catch(err) { next(err); }
}