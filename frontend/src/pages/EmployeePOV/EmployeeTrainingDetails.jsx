import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Textfield from '../../components/Textfield';
import TableComponent from '../../components/TableCo';
import '../Overall/TrainingDetails.css';
import { FiArrowLeftCircle } from 'react-icons/fi';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { fetchAllSessions, fetchAttendanceForSession } from './employeeapi';

const EmployeeTrainingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState([]);
  
  const [attendanceStatuses, setAttendanceStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { 
    employeeId,
    trainingId, 
    trainingTitle, 
    trainerName, 
    startTrainingDate, 
    endTrainingDate 
  } = location.state || {};

  useEffect(() => {
    if (employeeId && trainingId){
      fetchAllSession();
      loadAttendanceData();
    } else {
      console.error("Employee ID is missing!");
      toast.error("Failed to fetch employee data. Employee ID is not available.");
      navigate(-1);
    }
    // if (sessionData.length > 0){
    //   loadAttendanceData();
    // } else {
    //   console.error("sessionData is missing!");
    //   toast.error("sessionData is missing");
    //   navigate(-1);
    // }
  }, [employeeId, trainingId, sessionData]);

  const fetchAllSession = async () => {
    try {
      const sessions = await fetchAllSessions(trainingId);
      const updatedData = sessions.map(data => ({
        ...data ,
        sessionDate: dayjs(data.sessionDate).format("DD-MM-YYYY"),
      }));
      setSessionData(updatedData);
    } catch (error) {
      console.error("Error fetching session data:", error);
      setError("Failed to fetch session data.");
    }
  };

  const loadAttendanceData = async () => {
    try {
      if (!sessionData || sessionData.length === 0) return;

      const statuses = {};
      for (const session of sessionData) {
        if (session.sessionId) {
          const attendanceStatus = await fetchAttendanceForSession(employeeId, session.sessionId);
          statuses[session.sessionId] = attendanceStatus;
        }
      }
      setAttendanceStatuses(statuses);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Failed to fetch attendance data.");
    } finally {
      setLoading(false);
    }
  };

if (loading) {
  return <p>Loading attendance data...</p>;
}

if (error) {
  return <p>Error loading attendance data: {error}</p>;
}

  const sessionColumns = [
    { id: 'sessionName', label: 'Session Name' },
    { id: 'sessionDate', label: 'Date'},
    { id: 'sessionStartTime', label: 'Start Time' },
    { id: 'sessionEndTime', label: 'End Time' },
    { id: 'sessionDescription', label: 'Session Description' },
    {
      id: 'attendanceStatus',
      label: 'Attendance Status',
      render: (row) => attendanceStatuses[row.sessionId] === 1 ? 'Present' : attendanceStatuses[row.sessionId] === 0 ? 'Absent' : '-',
    },
  ];

  return (
    <div className="training-details-page">
      <div className="training-main-content">
        <header className="training-details-dash-header">
          <FiArrowLeftCircle
            className="employeeSwitch-back-button"
            onClick={() => navigate(-1)}
            title="Go back"
          />
          <h4 className='employeeSwitch-title'>All Trainings</h4>
        </header>
        <section className="training-details-section">
          <h3 className='employee-training-details-title'>Training Details</h3>
          <div className="training-details-form">
            <Textfield label="Training Name" value={trainingTitle || ''} readOnly />
            <Textfield label="Trainer Name" value={trainerName || ''} readOnly />
            <Textfield label="Start Date" value={startTrainingDate || ''} readOnly />
            <Textfield label="End Date" value={endTrainingDate || ''} readOnly />
          </div>
        </section>
        <section className="training-details-session-details-section">
          <h3 className='employee-training-details-title'>Session Details</h3>
          <TableComponent
            rows={sessionData}
            columns={sessionColumns}
            linkBasePath={null} 
          />
        </section>
      </div>
    </div>
  );
};

export default EmployeeTrainingDetails;