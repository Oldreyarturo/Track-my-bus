import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'

const DIAS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

export default function Horarios() {
  const [rutas,     setRutas]     = useState([])
  const [rutaSel,   setRutaSel]   = useState('')
  const [horarios,  setHorarios]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [modal,     setModal]     = useState(false)
  const [error,     setError]     = useState('')
  const [form,      setForm]      = useState({
    dia_semana: 1, hora_salida: '', hora_llegada: '', es_hora_pico: false
  })

  useEffect(() => {
    api.get('/rutas').then(r => setRutas(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!rutaSel) { setHorarios([]); return }
    cargarHorarios()
  }, [rutaSel])

  const cargarHorarios = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/horarios', { params: { ruta_id: rutaSel } })
      setHorarios(data)
    } catch {}
    finally { setLoading(false) }
  }

  const crear = async e => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/horarios', { ...form, ruta_id: rutaSel })
      setModal(false)
      setForm({ dia_semana: 1, hora_salida: '', hora_llegada: '', es_hora_pico: false })
      cargarHorarios()
    } catch(err) {
      setError(err.response?.data?.error || 'Error al crear horario')
    }
  }

  const eliminar = async id => {
    if (!confirm('¿Eliminar este horario?')) return
    await api.delete(`/horarios/${id}`)
    cargarHorarios()
  }

  // Agrupar horarios por día
  const horariosPorDia = DIAS.map(dia => ({
    ...dia,
    horarios: horarios.filter(h => h.dia_semana === dia.value)
  })).filter(d => d.horarios.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-blue-700 hover:underline text-sm">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-800">Horarios</h1>
          </div>
          {rutaSel && (
            <button onClick={() => setModal(true)}
              className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition">
              + Agregar horario
            </button>
          )}
        </div>

        {/* Selector de ruta */}
        <div className="bg-white rounded-2xl shadow p-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">Selecciona una ruta</label>
          <select value={rutaSel} onChange={e => setRutaSel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Seleccionar ruta —</option>
            {rutas.map(r => (
              <option key={r.id} value={r.id}>{r.nombre} {r.clave ? `(${r.clave})` : ''}</option>
            ))}
          </select>
        </div>

        {/* Horarios agrupados por día */}
        {rutaSel && (
          loading ? (
            <p className="text-gray-400 animate-pulse">Cargando horarios...</p>
          ) : horariosPorDia.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
              No hay horarios para esta ruta. ¡Agrega el primero!
            </div>
          ) : (
            <div className="space-y-4">
              {horariosPorDia.map(dia => (
                <div key={dia.value} className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="bg-blue-700 text-white px-4 py-2 font-semibold text-sm">
                    {dia.label}
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-2 text-left">Salida</th>
                        <th className="px-4 py-2 text-left">Llegada</th>
                        <th className="px-4 py-2 text-left">Hora pico</th>
                        <th className="px-4 py-2 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dia.horarios.map(h => (
                        <tr key={h.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-mono font-semibold text-blue-700">{h.hora_salida}</td>
                          <td className="px-4 py-2 font-mono text-gray-600">{h.hora_llegada}</td>
                          <td className="px-4 py-2">
                            {h.es_hora_pico
                              ? <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">🔴 Hora pico</span>
                              : <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-xs">Normal</span>
                            }
                          </td>
                          <td className="px-4 py-2">
                            <button onClick={() => eliminar(h.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium">
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal agregar horario */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Agregar horario</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <form onSubmit={crear} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Día de la semana</label>
                <select value={form.dia_semana} onChange={e => setForm({...form, dia_semana: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {DIAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Hora salida</label>
                  <input type="time" required value={form.hora_salida}
                    onChange={e => setForm({...form, hora_salida: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Hora llegada</label>
                  <input type="time" required value={form.hora_llegada}
                    onChange={e => setForm({...form, hora_llegada: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.es_hora_pico}
                  onChange={e => setForm({...form, es_hora_pico: e.target.checked})}
                  className="w-4 h-4 accent-red-600" />
                🔴 Es hora pico
              </label>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setModal(false); setError('') }}
                  className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 bg-blue-700 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-800 transition">
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
