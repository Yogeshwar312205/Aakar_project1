import React from 'react';
import { FaUser, FaCalendar, FaCheckCircle } from 'react-icons/fa';

const TrainingCard = ({ training, onClick }) => {
  const getStatusClass = (status) => {
    if (status === 'Ongoing') return 'status-ongoing';
    if (status === 'Completed') return 'status-completed';
    return 'status-not-started';
  };

  const getProgressPercentage = () => {
    if (training.totalSessions === 0) return 0;
    return Math.round((training.completedSessions / training.totalSessions) * 100);
  };

  const getAttendanceColor = () => {
    const percentage = training.attendancePercentage || 0;
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className="training-card" onClick={onClick}>
      <div className="card-header">
        <h4>{training.trainingTitle}</h4>
        <span className={`status-badge ${getStatusClass(training.trainingStatus)}`}>
          {training.trainingStatus}
        </span>
      </div>

      <div className="card-body">
        <div className="card-info-block">
          <div className="info-label">
            <FaUser className="info-icon" />
            <span className="label-text">Trainer:</span>
          </div>
          <div className="info-value">{training.trainerName}</div>
        </div>

        <div className="card-info-block">
          <div className="info-label">
            <FaCalendar className="info-icon" />
            <span className="label-text">Duration:</span>
          </div>
          <div className="info-value">{training.startTrainingDate} to {training.endTrainingDate}</div>
        </div>

        {training.skills && (
          <div className="skills-container">
            {training.skills.split(',').map((skill, index) => (
              <span key={index} className="skill-badge">{skill.trim()}</span>
            ))}
          </div>
        )}
      </div>

      <div className="card-progress">
        <div className="progress-header">
          <span>Session Progress</span>
          <span className="progress-text">
            {training.completedSessions || 0}/{training.totalSessions || 0}
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      <div className="card-footer">
        <div className="attendance-info">
          <FaCheckCircle style={{ color: getAttendanceColor() }} />
          <span>Attendance: {training.attendancePercentage || 0}%</span>
        </div>
        <div className="sessions-info">
          <span>{training.attendedSessions || 0} sessions attended</span>
        </div>
      </div>
    </div>
  );
};

export default TrainingCard;
