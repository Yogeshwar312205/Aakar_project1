import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { viewAttendance } from './trainerapi'; // Import the API function
import { FiArrowLeftCircle } from 'react-icons/fi';
import TableComponent from '../../components/TableCo';
import './TrainerAttendance.css';

const TrainerViewAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, trainingId } = location.state || {};
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    loadAttendanceData();
  }, [sessionId, navigate, trainingId]);

    const loadAttendanceData = async () => {
    try {
      const response = await viewAttendance(sessionId);
      if (Array.isArray(response.data)) {
        setAttendanceData(
          response.data.map((record) => ({
            ...record,
            attendanceStatus: record.attendanceStatus === 1 ? 'Present' : 'Absent',
          }))
        );
      } 
    } catch (error) {
      navigate(`/TrainerAttendance`, { state: { trainingId, sessionId } });
    }
  };


  const columns = [
    { id: 'employeeName', label: 'Employee Name', align: 'left' },
    { id: 'departmentName', label: 'Department', align: 'left' },
    { id: 'attendanceStatus', label: 'Attendance Status', align: 'center' },
  ];

  const rowClassName = (employeeId) => {
    const employee = attendanceData.find((row) => row.employeeId === employeeId);

    if (!employee || !employee.attendanceStatus) {
      return '';
    }
  };

  const handleEditAttendance = () => {
    navigate('/TrainerEditAttendance', { state: { sessionId, trainingId } });
  };

  return (
    <div className="TrainerAttendance-container">
      <div className='trainerattendance-title'><h2>Attendence Details</h2></div>
      
      <div className="trainerattendance-tablecomponent-container">
        <div className='trainerattendance-header-and-save'>
          <header className="trainerattendance-header">
            <FiArrowLeftCircle className="trainer-attendance-back-button" onClick={() => navigate(`/TrainerSwitch`)} title="Go back"/>
            <h4 className='trainer-attendance-title'>Session Details</h4>  
          </header>
          <button className="TrainerAttendance-save-button" onClick={handleEditAttendance}>
            Edit Attendance
          </button>
        </div>
        {attendanceData.length === 0 ? (
          <div className="TrainerViewAttendance-no-records-message">
            <p>No attendance record found. Redirecting to attendance filling page...</p>
          </div>
        ) : (
          <TableComponent
            rows={attendanceData}
            columns={columns}
            items={attendanceData}
            itemKey="employeeId"
            itemLabel="employeeName"
            searchLabel="Search Employee"
            //setFilteredData={setFilteredTrainings}
          />
        )}
      </div>
    </div>
  );
};

export default TrainerViewAttendance;
