import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingEvent, setProcessingEvent] = useState(null);
  const [filter, setFilter] = useState('pending');
  
  useEffect(() => {
    fetchEvents();
  }, [filter]);
  
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = 'http://localhost:5000/api/events';
      
      if (filter !== 'all') {
        endpoint = `http://localhost:5000/api/events/status/${filter}`;
      }
      
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (eventId, newStatus) => {
    setProcessingEvent(eventId);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || `Failed to update event status to ${newStatus}`);
      }
      
      // After updating, refresh the events list
      fetchEvents();
    } catch (err) {
      console.error(`Error updating event status to ${newStatus}:`, err);
      alert(err.message || `Failed to update event status to ${newStatus}`);
    } finally {
      setProcessingEvent(null);
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) return <div className="text-center py-8">Loading events...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event Management - Admin Panel</h1>
        
        <div className="flex items-center">
          <label htmlFor="statusFilter" className="mr-2">Status Filter:</label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">All Events</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-600">There are no events matching the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hall
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.E_ID}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.E_TYPE}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.E_HALL}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(event.E_DATE_START).toLocaleDateString()} - {new Date(event.E_DATE_END).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.U_NAME} ({event.U_TYPE})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(event.E_STATUS)}`}>
                      {event.E_STATUS}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      onClick={() => {/* View event details - could expand this */}}
                    >
                      View
                    </button>
                    
                    {event.E_STATUS === 'PENDING' && (
                      <>
                        <button 
                          className="text-green-600 hover:text-green-900 mr-2"
                          onClick={() => handleStatusChange(event.E_ID, 'CONFIRMED')}
                          disabled={processingEvent === event.E_ID}
                        >
                          Confirm
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleStatusChange(event.E_ID, 'CANCELLED')}
                          disabled={processingEvent === event.E_ID}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}