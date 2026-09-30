import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaChartPie, FaCalendarAlt } from 'react-icons/fa';

const AttendanceStats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="attendance-stats-container">
        <h3>Attendance Statistics</h3>
        <p>No attendance data available.</p>
      </div>
    );
  }

  const attendedPercentage = stats.overallAttendancePercentage || 0;
  const missedPercentage = stats.pastSessions > 0 
    ? Math.round((stats.missedSessions / stats.pastSessions) * 100) 
    : 0;

  return (
    <div className="attendance-stats-container">
      <h3>
        <FaChartPie className="section-icon" />
        Attendance Statistics
      </h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{stats.totalSessions || 0}</div>
          <div className="stat-label">
            <FaCalendarAlt /> Total Sessions
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-value">{stats.pastSessions || 0}</div>
          <div className="stat-label">
            <FaCalendarAlt /> Past Sessions
          </div>
        </div>

        <div className="stat-item success">
          <div className="stat-value">{stats.attendedSessions || 0}</div>
          <div className="stat-label">
            <FaCheckCircle /> Attended
          </div>
        </div>

        <div className="stat-item danger">
          <div className="stat-value">{stats.missedSessions || 0}</div>
          <div className="stat-label">
            <FaTimesCircle /> Missed
          </div>
        </div>
      </div>

      <div className="attendance-breakdown">
        <h4>Attendance Breakdown</h4>
        <div className="breakdown-bar">
          <div 
            className="breakdown-segment attended" 
            style={{ width: `${attendedPercentage}%` }}
            title={`Attended: ${attendedPercentage}%`}
          >
            {attendedPercentage > 15 && `${attendedPercentage}%`}
          </div>
          <div 
            className="breakdown-segment missed" 
            style={{ width: `${missedPercentage}%` }}
            title={`Missed: ${missedPercentage}%`}
          >
            {missedPercentage > 15 && `${missedPercentage}%`}
          </div>
        </div>
        <div className="breakdown-legend">
          <span className="legend-item">
            <span className="legend-color attended"></span>
            Attended ({stats.attendedSessions})
          </span>
          <span className="legend-item">
            <span className="legend-color missed"></span>
            Missed ({stats.missedSessions})
          </span>
        </div>
      </div>

      <div className="upcoming-info">
        <p>
          <strong>{stats.upcomingSessions || 0}</strong> upcoming sessions scheduled
        </p>
        {stats.todaySessions > 0 && (
          <p className="today-highlight">
            <strong>{stats.todaySessions}</strong> session(s) today!
          </p>
        )}
      </div>
    </div>
  );
};

export default AttendanceStats;
