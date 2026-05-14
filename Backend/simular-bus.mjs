import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'track_my_bus',
})

// Ruta simulada: puntos en Colima
const RUTA = [
  [19.2433, -103.7241],
  [19.2445, -103.7220],
  [19.2460, -103.7198],
  [19.2478, -103.7175],
  [19.2495, -103.7150],
  [19.2510, -103.7128],
  [19.2525, -103.7105],
  [19.2538, -103.7082],
  [19.2550, -103.7060],
  [19.2538, -103.7082],
  [19.2525, -103.7105],
  [19.2510, -103.7128],
  [19.2495, -103.7150],
  [19.2478, -103.7175],
  [19.2460, -103.7198],
  [19.2445, -103.7220],
]

let index = 0

async function mover() {
  const [lat, lng] = RUTA[index % RUTA.length]
  const velocidad = 25 + Math.random() * 20

  await pool.query(
    `UPDATE posicion_actual
     SET latitud=?, longitud=?, velocidad_kmh=?, updated_at=NOW()
     WHERE unidad_id=1`,
    [lat, lng, velocidad.toFixed(1)]
  )

  console.log(`Bus en [${lat}, ${lng}] a ${velocidad.toFixed(1)} km/h`)
  index++
}

mover()
setInterval(mover, 2000)