import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';

function MySchedule() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/mine`, {
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
        setError('');
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load your schedule');
      }
    };

    fetchMyCourses();
  }, []);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
  };

  const closeSidebar = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="my-schedule-container">
      <h2>My Schedule</h2>
      {error && <p className="error">{error}</p>}

      <div className="calendar-section">
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

      {/* Course Table */}
      <div className="course-table-container">
        <h3>Assigned Courses</h3>
        <table className="course-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.description}</td>
                <td>{new Date(event.start).toLocaleDateString()}</td>
                <td>{event.end ? new Date(event.end).toLocaleDateString() : 'Same Day'}</td>
                <td>{event.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MySchedule;
