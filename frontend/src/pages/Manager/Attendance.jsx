import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Attendance.css';
import { FiArrowLeftCircle } from 'react-icons/fi';
import TableComponent from '../../components/TableComponent'; 
import { fetchSessionAttendance } from './TrainingAPI';

const Attendance = () => {
  const { sessionId } = useParams(); 
  const [attendanceData, setAttendanceData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) loadAttendanceData();
  }, [sessionId]);

  const loadAttendanceData = async () => {
    try {
      const data = await fetchSessionAttendance(sessionId);
      setAttendanceData(data);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };

  const columns = [
    { id: 'employeeName', label: 'Employee Name', align: 'left' },
    { 
      id: 'attendanceStatus', 
      label: 'Attendance Status', 
      align: 'left',
      render: (row) => (row.attendanceStatus === 1 ? 'Present' : 'Absent') 
    }
  ];

  return (
    <div className="attendance-container">
      <div className='manager-attendance-title'><h2>Session Attendance</h2></div>

      <header className="attendance-dash-header">
        <FiArrowLeftCircle className="employeeSwitch-back-button" onClick={() => navigate(-1)} title="Go back"/>
        <h4 className='employeeSwitch-title'>Training Details</h4>
      </header>

      <div className='attendance-table-container'>
        <TableComponent 
          rows={attendanceData} 
          columns={columns} 
          linkBasePath={null} 
        />
      </div>
    </div>
  );
};

export default Attendance;
