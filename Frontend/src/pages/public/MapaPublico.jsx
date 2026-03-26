import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

// Fix icono leaflet con vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
})

const COLIMA = [19.2433, -103.7241]
const REFRESH_MS = 1000

export default function MapaPublico() {
  const [unidades,  setUnidades]  = useState([])
  const [rutas,     setRutas]     = useState([])
  const [rutaSel,   setRutaSel]   = useState(null)
  const [polyline,  setPolyline]  = useState([])
  const [paradas,   setParadas]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const intervalRef = useRef(null)

  const cargarUnidades = async () => {
    try {
      const { data } = await api.get('/gps/live')
      setUnidades(data)
    } catch {}
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.get('/rutas')
        setRutas(data)
      } catch {}
      await cargarUnidades()
      setLoading(false)
    }
    init()
    intervalRef.current = setInterval(cargarUnidades, REFRESH_MS)
    return () => clearInterval(intervalRef.current)
  }, [])

  const seleccionarRuta = async ruta => {
    if (rutaSel?.id === ruta.id) {
      setRutaSel(null); setPolyline([]); setParadas([]); return
    }
    setRutaSel(ruta)
    try {
      const [poly, pars] = await Promise.all([
        api.get(`/rutas/${ruta.id}/polyline`),
        api.get(`/paradas?ruta_id=${ruta.id}`),
      ])
      setPolyline(poly.data.map(p => [p.latitud, p.longitud]))
      setParadas(pars.data)
    } catch {}
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      {/* Barra de rutas */}
      <div className="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto">
        {rutas.map(r => (
          <button key={r.id} onClick={() => seleccionarRuta(r)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium border transition
              ${rutaSel?.id === r.id
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
            style={{ borderColor: rutaSel?.id === r.id ? r.color_hex : undefined }}>
            {r.nombre}
          </button>
        ))}
        {!rutas.length && <span className="text-sm text-gray-400">Cargando rutas...</span>}
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
            <span className="text-blue-700 font-semibold animate-pulse">Cargando mapa...</span>
          </div>
        )}
        <MapContainer center={COLIMA} zoom={13} className="w-full h-full z-0">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Polyline de ruta seleccionada */}
          {polyline.length > 0 && (
            <Polyline positions={polyline} color={rutaSel?.color_hex || '#2563EB'} weight={4} />
          )}

          {/* Paradas */}
          {paradas.map(p => (
            <Marker key={p.id} position={[p.latitud, p.longitud]}
              icon={new L.Icon({
                iconUrl: p.es_terminal
                  ? 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
                  : 'https://cdn-icons-png.flaticon.com/512/684/684809.png',
                iconSize: [24, 24], iconAnchor: [12, 24],
              })}>
              <Popup>
                <b>{p.nombre}</b>
                {p.es_terminal && <span className="ml-1 text-xs text-blue-600">(Terminal)</span>}
                {p.accesible   && <span className="ml-1 text-xs text-green-600">♿</span>}
              </Popup>
            </Marker>
          ))}

          {/* Autobuses en tiempo real */}
          {unidades.map(u => (
            <Marker key={u.unidad_id} position={[u.latitud, u.longitud]} icon={busIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{u.ruta || 'Sin ruta'}</p>
                  <p>{u.numero_economico} — {u.placa}</p>
                  <p>{u.velocidad_kmh} km/h</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Contador de buses */}
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-xl shadow-md px-4 py-2 text-sm">
          <span className="font-semibold text-blue-700">{unidades.length}</span>
          <span className="text-gray-500 ml-1">bus{unidades.length !== 1 ? 'es' : ''} activo{unidades.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}