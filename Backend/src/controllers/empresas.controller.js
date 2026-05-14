import pool from '../config/db.js';

export async function listar(req, res, next) {
  try { res.json((await pool.query('SELECT * FROM empresas WHERE activo=1 ORDER BY nombre'))[0]); }
  catch(err) { next(err); }
}
export async function obtener(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM empresas WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(rows[0]);
  } catch(err) { next(err); }
}
export async function crear(req, res, next) {
  const { nombre, rfc, telefono, email, logo_url } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
  try {
    const [r] = await pool.query(
      'INSERT INTO empresas (nombre,rfc,telefono,email,logo_url) VALUES (?,?,?,?,?)',
      [nombre, rfc||null, telefono||null, email||null, logo_url||null]
    );
    res.status(201).json({ id: r.insertId, nombre });
  } catch(err) { next(err); }
}
export async function actualizar(req, res, next) {
  const { nombre, rfc, telefono, email, logo_url } = req.body;
  try {
    await pool.query('UPDATE empresas SET nombre=?,rfc=?,telefono=?,email=?,logo_url=? WHERE id=?',
      [nombre, rfc, telefono, email, logo_url, req.params.id]);
    res.json({ message: 'Empresa actualizada' });
  } catch(err) { next(err); }
}
export async function desactivar(req, res, next) {
  try {
    await pool.query('UPDATE empresas SET activo=0 WHERE id=?', [req.params.id]);
    res.json({ message: 'Empresa desactivada' });
  } catch(err) { next(err); }
}
export async function listarOperadores(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id,u.nombre,u.apellidos,u.email,oe.cargo
       FROM operadores_empresas oe JOIN usuarios u ON u.id=oe.usuario_id
       WHERE oe.empresa_id=?`, [req.params.id]
    );
    res.json(rows);
  } catch(err) { next(err); }
}
export async function asignarOperador(req, res, next) {
  const { usuario_id, cargo } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido' });
  try {
    await pool.query('INSERT IGNORE INTO operadores_empresas (usuario_id,empresa_id,cargo) VALUES (?,?,?)',
      [usuario_id, req.params.id, cargo||null]);
    res.status(201).json({ message: 'Operador asignado' });
  } catch(err) { next(err); }
}