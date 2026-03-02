import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeftCircle } from 'react-icons/fi';
import TableCo from '../../components/TableCo';
import { fetchEmployeesEnrolled, saveFeedback } from './trainerapi';
import './EmployeeTrainingEnrolled.css';

const EmployeeTrainingEnrolled = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trainingId, active } = location.state || {};
  const [employeeData, setEmployeeData] = useState([]);
  const [feedbackData, setFeedbackData] = useState({});

  useEffect(() => {
    if (!trainingId) {
      toast.error('Training ID is missing.');
      navigate(-1);
      return;
    }

    const loadEmployees = async () => {
      try {
        const employees = await fetchEmployeesEnrolled(trainingId);
        const data = employees.map((employee) => ({
          ...employee,
          employeeId: employee.employeeId || employee.id,
        }));
        setEmployeeData(data);

        // Initialize feedbackData with trainerFeedback
        const initialFeedback = {};
        data.forEach((employee) => {
          initialFeedback[employee.employeeId] = employee.trainerFeedback;
        });
        setFeedbackData(initialFeedback);
      } catch (error) {
       // toast.error('Error fetching employee data. Please try again later.');
      }
    };

    loadEmployees();
  }, [trainingId, navigate]);

  const handleFeedbackChange = (employeeId, feedback) => {
    setFeedbackData((prev) => ({
      ...prev,
      [employeeId]: feedback,
    }));
  };

  const handleSaveFeedback = async () => {
    console.log("feed")
    const feedbackArray = Object.keys(feedbackData).map((employeeId) => ({
      employeeId,
      trainerFeedback: feedbackData[employeeId],
      trainingId,
    }));

    try {
      await saveFeedback(feedbackArray);
      toast.success("Feedback saved sucessfully");
    } catch (error) {
      toast.error('Error saving feedback. Please try again.');
    }
  };

  const handleSelectAllFeedback = (feedback) => {
    const updatedFeedback = {};
    employeeData.forEach((employee) => {
      updatedFeedback[employee.employeeId] = feedback;
    });
    setFeedbackData(updatedFeedback);
  };

  const columns = [
    { id: 'employeeName', label: 'Employee Name', align: 'center' },
    { id: 'departmentName', label: 'Department', align: 'center' },
    ...(active === 1 ? [{
      id: 'trainerFeedback',
      label: 'Trainer Feedback',
      render: (row) => (
        <div className="trainer-feedback-buttons">
          <button
            className={`trainer-feedback-button ${feedbackData[row.employeeId] === 1 ? 'pass' : ''}`}
            onClick={() => handleFeedbackChange(row.employeeId, 1)}
            disabled={!active}
          >
            Pass
          </button>
          <button
            className={`trainer-feedback-button ${feedbackData[row.employeeId] === 0 ? 'fail' : ''}`}
            onClick={() => handleFeedbackChange(row.employeeId, 0)}
            disabled={!active}
          >
            Fail
          </button>
        </div>
      ),
    },] : []),
    
  ];

  return (
    <div className="employee-training-enrolled-page">
      <div className="employee-training-enrolled-title">
        <h2>Employees Enrolled for Training</h2>
      </div>

      <div className="TableComponent-container">
        <header className="employee-training-enrolled-header">
          <FiArrowLeftCircle
            className="employeeSwitch-back-button"
            onClick={() => navigate(`/TrainerSwitch`)}
            title="Go back"
          />
          <h4 className="employeeSwitch-title">View Training Details</h4>
        </header>

        <div className="employee-training-enrolled-buttons">
          {active === 1 && (
            <>
              <button
                className="employee-save-feedback-button"
                onClick={handleSaveFeedback}
                disabled={!active}
              >
                Save
              </button>
              <div className="select-all-buttons">
                <button onClick={() => handleSelectAllFeedback(1)}>Select All Pass</button>
                <button onClick={() => handleSelectAllFeedback(0)}>Select All Fail</button>
              </div>
            </>
          )}
        </div>

        <div className="enrolled-TableComponent-scrollbar">
          <TableCo rows={employeeData} 
          columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeTrainingEnrolled;
