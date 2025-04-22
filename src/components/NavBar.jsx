import { useState } from 'react'
import { useNavigate } from 'react-router-dom'


export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Redirect to events page after successful login
        navigate('/events')
      } else {
        alert(data.msg || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      alert('Network error')
    }
  }

  return (
    
    <div
    className="flex flex-col sm:w-240 md:w-240 lg:w-240 max-w-md mx-auto mt-20 p-6 md:p-12 bg-white rounded-2xl shadow-xl"
  >
    <h1 className="text-3xl font-bold text-gray-600 mb-6">Login</h1>
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col mb-4">
        <label className="block mb-2 text-gray-700">Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
          placeholder="Username"
        />
      </div>
      <div className="flex flex-col mb-4">
        <label className="block mb-2 text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
          placeholder="Password"
        />
      </div>
      <button
        type="submit"
        className="w-full mt-6 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Log In
      </button>
    </form>
  </div>
  
  )
}
