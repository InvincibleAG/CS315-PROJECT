import { Link, useNavigate } from 'react-router-dom'

export default function NavBar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isLoggedIn = !!localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Lecture Hall Booking System</Link>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span>Welcome, {user.name}</span>
              <Link to="/events" className="hover:underline">Events</Link>
              <Link to="/events/new" className="hover:underline">Lodge Event</Link>
              <button 
                onClick={handleLogout}
                className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/signup" className="hover:underline">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}