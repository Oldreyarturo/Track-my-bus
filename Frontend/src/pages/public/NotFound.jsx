import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center gap-4">
      <span className="text-6xl">🚌</span>
      <h1 className="text-3xl font-bold text-blue-700">404</h1>
      <p className="text-gray-500">Esta página no existe</p>
      <Link to="/" className="bg-blue-700 text-white px-6 py-2 rounded-full hover:bg-blue-800 transition">
        Volver al inicio
      </Link>
    </div>
  )
}