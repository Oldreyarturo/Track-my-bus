import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'

const TIPOS = {
  accidente: { label: 'Accidente',        color: 'bg-red-100 text-red-700',    icon: '🚨' },
  trafico:   { label: 'Tráfico',          color: 'bg-orange-100 text-orange-700', icon: '🚦' },
  desvio:    { label: 'Desvío',           color: 'bg-yellow-100 text-yellow-700', icon: '🔀' },
  averia:    { label: 'Avería/Ponchadura',color: 'bg-blue-100 text-blue-700',   icon: '🔧' },
  otro:      { label: 'Otro',             color: 'bg-gray-100 text-gray-700',   icon: '📋' },
}

export default function Incidencias() {
  const [incidencias, setIncidencias] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filtro,      setFiltro]      = useState('activa') // 'activa' | 'resuelta' | 'todas'

  const cargar = async () => {
    setLoading(true)
    try {
      const params = filtro === 'todas' ? {} : { activa: filtro === 'activa' }
      const { data } = await api.get('/incidencias', { params })
      setIncidencias(data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [filtro])

  const resolver = async id => {
    if (!confirm('¿Marcar esta incidencia como resuelta?')) return
    try {
      await api.patch(`/incidencias/${id}/resolver`)
      cargar()
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-blue-700 hover:underline text-sm">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-800">Incidencias</h1>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            {[
              { value: 'activa',   label: '⚠️ Activas' },
              { value: 'resuelta', label: '✅ Resueltas' },
              { value: 'todas',    label: 'Todas' },
            ].map(f => (
              <button key={f.value} onClick={() => setFiltro(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border
                  ${filtro === f.value
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 animate-pulse">Cargando...</p>
        ) : (
          <div className="space-y-3">
            {incidencias.length === 0 && (
              <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
                No hay incidencias {filtro === 'activa' ? 'activas' : filtro === 'resuelta' ? 'resueltas' : ''}
              </div>
            )}

            {incidencias.map(inc => {
              const tipo = TIPOS[inc.tipo] || TIPOS.otro
              return (
                <div key={inc.id} className="bg-white rounded-2xl shadow p-5 flex items-start gap-4">
                  <div className="text-3xl">{tipo.icon}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tipo.color}`}>
                        {tipo.label}
                      </span>
                      {inc.activa ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">Activa</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">Resuelta</span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-800">{inc.descripcion || 'Sin descripción'}</p>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-3">
                      {inc.ruta && <span>🗺️ {inc.ruta}</span>}
                      {inc.numero_economico && <span>🚌 {inc.numero_economico} — {inc.placa}</span>}
                      <span>👤 {inc.reportado_por_nombre}</span>
                      <span>🕐 {new Date(inc.created_at).toLocaleString('es-MX')}</span>
                      {inc.resuelta_at && (
                        <span>✅ Resuelta: {new Date(inc.resuelta_at).toLocaleString('es-MX')}</span>
                      )}
                    </div>
                  </div>
                  {inc.activa ? (
                    <button onClick={() => resolver(inc.id)}
                      className="flex-shrink-0 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition">
                      Resolver
                    </button>
                  ) : (
                    <span className="flex-shrink-0 text-green-500 text-xl">✅</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
