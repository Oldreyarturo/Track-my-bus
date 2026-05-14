import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'

export default function Unidades() {
  const [unidades, setUnidades] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState({ empresa_id:'', numero_economico:'', placa:'', marca:'', modelo:'', anio:'', capacidad:'', accesible: false })
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const cargar = async () => {
    const [u, e] = await Promise.all([api.get('/unidades'), api.get('/empresas')])
    setUnidades(u.data); setEmpresas(e.data)
  }

  useEffect(() => { cargar() }, [])

  const crear = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await api.post('/unidades', form)
      setModal(false)
      setForm({ empresa_id:'', numero_economico:'', placa:'', marca:'', modelo:'', anio:'', capacidad:'', accesible: false })
      cargar()
    } catch(err) { setError(err.response?.data?.error || 'Error al crear unidad') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-blue-700 hover:underline text-sm">← Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-800">Unidades</h1>
          </div>
          <button onClick={() => setModal(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition">
            + Nueva unidad
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">No. Económico</th>
                <th className="px-4 py-3 text-left">Placa</th>
                <th className="px-4 py-3 text-left">Marca / Modelo</th>
                <th className="px-4 py-3 text-left">Año</th>
                <th className="px-4 py-3 text-left">Capacidad</th>
                <th className="px-4 py-3 text-left">Accesible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {unidades.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.numero_economico}</td>
                  <td className="px-4 py-3">{u.placa}</td>
                  <td className="px-4 py-3 text-gray-500">{u.marca} {u.modelo}</td>
                  <td className="px-4 py-3 text-gray-500">{u.anio || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{u.capacidad || '—'}</td>
                  <td className="px-4 py-3">{u.accesible ? '' : '—'}</td>
                </tr>
              ))}
              {!unidades.length && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay unidades registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Nueva unidad</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <form onSubmit={crear} className="space-y-3">
              <select required value={form.empresa_id} onChange={e => setForm({...form, empresa_id: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Empresa *</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
              {[
                ['numero_economico','No. Económico *', true],
                ['placa','Placa *', true],
                ['marca','Marca', false],
                ['modelo','Modelo', false],
              ].map(([field, label, req]) => (
                <input key={field} placeholder={label} required={req} value={form[field]}
                  onChange={e => setForm({...form, [field]: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              ))}
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Año" type="number" value={form.anio}
                  onChange={e => setForm({...form, anio: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Capacidad" type="number" value={form.capacidad}
                  onChange={e => setForm({...form, capacidad: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.accesible}
                  onChange={e => setForm({...form, accesible: e.target.checked})}
                  className="w-4 h-4 accent-blue-700" />
                Unidad accesible para personas con discapacidad
              </label>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 border border-gray-300 rounded-xl py-2 text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-700 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50">
                  {loading ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}