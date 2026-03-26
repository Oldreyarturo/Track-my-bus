import pool from '../config/db.js';

export async function listar(req, res, next) {
  const { ruta_id, dia_semana } = req.query;
  let sql = 'SELECT * FROM horarios WHERE 1=1';
  const params = [];
  if (ruta_id)    { sql += ' AND ruta_id=?';    params.push(ruta_id); }
  if (dia_semana) { sql += ' AND dia_semana=?'; params.push(dia_semana); }
  sql += ' ORDER BY dia_semana, hora_salida';
  try { res.json((await pool.query(sql, params))[0]); }
  catch(err) { next(err); }
}
export async function crear(req, res, next) {
  const { ruta_id, dia_semana, hora_salida, hora_llegada, es_hora_pico } = req.body;
  if (!ruta_id || !dia_semana || !hora_salida || !hora_llegada)
    return res.status(400).json({ error: 'ruta_id, dia_semana, hora_salida y hora_llegada son requeridos' });
  try {
    const [r] = await pool.query(
      'INSERT INTO horarios (ruta_id,dia_semana,hora_salida,hora_llegada,es_hora_pico) VALUES (?,?,?,?,?)',
      [ruta_id, dia_semana, hora_salida, hora_llegada, es_hora_pico?1:0]
    );
    res.status(201).json({ id: r.insertId });
  } catch(err) { next(err); }
}
export async function eliminar(req, res, next) {
  try {
    await pool.query('DELETE FROM horarios WHERE id=?', [req.params.id]);
    res.json({ message: 'Horario eliminado' });
  } catch(err) { next(err); }
}