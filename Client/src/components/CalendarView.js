import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const eventsPerPage = 10;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter out "Unavailable" courses
        const courses = response.data
          .map((course) => ({
            id: course._id,
            title: course.title,
            start: course.startDate,
            end: course.endDate,
            description: course.description || 'No description provided',
            location: course.location || 'Location not specified',
            assignedUser: course.assignedUser ? course.assignedUser.name : 'Unassigned',
          }))
          .filter((course) => !course.title.toLowerCase().startsWith('unavailable'));

        setEvents(courses);
        setFilteredEvents(courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  // Handle Search Functionality
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
    );

    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset to first page
  };

  // Paginated Table Data
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  // Handle Page Navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="schedule-container">
      {/* Calendar Section */}
      <div className="calendar-header">
        <h2>Latrobe Course Calendar</h2>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={filteredEvents} // Use the filtered list here
        height="auto"
        dayCellContent={(info) => (
          <div className="custom-day-cell">
            {info.dayNumberText.replace('日', '')}
          </div>
        )}
        dayMaxEventRows={2}
        eventContent={(eventInfo) => (
          <div className="custom-event">
            <b>{eventInfo.event.title}</b>
          </div>
        )}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek',
        }}
      />

      {/* Search Bar */}
      <div className="table-header">
        <h3>Course lists</h3>
        <input
          type="text"
          placeholder="Search Courses..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />
      </div>

      {/* Course Table */}
      <div className="course-table-container">
        <table>
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
            {currentEvents.length > 0 ? (
              currentEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.description}</td>
                  <td>{new Date(event.start).toLocaleDateString()}</td>
                  <td>{event.end ? new Date(event.end).toLocaleDateString() : 'N/A'}</td>
                  <td>{event.location}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No courses available</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span> Page {currentPage} </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastEvent >= filteredEvents.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
