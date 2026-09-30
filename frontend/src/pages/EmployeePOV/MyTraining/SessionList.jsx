import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { fetchAllSessions } from '../myTrainingAPI';
import TableComponent from '../../../components/TableCo';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaFilter } from 'react-icons/fa';

const SessionList = ({ employeeId }) => {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [employeeId, filter]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await fetchAllSessions(employeeId, filter);
      const formattedData = data.map(session => ({
        ...session,
        sessionDate: dayjs(session.sessionDate).format('DD-MM-YYYY'),
      }));
      setSessions(formattedData);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (status) => {
    if (status === 1) {
      return <span className="attendance-badge present"><FaCheckCircle /> Present</span>;
    } else if (status === 0) {
      return <span className="attendance-badge absent"><FaTimesCircle /> Absent</span>;
    } else {
      return <span className="attendance-badge pending"><FaHourglassHalf /> Pending</span>;
    }
  };

  const getSessionStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace(' ', '-');
    return <span className={`session-status-badge ${statusClass}`}>{status}</span>;
  };

  const columns = [
    { id: 'sessionName', label: 'Session Name', align: 'left' },
    { id: 'trainingTitle', label: 'Training', align: 'left' },
    { id: 'sessionDate', label: 'Date', align: 'center' },
    { 
      id: 'sessionTime', 
      label: 'Time', 
      align: 'center',
      render: (row) => `${row.sessionStartTime} - ${row.sessionEndTime}`
    },
    { id: 'trainerName', label: 'Trainer', align: 'left' },
    {
      id: 'sessionStatus',
      label: 'Status',
      align: 'center',
      render: (row) => getSessionStatusBadge(row.sessionStatus)
    },
    {
      id: 'attendanceStatus',
      label: 'Attendance',
      align: 'center',
      render: (row) => getAttendanceStatus(row.attendanceStatus)
    }
  ];

  return (
    <div className="session-list-container">
      <div className="list-header">
        <h3>All Sessions ({sessions.length})</h3>
        <div className="filter-buttons">
          <FaFilter className="filter-icon" />
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="no-data">
          <p>No sessions found for the selected filter.</p>
        </div>
      ) : (
        <TableComponent rows={sessions} columns={columns} />
      )}
    </div>
  );
};

export default SessionList;
