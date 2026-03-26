import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'

export default function Rutas() {
  const [rutas,   setRutas]   = useState([])
  const [form,    setForm]    = useState({ nombre:'', clave:'', tipo:'urbana', color_hex:'#2563EB', empresa_id:'', zona_id:'' })
  const [empresas,setEmpresas]= useState([])
  const [zonas,   setZonas]   = useState([])
  const [modal,   setModal]   = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const cargar = async () => {
    const [r, e, z] = await Promise.all([api.get('/rutas'), api.get('/empresas'), api.get('/zonas')])
    setRutas(r.data); setEmpresas(e.data); setZonas(z.data)
  }

  useEffect(() => { cargar() }, [])

  const crear = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await api.post('/rutas', form)
      setModal(false)
      setForm({ nombre:'', clave:'', tipo:'urbana', color_hex:'#2563EB', empresa_id:'', zona_id:'' })
      cargar()
    } catch(err) { setError(err.response?.data?.error || 'Error al crear ruta') }
    finally { setLoading(false) }
  }

  const desactivar = async id => {
    if (!confirm('¿Desactivar esta ruta?')) return
    await api.delete(`/rutas/${id}`)
    cargar()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-blue-700 hover:underline text-sm">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-800">Rutas</h1>
          </div>
          <button onClick={() => setModal(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition">
            + Nueva ruta
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Clave</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Empresa</th>
                <th className="px-4 py-3 text-left">Color</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rutas.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{r.clave || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">{r.tipo}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{r.empresa}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block w-5 h-5 rounded-full border" style={{ background: r.color_hex }} />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => desactivar(r.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium">
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))}
              {!rutas.length && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay rutas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nueva ruta */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Nueva ruta</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <form onSubmit={crear} className="space-y-3">
              <input placeholder="Nombre *" required value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Clave (ej. R-01)" value={form.clave}
                onChange={e => setForm({...form, clave: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="urbana">Urbana</option>
                <option value="suburbana">Suburbana</option>
                <option value="foranea">Foránea</option>
              </select>
              <select required value={form.empresa_id} onChange={e => setForm({...form, empresa_id: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Empresa *</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
              <select required value={form.zona_id} onChange={e => setForm({...form, zona_id: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Zona *</option>
                {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Color:</label>
                <input type="color" value={form.color_hex}
                  onChange={e => setForm({...form, color_hex: e.target.value})}
                  className="w-10 h-8 rounded cursor-pointer border" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-700 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition">
                  {loading ? 'Creando...' : 'Crear ruta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}