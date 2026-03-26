import pool from '../config/db.js';

export async function calcular(req, res, next) {
  const { unidad_id, parada_id } = req.query;
  if (!unidad_id || !parada_id)
    return res.status(400).json({ error: 'unidad_id y parada_id son requeridos' });
  try {
    const [posRows] = await pool.query(
      'SELECT latitud,longitud,velocidad_kmh FROM posicion_actual WHERE unidad_id=?', [unidad_id]
    );
    if (!posRows.length) return res.status(404).json({ error: 'Unidad no activa' });
    const pos = posRows[0];
    const [parRows] = await pool.query('SELECT latitud,longitud FROM paradas WHERE id=?', [parada_id]);
    if (!parRows.length) return res.status(404).json({ error: 'Parada no encontrada' });
    const parada = parRows[0];
    const dist = haversine(pos.latitud, pos.longitud, parada.latitud, parada.longitud);
    const hora   = new Date().getHours();
    const diaSem = new Date().getDay() || 7;
    const [vtRows] = await pool.query(
      `SELECT velocidad_prom FROM velocidades_tramo
       WHERE ruta_id=(SELECT ruta_id FROM asignaciones WHERE unidad_id=? AND activo=1 LIMIT 1)
         AND franja_hora=? AND dia_semana=? LIMIT 1`,
      [unidad_id, hora, diaSem]
    );
    const velHist   = vtRows[0]?.velocidad_prom || 20;
    const velActual = pos.velocidad_kmh > 2 ? pos.velocidad_kmh : null;
    const velUsada  = velActual ? (velActual * 0.6 + velHist * 0.4) : velHist;
    const etaMin = (dist / velUsada) * 60;
    const conf   = etaMin * 0.2;
    await pool.query(
      `INSERT INTO eta_registros (unidad_id,parada_id,eta_minutos,confianza_min,confianza_max,fuente)
       VALUES (?,?,?,?,?,?)`,
      [unidad_id, parada_id, etaMin.toFixed(1),
       (etaMin-conf).toFixed(1), (etaMin+conf).toFixed(1),
       velActual ? 'hibrido' : 'historico']
    );
    res.json({
      unidad_id: +unidad_id, parada_id: +parada_id,
      distancia_km: +dist.toFixed(2), eta_minutos: +etaMin.toFixed(1),
      confianza: { min: +(etaMin-conf).toFixed(1), max: +(etaMin+conf).toFixed(1) },
      fuente: velActual ? 'hibrido' : 'historico',
    });
  } catch(err) { next(err); }
}

export async function historial(req, res, next) {
  const { parada_id } = req.query;
  if (!parada_id) return res.status(400).json({ error: 'parada_id es requerido' });
  try {
    const [rows] = await pool.query(
      `SELECT * FROM eta_registros WHERE parada_id=? ORDER BY calculado_at DESC LIMIT 50`,
      [parada_id]
    );
    res.json(rows);
  } catch(err) { next(err); }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R  = 6371;
  const dL = rad(lat2-lat1), dG = rad(lon2-lon1);
  const a  = Math.sin(dL/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dG/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
const rad = d => d * Math.PI / 180;