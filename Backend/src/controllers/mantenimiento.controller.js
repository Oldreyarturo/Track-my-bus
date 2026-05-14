import pool from '../config/db.js';

export async function listarTipos(req, res, next) {
  try { res.json((await pool.query('SELECT * FROM tipos_mantenimiento ORDER BY categoria,nombre'))[0]); }
  catch(err) { next(err); }
}

export async function listarOrdenes(req, res, next) {
  const { unidad_id, estado } = req.query;
  let sql = `SELECT om.*,u.placa,u.numero_economico,tm.nombre as tipo_nombre,tm.categoria,
                    us.nombre as solicitado_por_nombre
             FROM ordenes_mantenimiento om
             JOIN unidades u  ON u.id=om.unidad_id
             JOIN tipos_mantenimiento tm ON tm.id=om.tipo_id
             JOIN usuarios us ON us.id=om.solicitado_por
             WHERE 1=1`;
  const params = [];
  if (unidad_id) { sql += ' AND om.unidad_id=?'; params.push(unidad_id); }
  if (estado)    { sql += ' AND om.estado=?';    params.push(estado); }
  sql += ' ORDER BY om.created_at DESC';
  try { res.json((await pool.query(sql, params))[0]); }
  catch(err) { next(err); }
}

export async function crearOrden(req, res, next) {
  const { unidad_id, tipo_id, prioridad, descripcion, km_actual, fecha_programada } = req.body;
  if (!unidad_id || !tipo_id)
    return res.status(400).json({ error: 'unidad_id y tipo_id son requeridos' });
  try {
    const [r] = await pool.query(
      `INSERT INTO ordenes_mantenimiento
       (unidad_id,tipo_id,solicitado_por,prioridad,descripcion,km_actual,fecha_programada)
       VALUES (?,?,?,?,?,?,?)`,
      [unidad_id, tipo_id, req.user.id, prioridad||'media', descripcion||null, km_actual||null, fecha_programada||null]
    );
    if (km_actual) {
      await pool.query('INSERT INTO bitacora_km (unidad_id,km_lectura,registrado_por) VALUES (?,?,?)',
        [unidad_id, km_actual, req.user.id]);
    }
    res.status(201).json({ id: r.insertId });
  } catch(err) { next(err); }
}

export async function actualizarEstado(req, res, next) {
  const { estado, notas_tecnico, costo } = req.body;
  const campos = { estado };
  if (notas_tecnico !== undefined) campos.notas_tecnico = notas_tecnico;
  if (costo !== undefined) campos.costo = costo;
  if (estado === 'en_proceso') campos.fecha_inicio = new Date();
  if (estado === 'completado') campos.fecha_fin = new Date();
  try {
    await pool.query('UPDATE ordenes_mantenimiento SET ? WHERE id=?', [campos, req.params.id]);
    res.json({ message: 'Orden actualizada' });
  } catch(err) { next(err); }
}

export async function alertas(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id,u.placa,u.numero_economico,bk.km_lectura as km_actual,
              tm.nombre as tipo,tm.intervalo_km,
              (tm.intervalo_km - (bk.km_lectura % tm.intervalo_km)) as km_restantes
       FROM unidades u
       JOIN (SELECT unidad_id, MAX(km_lectura) as km_lectura FROM bitacora_km GROUP BY unidad_id) bk ON bk.unidad_id=u.id
       CROSS JOIN tipos_mantenimiento tm
       WHERE tm.intervalo_km IS NOT NULL
         AND (tm.intervalo_km - (bk.km_lectura % tm.intervalo_km)) < 500
         AND u.activo=1
       ORDER BY km_restantes ASC`
    );
    res.json(rows);
  } catch(err) { next(err); }
}