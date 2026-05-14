import pool from '../config/db.js';

export async function listar(req, res, next) {
  try {
    const { ruta_id, unidad_id, activa } = req.query;
    let sql = `
      SELECT i.*, 
        u.numero_economico, u.placa,
        r.nombre as ruta,
        CONCAT(us.nombre, ' ', COALESCE(us.apellidos,'')) as reportado_por_nombre
      FROM incidencias i
      LEFT JOIN unidades u ON u.id = i.unidad_id
      LEFT JOIN rutas r ON r.id = i.ruta_id
      JOIN usuarios us ON us.id = i.reportado_por
      WHERE 1=1
    `;
    const params = [];  
    if (ruta_id)  { sql += ' AND i.ruta_id=?';  params.push(ruta_id); }
    if (unidad_id){ sql += ' AND i.unidad_id=?'; params.push(unidad_id); }
    if (activa !== undefined) { sql += ' AND i.activa=?'; params.push(activa === 'true' ? 1 : 0); }
    sql += ' ORDER BY i.created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch(err) { next(err); }
}

export async function crear(req, res, next) {
  const { unidad_id, ruta_id, tipo, descripcion, latitud, longitud } = req.body;
  if (!tipo) return res.status(400).json({ error: 'El tipo es requerido' });
  try {
    const [r] = await pool.query(
      `INSERT INTO incidencias (unidad_id, ruta_id, reportado_por, tipo, descripcion, latitud, longitud)
       VALUES (?,?,?,?,?,?,?)`,
      [unidad_id||null, ruta_id||null, req.user.id, tipo, descripcion||null, latitud||null, longitud||null]
    );
    res.status(201).json({ id: r.insertId, message: 'Incidencia reportada' });
  } catch(err) { next(err); }
}

export async function resolver(req, res, next) {
  try {
    await pool.query(
      `UPDATE incidencias SET activa=0, resuelta_at=NOW() WHERE id=?`,
      [req.params.id]
    );
    res.json({ message: 'Incidencia resuelta' });
  } catch(err) { next(err); }
}
