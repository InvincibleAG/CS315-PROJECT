import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.isAdmin
  
  if (!token || !isAdmin) {
    return <Navigate to="/login" />
  }
  
  return children
}