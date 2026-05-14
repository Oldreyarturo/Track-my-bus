import pool from '../config/db.js';

export async function diario(req, res, next) {
  const { ruta_id, desde, hasta } = req.query;
  let sql = `SELECT ad.*,r.nombre as ruta,u.placa FROM analytics_diarios ad
             JOIN rutas r    ON r.id=ad.ruta_id
             JOIN unidades u ON u.id=ad.unidad_id WHERE 1=1`;
  const params = [];
  if (ruta_id) { sql += ' AND ad.ruta_id=?'; params.push(ruta_id); }
  if (desde)   { sql += ' AND ad.fecha>=?';  params.push(desde); }
  if (hasta)   { sql += ' AND ad.fecha<=?';  params.push(hasta); }
  sql += ' ORDER BY ad.fecha DESC LIMIT 500';
  try { res.json((await pool.query(sql, params))[0]); }
  catch(err) { next(err); }
}

export async function demanda(req, res, next) {
  const { parada_id } = req.query;
  if (!parada_id) return res.status(400).json({ error: 'parada_id es requerido' });
  try {
    const [rows] = await pool.query(
      `SELECT dp.*,p.nombre as parada FROM demanda_paradas dp
       JOIN paradas p ON p.id=dp.parada_id
       WHERE dp.parada_id=? ORDER BY dp.dia_semana,dp.franja_hora`,
      [parada_id]
    );
    res.json(rows);
  } catch(err) { next(err); }
}

export async function resumen(req, res, next) {
  try {
    const [[unidades]]    = await pool.query('SELECT COUNT(*) as total FROM unidades WHERE activo=1');
    const [[rutas]]       = await pool.query('SELECT COUNT(*) as total FROM rutas WHERE activo=1');
    const [[activas]]     = await pool.query('SELECT COUNT(*) as total FROM posicion_actual WHERE conductor_activo=1');
    const [[incidencias]] = await pool.query('SELECT COUNT(*) as total FROM incidencias WHERE activa=1');
    const [[boletosHoy]]  = await pool.query("SELECT COUNT(*) as total FROM boletos WHERE DATE(created_at)=CURDATE()");
    res.json({ unidades_totales: unidades.total, rutas_activas: rutas.total,
               unidades_en_ruta: activas.total, incidencias_activas: incidencias.total,
               boletos_hoy: boletosHoy.total });
  } catch(err) { next(err); }
}

export async function velocidades(req, res, next) {
  const { ruta_id } = req.query;
  if (!ruta_id) return res.status(400).json({ error: 'ruta_id es requerido' });
  try {
    const [rows] = await pool.query(
      'SELECT * FROM velocidades_tramo WHERE ruta_id=? ORDER BY franja_hora,dia_semana', [ruta_id]
    );
    res.json(rows);
  } catch(err) { next(err); }
}