import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles = [] }) {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />

  if (roles.length && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return children
}