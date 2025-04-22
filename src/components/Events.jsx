import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.isAdmin;
  
  useEffect(() => {
    fetchEvents();
  }, [filter]);
  
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      
      let endpoint = isAdmin 
        ? (filter !== 'all' ? `http://localhost:5000/api/events/status/${filter}` : 'http://localhost:5000/api/events')
        : 'http://localhost:5000/api/events/user';
      
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
      
      fetchEvents();
    } catch (err) {
      console.error(`Error updating event status to ${newStatus}:`, err);
      alert(err.message || `Failed to update event status to ${newStatus}`);
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
    <div className="max-w-6xl divide-y mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isAdmin ? 'All Events' : 'My Events'}</h1>
        <div className="flex gap-4">
          {isAdmin && (
            <div className="flex items-center">
              <label htmlFor="statusFilter" className="mr-2">Filter:</label>
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
          )}
          {!isAdmin && (
            <button type="button" class="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-sm text-sm px-5 py-2.5 text-center me-1 mb-0">
            <Link 
              to="/events/new" 
              className="text-gray-900 px-4 py-2"
            >
              + Lodge New Event
            </Link>
            </button>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-600">
            {isAdmin 
              ? 'There are no events matching the selected filter.' 
              : "You haven't lodged any events yet."}
          </p>
          {!isAdmin && (
            <Link 
              to="/events/new" 
              className="hover:underline mt-2 inline-block"
            >
              Lodge your first event
            </Link>
          )}
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
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested By
                  </th>
                )}
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
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-gray-600">
                    {event.E_TYPE}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {event.E_HALL}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(event.E_DATE_START).toLocaleDateString()} - {new Date(event.E_DATE_END).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {event.U_NAME} ({event.U_TYPE})
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(event.E_STATUS)}`}>
                      {event.E_STATUS}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    <button className="text-white hover:text-blue-100 mr-1">
                      View
                    </button>
                    
                    {isAdmin && event.E_STATUS === 'PENDING' && (
                      <>
                        <button 
                          className="text-green-600 hover:text-green-900 mr-2"
                          onClick={() => handleStatusChange(event.E_ID, 'CONFIRMED')}
                        >
                          Confirm
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleStatusChange(event.E_ID, 'CANCELLED')}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {!isAdmin && event.E_STATUS === 'PENDING' && (
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleStatusChange(event.E_ID, 'CANCELLED')}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
