import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiArrowLeftCircle } from 'react-icons/fi';
import { fetchEmployeesEnrolled, saveAttendance } from './trainerapi'; // Import the API functions
import './TrainerAttendance.css';
import TableComponent from '../../components/TableCo'; // Updated TableCo reference

const AttendancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trainingId, sessionId } = location.state || {};
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Fetch employee data for the training session
  useEffect(() => {
    if (!trainingId) {
      toast.error('Training ID is missing.');
      navigate(-1);
      return;
    }
    loadEmployeeData();
  }, [trainingId, navigate]);

  const loadEmployeeData = async () => {
      const employees = await fetchEmployeesEnrolled(trainingId);
      if (Array.isArray(employees)) {
        setEmployeeData(
          employees.map((employee) => ({
            ...employee,
            employeeId: employee.employeeId || employee.id,
          }))
        );
    } 
  };

  // Handle checkbox selection changes
  const handleCheckboxChange = (selectedRows) => {
    if (Array.isArray(selectedRows)) {
      // Extract only the employeeId from each row
      const selectedIds = selectedRows.map((row) => row.employeeId);
      console.log('Selected employee IDs:', selectedIds); // Debugging employee IDs
      setSelectedEmployees(selectedIds);
    } else {
      console.error('Expected selectedRows to be an array, but received:', selectedRows);
    }
  };
  
  const handleSaveAttendance = async () => {
    const attendanceData = employeeData.map((employee) => ({
      employeeId: employee.employeeId,
      sessionId,
      attendanceStatus: selectedEmployees.includes(employee.employeeId) ? 1 : 0,
    }));

    try {
      await saveAttendance(attendanceData);
      toast.success('Attendance saved successfully.');
      navigate('/TrainerViewAttendance', { state: { sessionId } });
    } catch (error) {
      //toast.error('Failed to save attendance. Please try again.');
      navigate('/TrainerViewAttendance', { state: { sessionId } });
    }
  };

  // Define columns for the table
  const columns = [
    {
      label: 'Employee Name',
      id: 'employeeName',
      align: 'center',
    },
    {
      label: 'Department',
      id: 'departmentName',
      align: 'center',
    },
  ];

  return (
    <div className="TrainerAttendance-container">
      <div className="trainerattendance-title">
        <h2>Fill Attendance</h2>
      </div>

      <div className="trainerattendance-tablecomponent-container">
        <div className="trainerattendance-header-and-save">
          <header className="trainerattendance-header">
            <FiArrowLeftCircle
              className="trainer-attendance-back-button"
              onClick={() => navigate('/TrainerSwitch')}
              title="Go back"
            />
            <h4 className="trainer-attendance-title">View Session Details</h4>
          </header>
          <button
            className="TrainerAttendance-save-button"
            onClick={handleSaveAttendance}
          >
            Save Attendance
          </button>
        </div>

        <TableComponent
          rows={employeeData}
         columns={columns}
         enableCheckbox
        onRowSelectionChange={handleCheckboxChange} // Correct the capitalization here
/>

      </div>
    </div>
  );
};

export default AttendancePage;
