import pool from '../config/db.js';

export async function listar(req, res, next) {
  const { ruta_id } = req.query;
  if (!ruta_id) return res.status(400).json({ error: 'ruta_id es requerido' });
  try { res.json((await pool.query('SELECT * FROM paradas WHERE ruta_id=? ORDER BY orden', [ruta_id]))[0]); }
  catch(err) { next(err); }
}
export async function crear(req, res, next) {
  const { ruta_id, nombre, orden, latitud, longitud, es_terminal, accesible } = req.body;
  if (!ruta_id || !nombre || orden==null || !latitud || !longitud)
    return res.status(400).json({ error: 'ruta_id, nombre, orden, latitud y longitud son requeridos' });
  try {
    const [r] = await pool.query(
      `INSERT INTO paradas (ruta_id,nombre,orden,latitud,longitud,es_terminal,accesible) VALUES (?,?,?,?,?,?,?)`,
      [ruta_id, nombre, orden, latitud, longitud, es_terminal?1:0, accesible?1:0]
    );
    res.status(201).json({ id: r.insertId });
  } catch(err) { next(err); }
}
export async function actualizar(req, res, next) {
  const { nombre, orden, latitud, longitud, es_terminal, accesible } = req.body;
  try {
    await pool.query('UPDATE paradas SET nombre=?,orden=?,latitud=?,longitud=?,es_terminal=?,accesible=? WHERE id=?',
      [nombre, orden, latitud, longitud, es_terminal?1:0, accesible?1:0, req.params.id]);
    res.json({ message: 'Parada actualizada' });
  } catch(err) { next(err); }
}
export async function eliminar(req, res, next) {
  try {
    await pool.query('DELETE FROM paradas WHERE id=?', [req.params.id]);
    res.json({ message: 'Parada eliminada' });
  } catch(err) { next(err); }
}