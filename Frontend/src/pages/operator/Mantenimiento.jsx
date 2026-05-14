import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'

const ESTADO_COLOR = {
  pendiente:   'bg-yellow-100 text-yellow-700',
  en_proceso:  'bg-blue-100 text-blue-700',
  completado:  'bg-green-100 text-green-700',
  cancelado:   'bg-gray-100 text-gray-500',
}

export default function Mantenimiento() {
  const [ordenes,  setOrdenes]  = useState([])
  const [alertas,  setAlertas]  = useState([])
  const [tipos,    setTipos]    = useState([])
  const [unidades, setUnidades] = useState([])
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState({ unidad_id:'', tipo_id:'', prioridad:'media', descripcion:'', km_actual:'', fecha_programada:'' })
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [tab,      setTab]      = useState('ordenes')

  const cargar = async () => {
    const [o, a, t, u] = await Promise.all([
      api.get('/mantenimiento/ordenes'),
      api.get('/mantenimiento/alertas'),
      api.get('/mantenimiento/tipos'),
      api.get('/unidades'),
    ])
    setOrdenes(o.data); setAlertas(a.data); setTipos(t.data); setUnidades(u.data)
  }

  useEffect(() => { cargar() }, [])

  const crear = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await api.post('/mantenimiento/ordenes', form)
      setModal(false)
      setForm({ unidad_id:'', tipo_id:'', prioridad:'media', descripcion:'', km_actual:'', fecha_programada:'' })
      cargar()
    } catch(err) { setError(err.response?.data?.error || 'Error al crear orden') }
    finally { setLoading(false) }
  }

  const cambiarEstado = async (id, estado) => {
    await api.patch(`/mantenimiento/ordenes/${id}`, { estado })
    cargar()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-blue-700 hover:underline text-sm">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-800">Mantenimiento</h1>
          </div>
          <button onClick={() => setModal(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition">
            + Nueva orden
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {['ordenes','alertas'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition
                ${tab === t ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {t === 'ordenes' ? `📋 Órdenes (${ordenes.length})` : `⚠️ Alertas (${alertas.length})`}
            </button>
          ))}
        </div>

        {tab === 'ordenes' && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Unidad</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Prioridad</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordenes.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{o.numero_economico} — {o.placa}</td>
                    <td className="px-4 py-3 text-gray-500">{o.tipo_nombre}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${o.prioridad === 'critica' ? 'bg-red-100 text-red-700' :
                          o.prioridad === 'alta'    ? 'bg-orange-100 text-orange-700' :
                          o.prioridad === 'media'   ? 'bg-yellow-100 text-yellow-700' :
                                                      'bg-gray-100 text-gray-500'}`}>
                        {o.prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[o.estado]}`}>
                        {o.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {o.estado === 'pendiente' && (
                        <button onClick={() => cambiarEstado(o.id, 'en_proceso')}
                          className="text-blue-600 hover:underline text-xs">Iniciar</button>
                      )}
                      {o.estado === 'en_proceso' && (
                        <button onClick={() => cambiarEstado(o.id, 'completado')}
                          className="text-green-600 hover:underline text-xs">Completar</button>
                      )}
                    </td>
                  </tr>
                ))}
                {!ordenes.length && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin órdenes</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'alertas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertas.map((a, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-5 border-l-4 border-yellow-400">
                <p className="font-semibold text-gray-800">{a.numero_economico} — {a.placa}</p>
                <p className="text-sm text-gray-500 mt-1">{a.tipo}</p>
                <p className="text-sm text-yellow-700 mt-2 font-medium">
                  ⚠️ {a.km_restantes} km restantes para mantenimiento
                </p>
                <p className="text-xs text-gray-400 mt-1">Km actual: {a.km_actual?.toLocaleString()}</p>
              </div>
            ))}
            {!alertas.length && (
              <p className="text-gray-400 col-span-2 text-center py-8">Sin alertas de mantenimiento</p>
            )}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Nueva orden de mantenimiento</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <form onSubmit={crear} className="space-y-3">
              <select required value={form.unidad_id} onChange={e => setForm({...form, unidad_id: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Unidad *</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.numero_economico} — {u.placa}</option>)}
              </select>
              <select required value={form.tipo_id} onChange={e => setForm({...form, tipo_id: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tipo de mantenimiento *</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.categoria})</option>)}
              </select>
              <select value={form.prioridad} onChange={e => setForm({...form, prioridad: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
              <input placeholder="Km actual" type="number" value={form.km_actual}
                onChange={e => setForm({...form, km_actual: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Fecha programada" type="date" value={form.fecha_programada}
                onChange={e => setForm({...form, fecha_programada: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea placeholder="Descripción" value={form.descripcion} rows={3}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-700 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50">
                  {loading ? 'Creando...' : 'Crear orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}