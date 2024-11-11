import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const courses = response.data.map((course) => ({
          id: course._id,
          title: course.title,
          start: course.startDate,
          end: course.endDate,
          description: course.description,
          location: course.location,
          assignedUser: course.assignedUser ? course.assignedUser.name : 'Unassigned',
        }));
        setEvents(courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
  };

  const closeSidebar = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="calendar-wrapper">
      {/* Calendar Container with conditional class for spacing */}
      <div className={`calendar-container ${selectedEvent ? 'sidebar-open' : ''}`}>
        <h2>Lecturer Calendar</h2>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          editable={true}
          selectable={true}
          height="auto"
          eventClick={handleEventClick}
          eventContent={(eventInfo) => (
            <div data-tip={eventInfo.event.extendedProps.description}>
              <b>{eventInfo.timeText}</b>
              <i>{eventInfo.event.title}</i>
              <ReactTooltip />
            </div>
          )}
        />
      </div>

      {/* Right-Side Event Details Sidebar */}
      {selectedEvent && (
        <div className="event-details">
          <h3>{selectedEvent.title}</h3>
          <p><strong>Start Date:</strong> {selectedEvent.start.toISOString().slice(0, 10)}</p>
          <p><strong>End Date:</strong> {selectedEvent.end ? selectedEvent.end.toISOString().slice(0, 10) : 'Same Day'}</p>
          <p><strong>Description:</strong> {selectedEvent.extendedProps.description}</p>
          <p><strong>Location:</strong> {selectedEvent.extendedProps.location}</p>
          <p><strong>Assigned User:</strong> {selectedEvent.extendedProps.assignedUser}</p>
          <button onClick={closeSidebar}>Close</button>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
