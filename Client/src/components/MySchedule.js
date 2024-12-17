import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';
import { jwtDecode } from 'jwt-decode';

function MySchedule() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

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

        const sortedCourses = courses.sort((a, b) => new Date(a.start) - new Date(b.start));
        setEvents(sortedCourses);
        setError('');
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load your schedule');
      }
    };

    fetchMyCourses();
  }, []);

  const termDates = {
    term1: { start: `${year}-02-01`, end: `${year}-04-30` },
    term2: { start: `${year}-05-01`, end: `${year}-07-31` },
    term3: { start: `${year}-08-01`, end: `${year}-10-31` },
    term4: { start: `${year}-11-01`, end: `${year + 1}-01-31` },
  };

  const filterByTerm = (termStart, termEnd) => {
    return events.filter((event) => {
      const courseStart = new Date(event.start);
      const courseEnd = new Date(event.end);
      const termStartDate = new Date(termStart);
      const termEndDate = new Date(termEnd);

      return courseStart <= termEndDate && courseEnd >= termStartDate;
    });
  };

  const isPastCourse = (courseEndDate) => new Date(courseEndDate) < new Date();

  const renderTermSection = (termTitle, termStart, termEnd) => {
    const termCourses = filterByTerm(termStart, termEnd);

    return (
      <React.Fragment>
        <tr>
          <td colSpan="5" className="term-title"><strong>{termTitle}</strong></td>
        </tr>
        {termCourses.length > 0 ? (
          termCourses.map((event) => (
            <tr key={event.id} className={isPastCourse(event.end) ? 'past-course' : ''}>
              <td>{event.title}</td>
              <td>{event.description}</td>
              <td>{new Date(event.start).toLocaleDateString()}</td>
              <td>{new Date(event.end).toLocaleDateString()}</td>
              <td>{event.location}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5">No courses available for this term.</td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="my-schedule-container">
      <h2>My Schedule</h2>
      {error && <p className="error">{error}</p>}

      {/* Calendar Section */}
      <div className="calendar-section">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          editable={true}
          selectable={true}
          height="auto"
          eventClick={(info) => ReactTooltip.show(info.el)}
          eventContent={(eventInfo) => (
            <div data-tip={eventInfo.event.extendedProps.description}>
              <b>{eventInfo.timeText}</b> <i>{eventInfo.event.title}</i>
            </div>
          )}
        />
        <ReactTooltip />
      </div>

      {/* Year Navigation */}
      <div className="year-navigation">
        <button onClick={() => setYear((prev) => prev - 1)}>Previous Year</button>
        <h3>{year}</h3>
        <button onClick={() => setYear((prev) => prev + 1)}>Next Year</button>
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
            {renderTermSection('Term 1: February - April', termDates.term1.start, termDates.term1.end)}
            {renderTermSection('Term 2: May - July', termDates.term2.start, termDates.term2.end)}
            {renderTermSection('Term 3: August - October', termDates.term3.start, termDates.term3.end)}
            {renderTermSection('Term 4: November - January', termDates.term4.start, termDates.term4.end)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MySchedule;
