import pool from '../config/db.js';

export async function listar(req, res, next) {
  const { activo } = req.query;
  let sql = `SELECT a.*,u.nombre as conductor,un.placa,un.numero_economico,r.nombre as ruta
             FROM asignaciones a
             JOIN usuarios u  ON u.id=a.conductor_id
             JOIN unidades un ON un.id=a.unidad_id
             JOIN rutas r     ON r.id=a.ruta_id
             WHERE 1=1`;
  const params = [];
  if (activo !== undefined) { sql += ' AND a.activo=?'; params.push(activo==='true'?1:0); }
  sql += ' ORDER BY a.inicio DESC';
  try { res.json((await pool.query(sql, params))[0]); }
  catch(err) { next(err); }
}

export async function crear(req, res, next) {
  const { unidad_id, conductor_id, ruta_id } = req.body;
  if (!unidad_id || !conductor_id || !ruta_id)
    return res.status(400).json({ error: 'unidad_id, conductor_id y ruta_id son requeridos' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE asignaciones SET activo=0, fin=NOW() WHERE unidad_id=? AND activo=1', [unidad_id]);
    const [r] = await conn.query(
      'INSERT INTO asignaciones (unidad_id,conductor_id,ruta_id,inicio,activo) VALUES (?,?,?,NOW(),1)',
      [unidad_id, conductor_id, ruta_id]
    );
    await conn.commit();
    res.status(201).json({ id: r.insertId, message: 'Asignación creada' });
  } catch(err) { await conn.rollback(); next(err); }
  finally { conn.release(); }
}

export async function cerrar(req, res, next) {
  try {
    await pool.query('UPDATE asignaciones SET activo=0, fin=NOW() WHERE id=?', [req.params.id]);
    res.json({ message: 'Asignación cerrada' });
  } catch(err) { next(err); }
}