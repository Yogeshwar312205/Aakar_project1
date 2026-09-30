import React from 'react';
import { FaClock, FaCheckCircle, FaExclamationCircle, FaHourglassHalf } from 'react-icons/fa';

const TodaySessionsWidget = ({ sessions }) => {
  const getAttendanceIcon = (status) => {
    if (status === 1) return <FaCheckCircle className="status-icon present" />;
    if (status === 0) return <FaExclamationCircle className="status-icon absent" />;
    return <FaHourglassHalf className="status-icon pending" />;
  };

  const getAttendanceText = (status) => {
    if (status === 1) return 'Present';
    if (status === 0) return 'Absent';
    return 'Pending';
  };

  return (
    <div className="today-sessions-widget">
      <div className="widget-header">
        <FaClock className="header-icon" />
        <h3>Today's Sessions ({sessions.length})</h3>
      </div>
      
      <div className="sessions-list">
        {sessions.map((session) => (
          <div key={session.sessionId} className="session-item">
            <div className="session-info">
              <h4>{session.sessionName}</h4>
              <p className="training-name">{session.trainingTitle}</p>
              <p className="trainer-name">Trainer: {session.trainerName}</p>
            </div>
            
            <div className="session-time">
              <span className="time">
                {session.sessionStartTime} - {session.sessionEndTime}
              </span>
            </div>
            
            <div className="session-status">
              {getAttendanceIcon(session.attendanceStatus)}
              <span className={`status-text ${getAttendanceText(session.attendanceStatus).toLowerCase()}`}>
                {getAttendanceText(session.attendanceStatus)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaySessionsWidget;
