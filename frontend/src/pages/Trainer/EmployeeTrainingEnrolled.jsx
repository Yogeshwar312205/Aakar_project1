import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeftCircle } from 'react-icons/fi';
import TableCo from '../../components/TableCo';
import { fetchEmployeesEnrolled, saveFeedback } from './trainerapi';
import Grade from '../Manager/Grade';
import axios from 'axios';
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

  const handleGradeChange = async (employeeId, skillId, newGrade) => {
    try {
      await axios.post('http://localhost:3000/update-grade', {
        employeeId,
        skillId,
        grade: newGrade,
      });
      setEmployeeData((prev) =>
        prev.map((emp) =>
          emp.employeeId === employeeId ? { ...emp, grade: newGrade } : emp
        )
      );
      if (newGrade === 4) {
        toast.success(`All 4 ticked! Employee is now eligible as an Internal Trainer for this skill.`);
      } else {
        toast.success(`Skill grade updated to ${newGrade}`);
      }
    } catch (err) {
      console.error('Error updating grade:', err);
      toast.error('Failed to update grade.');
    }
  };

  const columns = [
    { id: 'employeeName', label: 'Employee Name', align: 'center' },
    { id: 'departmentName', label: 'Department', align: 'center' },
    {
      id: 'skillGrade',
      label: 'Skill & Grade (4 = Internal Trainer)',
      align: 'center',
      render: (row) => (
        row.skillId ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '11px', color: '#555', fontWeight: '600' }}>{row.skillName}</span>
            <Grade
              pemp_id={row.employeeId}
              pskill_id={row.skillId}
              pgrade={row.grade || 0}
              onGradeChange={(empId, sId, newGrade) => handleGradeChange(empId, sId, newGrade)}
              isChangable={true}
            />
            {row.grade === 4 && (
              <span style={{ fontSize: '10px', color: '#2e7d32', fontWeight: 'bold' }}>✓ Internal Trainer</span>
            )}
          </div>
        ) : (
          <span style={{ color: '#999', fontSize: '12px' }}>—</span>
        )
      ),
    },
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
