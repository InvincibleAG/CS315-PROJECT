import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EventDetails() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/login');
            return;
          }
      
          const response = await fetch(`http://localhost:5000/api/events/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Response :', response); 

          if (!response.ok) {

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              throw new Error(errorData.msg || `Error: ${response.status}`);
            } else {

              const errorText = await response.text();
              console.error('Non-JSON error response:', errorText.substring(0, 100) + '...');
              throw new Error(`Server returned ${response.status}: Not a valid JSON response`);
            }
          }
      
          const data = await response.json();
          setEvent(data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching event details:', err);
          setError(err.message || 'Failed to load event details');
          setLoading(false);
        }
      };

    fetchEvent();
  }, [id, navigate]);

  if (loading) return <div className="text-center py-10">Loading event details...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!event) return <div className="text-center py-10">Event not found</div>;

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 text-gray">
        <button 
          onClick={() => navigate('/events')}
          className="text-blue-200 hover:text-blue-300 flex items-center"
        >
          &larr; Back to Events
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Event Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{event.E_TYPE}</h1>
              <p className="text-gray-600">Requested by: {event.REQUESTER_NAME}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.E_STATUS)}`}>
              {event.E_STATUS}
            </span>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Event Information</h2>
            
            <div className="mb-4 text-green-700">
              <p className="text-sm text-gray-500">Date Range</p>
              <p className="font-medium">
                {formatDate(event.E_DATE_START)} - {formatDate(event.E_DATE_END)}
              </p>
            </div>

            <div className="mb-4 text-green-700">
              <p className="text-sm text-gray-500">Scheduled Times</p>
              <ul className="list-disc pl-5">
                {event.times && event.times.map((time, index) => (
                  <li key={index} className="mb-1">
                    <span className="font-medium">{formatDate(time.ET_DAY)} ({time.ET_DAY_OF_WEEK})</span>: 
                    {' '}{formatTime(time.ET_START)} - {formatTime(time.ET_END)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Hall Details</h2>
            
            <div className="mb-4 text-green-700">
              <p className="text-sm text-gray-500">Hall Code</p>
              <p className="font-medium">{event.E_HALL}</p>
            </div>
            
            <div className="mb-4 text-green-700">
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-medium">{event.H_CAPACITY} people</p>
            </div>
            
            <div className="mb-4 text-green-700">
              <p className="text-sm text-gray-500">Equipment</p>
              <ul className="list-disc pl-5">
                {event.H_PROJECTORS > 0 && (
                  <li>{event.H_PROJECTORS} Projector{event.H_PROJECTORS > 1 ? 's' : ''}</li>
                )}
                {event.H_BBOARDS > 0 && (
                  <li>{event.H_BBOARDS} Blackboard{event.H_BBOARDS > 1 ? 's' : ''}</li>
                )}
                {event.H_WBOARDS > 0 && (
                  <li>{event.H_WBOARDS} Whiteboard{event.H_WBOARDS > 1 ? 's' : ''}</li>
                )}
                {event.H_EDUPAD === 'YES' && <li>Educational Pad Available</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
