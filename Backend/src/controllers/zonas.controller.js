import pool from '../config/db.js';

export async function listar(req, res, next) {
  try { res.json((await pool.query('SELECT * FROM zonas ORDER BY nombre'))[0]); }
  catch(err) { next(err); }
}
export async function crear(req, res, next) {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
  try {
    const [r] = await pool.query('INSERT INTO zonas (nombre,descripcion) VALUES (?,?)', [nombre, descripcion||null]);
    res.status(201).json({ id: r.insertId, nombre });
  } catch(err) { next(err); }
}
export async function actualizar(req, res, next) {
  const { nombre, descripcion } = req.body;
  try {
    await pool.query('UPDATE zonas SET nombre=?,descripcion=? WHERE id=?', [nombre, descripcion, req.params.id]);
    res.json({ message: 'Zona actualizada' });
  } catch(err) { next(err); }
}
export async function eliminar(req, res, next) {
  try {
    await pool.query('DELETE FROM zonas WHERE id=?', [req.params.id]);
    res.json({ message: 'Zona eliminada' });
  } catch(err) { next(err); }
}