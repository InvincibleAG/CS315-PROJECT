import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week'); 
  
  useEffect(() => {
    fetchConfirmedEvents();
  }, []);
  
  const fetchConfirmedEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/events/confirmed', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();

      const processedEvents = data.map(event => {

        const timeSlots = parseTimeSlots(event.TIME_SLOTS);
        return {
          ...event,
          parsedTimeSlots: timeSlots
        };
      });
      
      setEvents(processedEvents);
    } catch (err) {
      console.error('Error fetching confirmed events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  const parseTimeSlots = (timeSlotsStr) => {
    if (!timeSlotsStr) return [];
    

    const slots = timeSlotsStr.split(',').map(slot => slot.trim());
    
    return slots.map(slot => {

      const [dateStr, timeRange] = slot.split(' ');
      const [startTime, endTime] = timeRange.split('-');
      

      const startDateTime = new Date(`${dateStr}T${startTime}`);
      const endDateTime = new Date(`${dateStr}T${endTime}`);
      
      return {
        date: dateStr,
        startTime: startDateTime,
        endTime: endDateTime,
        formattedStartTime: startDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        formattedEndTime: endDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
    });
  };


  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    
    return events.filter(event => {
      const startDate = new Date(event.E_DATE_START);
      const endDate = new Date(event.E_DATE_END);
      

      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);
      

      return dateStr >= startDateStr && dateStr <= endDateStr;
    }).map(event => {

      const dateSpecificTimeSlots = event.parsedTimeSlots.filter(slot => 
        slot.date === dateStr
      );
      
      return {
        ...event,
        dateTimeSlots: dateSpecificTimeSlots.length > 0 ? dateSpecificTimeSlots : event.parsedTimeSlots
      };
    });
  };
  

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };

  //prev/next week
  const navigateWeek = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + (direction * 7));
      return newDate;
    });
  };
  
  //current week's start and end dates
  const getWeekDates = () => {
    const date = new Date(currentDate);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday
    
    //(Sunday)
    date.setDate(date.getDate() - day);
    

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(date);
      weekDate.setDate(date.getDate() + i);
      weekDates.push(weekDate);
    }
    
    return weekDates;
  };
  

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    

    const emptyDays = Array.from({ length: firstDay }, (_, i) => null);
    

    const allDays = [...emptyDays, ...days];
    
    // 7 days)
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded hover:bg-gray-200"
          >
            &lt; Prev
          </button>
          <h2 className="text-lg font-semibold text-blue-700">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-1 rounded hover:bg-gray-200"
          >
            Next &gt;
          </button>
        </div>
        
        <div className="grid grid-cols-7 bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-2 font-medium text-sm text-green-900">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {weeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              if (day === null) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="min-h-24 bg-gray-50 border border-gray-200"></div>;
              }
              
              const date = new Date(year, month, day);
              const dateEvents = getEventsForDate(date);
              const isToday = formatDate(date) === formatDate(new Date());
              
              return (
                <div 
                  key={`day-${day}`} 
                  className={`min-h-24 p-1 border border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-right mb-1 ${isToday ? 'font-bold text-blue-600' : 'text-green-900'}`}>
                    {day}
                  </div>
                  
                  <div className="overflow-y-auto max-h-20">
                    {dateEvents.length > 0 ? (
                      dateEvents.map(event => (
                        <div 
                          key={event.E_ID} 
                          className="text-xs p-1 mb-1 rounded bg-blue-100 text-blue-800 truncate"
                          title={`${event.E_TYPE} - ${event.E_HALL}`}
                        >
                          <Link to={`/events/${event.E_ID}`}>
                            {event.E_TYPE} - {event.E_HALL}
                          </Link>
                        </div>
                      ))
                    ) : null}
                  </div>
                </div>
              );
            })
          ))}
        </div>
      </div>
    );
  };


  const renderWeekView = () => {
    const weekDates = getWeekDates();
    const today = formatDate(new Date());
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
          <button 
            onClick={() => navigateWeek(-1)}
            className="p-1 rounded hover:bg-gray-200"
          >
            &lt; Prev Week
          </button>
          <h2 className="text-lg font-semibold text-blue-700">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          <button 
            onClick={() => navigateWeek(1)}
            className="p-1 rounded hover:bg-gray-200"
          >
            Next Week &gt;
          </button>
        </div>
        
        <div className="grid grid-cols-7 bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
            const date = weekDates[index];
            const isToday = formatDate(date) === today;
            
            return (
              <div key={day} className="text-center py-2">
                <div className={`font-medium text-sm ${isToday ? 'text-blue-600' : 'text-green-900'}`}>{day}</div>
                <div className={`text-xs ${isToday ? 'font-bold text-blue-600' : 'text-green-900'}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-7">
          {weekDates.map((date, index) => {
            const dateEvents = getEventsForDate(date);
            const isToday = formatDate(date) === today;
            
            return (
              <div 
                key={`day-${index}`} 
                className={`border border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className="overflow-y-auto max-h-96 p-2">
                  {dateEvents.length > 0 ? (
                    dateEvents.map(event => (
                      <div 
                        key={event.E_ID} 
                        className="p-2 mb-2 rounded bg-blue-100 text-blue-800"
                      >
                        <Link to={`/events/${event.E_ID}`}>
                          <div className="font-medium">{event.E_TYPE}</div>
                          <div className="text-sm">Hall: {event.E_HALL}</div>
                          {event.dateTimeSlots && event.dateTimeSlots.length > 0 ? (
                            <div className="text-xs text-gray-600">
                              {event.dateTimeSlots[0].formattedStartTime} - {event.dateTimeSlots[0].formattedEndTime}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-600">Time not specified</div>
                          )}
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 text-xs py-4">No events</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  

  const renderDayView = () => {
    const dateStr = formatDate(currentDate);
    const dateEvents = getEventsForDate(currentDate);
    const isToday = dateStr === formatDate(new Date());
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
          <button 
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() - 1);
              setCurrentDate(newDate);
            }}
            className="p-1 rounded hover:bg-gray-200"
          >
            &lt; Prev Day
          </button>
          <h2 className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-green-900'}`}>
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <button 
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() + 1);
              setCurrentDate(newDate);
            }}
            className="p-1 rounded hover:bg-gray-200"
          >
            Next Day &gt;
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Events:</h3>
          
          {dateEvents.length > 0 ? (
            <div className="space-y-4">
              {dateEvents.map(event => (
                <div 
                  key={event.E_ID} 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50"
                >
                  <Link to={`/events/${event.E_ID}`} className="block">
                    <h4 className="font-bold text-lg text-gray-500">{event.E_TYPE}</h4>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-600">Location:</p>
                        <p>{event.E_HALL}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time:</p>
                        {event.dateTimeSlots && event.dateTimeSlots.length > 0 ? (
                          <p>
                            {event.dateTimeSlots[0].formattedStartTime} - {event.dateTimeSlots[0].formattedEndTime}
                          </p>
                        ) : (
                          <p>Time not specified</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">No events scheduled for this day</div>
          )}
        </div>
      </div>
    );
  };
  
  if (loading) return <div className="text-center py-8">Loading calendar...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  
  return (
    <div className="min-w-4xl max-w-7xl mt-30 mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event Calendar</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setView('month')}
            className={`px-3 py-1 rounded ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Month
          </button>
          <button 
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setView('day')}
            className={`px-3 py-1 rounded ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Day
          </button>
        </div>
      </div>
      
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
    </div>
  );
}
