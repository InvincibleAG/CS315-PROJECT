import { useState } from 'react'

export default function SignUp() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('student') // Default type

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, email, type }),
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        alert('Sign up successful!')
        // optionally redirect or reload
      } else {
        alert(data.msg || 'Sign up failed')
      }
    } catch (err) {
      console.error('Sign up error:', err)
      alert('Network error')
    }
  }

  return (
    <div
  className="flex flex-col w-full sm:w-240 md:w-240 lg:w-240 max-w-md mx-auto mt-20 p-6 md:p-8 bg-white rounded-2xl shadow-xl"
>
  <h1 className="text-3xl font-bold mb-4  text-gray-600">Sign Up</h1>
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label className="block mb-1 text-gray-600">Username</label>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        placeholder="Username"
        className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
      />
    </div>
        <div>
          <label className="block mb-1 text-gray-600">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
          />
        </div>
        <div>
          <label className="block mb-1  text-gray-600">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Name"
            className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
          />
        </div>
        <div>
          <label className="block mb-1  text-gray-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
          />
        </div>
        <div>
          <label className="block mb-1  text-gray-600">User Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            required
            className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
          >
            <option value="student">Student</option>
            <option value="professor">Faculty</option>
            <option value="admin">Staff</option>
          </select>
        </div>
        <button
      type="submit"
      className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Sign Up
    </button>
  </form>
</div>
  )
}
