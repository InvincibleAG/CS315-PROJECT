import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function EventForm() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    eventType: '',
    hallCode: '',
    dateStart: '',
    dateEnd: '',
    eventTimes: [{ day: '', start: '', end: '' }]
  })
  
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/halls', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!res.ok) {
          throw new Error('Failed to fetch halls')
        }
        
        const data = await res.json()
        setHalls(data)
      } catch (err) {
        console.error('Error fetching halls:', err)
        setError('Failed to load halls. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchHalls()
  }, [])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleTimeChange = (index, field, value) => {
    const updatedTimes = [...formData.eventTimes]
    updatedTimes[index] = { ...updatedTimes[index], [field]: value }
    setFormData({
      ...formData,
      eventTimes: updatedTimes
    })
  }
  
  const addTimeSlot = () => {
    setFormData({
      ...formData,
      eventTimes: [...formData.eventTimes, { day: '', start: '', end: '' }]
    })
  }
  
  const removeTimeSlot = (index) => {
    const updatedTimes = [...formData.eventTimes]
    updatedTimes.splice(index, 1)
    setFormData({
      ...formData,
      eventTimes: updatedTimes
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      const eventData = {
        eventType: formData.eventType,
        hallCode: formData.hallCode,
        dateStart: formData.dateStart,
        dateEnd: formData.dateEnd,
        eventTimes: formData.eventTimes
      }
      
      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.msg || 'Failed to create event')
      }
      
      // Redirect to events page after successful creation
      navigate('/events')
    } catch (err) {
      console.error('Error creating event:', err)
      setError(err.message || 'Failed to create event. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) return <div className="text-center py-8">Loading halls...</div>
  
  return (
    <div className="flex flex-col sm:w-100 md:w-100 lg:w-1000 max-w-md mx-auto mt-20 p-6 md:p-12 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-600 mb-6">Lodge New Event</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div >
          <label className="block text-gray-700 font-medium mb-2">
            Event Type
          </label>
          <input
            type="text"
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            required
            placeholder="e.g., Lecture, Workshop, Seminar"
            className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Hall
          </label>
          <select
            name="hallCode"
            value={formData.hallCode}
            onChange={handleChange}
            required
            placeholder="Select a hall"
            className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
          >
            <option value="">Select a hall</option>
            {halls.map(hall => (
              <option key={hall.H_CODE} value={hall.H_CODE}>
                {hall.H_CODE} (Capacity: {hall.H_CAPACITY})
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="dateStart"
              value={formData.dateStart}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              name="dateEnd"
              value={formData.dateEnd}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
              min={formData.dateStart || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-medium">
              Event Times
            </label>
            <button
              type="button"
              onClick={addTimeSlot}
              className="px-4 py-2 bg-white text-white rounded hover:bg-blue-700 disabled:bg-blue-300 "
            >
              + Add Time Slot
            </button>
          </div>
          
          {formData.eventTimes.map((timeSlot, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded mb-3">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    Day
                  </label>
                  <input
                    type="date"
                    value={timeSlot.day}
                    onChange={(e) => handleTimeChange(index, 'day', e.target.value)}
                    required
                    className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
                    min={formData.dateStart}
                    max={formData.dateEnd}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={timeSlot.start}
                    onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                    required
                    className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={timeSlot.end}
                    onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                    required
                    className="w-full p-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
              
              {formData.eventTimes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-white text-white rounded hover:bg-blue-700 disabled:bg-blue-300 "
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-white text-white rounded hover:bg-blue-700 disabled:bg-blue-300 "
          >
            {submitting ? 'Submitting...' : 'Lodge Event'}
          </button>
        </div>
      </form>
    </div>
  )
}
