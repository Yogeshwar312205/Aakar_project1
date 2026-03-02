import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FiArrowLeftCircle } from 'react-icons/fi';
import TableCo from '../../components/TableCo';
import Grade from './Grade';
import './ManagerEmployeeTrainingEnrolled.css';
import {saveEmployeeData} from './SkillMatrixAPI';
import {fetchEmployeesEnrolled} from './TrainingAPI';

const ManagerEmployeeTrainingEnrolled = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trainingId } = location.state || {};
  const [employeeData, setEmployeeData] = useState([]);
  const [skills, setSkills] = useState([]);
  const [gradeChanges, setGradeChanges] = useState({});
  const [newSelectedEmp, setNewSelectedEmp] = useState([]);
  const [removeEmp, setRemoveEmp] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployeeData = () => {
    if (!trainingId) {
      toast.error('Training ID is missing.');
      navigate(-1);
      return;
    }

    fetchEmployeesEnrolled(trainingId)
      .then((response) => {
        console.log("Training Id  : ",trainingId)
        console.log("Response Data : trainin planning : ",response);
        if (Array.isArray(response)) {
          const skillSet = new Set();
          const data = response.reduce((acc, curr) => {
            if (curr.skillName) {
              skillSet.add(curr.skillName);
            }

            let employee = acc.find((e) => e.employeeId === curr.employeeId);
            if (!employee) {
              employee = {
                srNo: acc.length + 1,
                employeeId: curr.employeeId,
                employeeName: curr.employeeName,
                departmentName: curr.departmentName,
                trainerFeedback: curr.trainerFeedback === 1 ? 'Pass' : curr.trainerFeedback === 0 ? 'Fail' : '',
                skills: {},
              };
              acc.push(employee);
            }

            if (curr.skillName) {
              employee.skills[curr.skillName] = {
                grade: curr.grade || null,
                skillId: curr.skillId,
              };
            }

            return acc;
          }, []);

          setSkills(Array.from(skillSet));
          setEmployeeData(data);
        } else {
          toast.error('Unexpected response format.');
        }
      })
      .catch((error) => toast.error('Error fetching employee data: ' + error.message));
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [trainingId, navigate]);

  const handleGradeChange = (employeeId, skillId, newGrade) => {
    setGradeChanges((prev) => ({
      ...prev,
      [`${employeeId}-${skillId}`]: { employeeId, skillId, grade: newGrade },
    }));
  
    // Update employee data with new grade
    setEmployeeData((prevData) =>
      prevData.map((employee) => {
        if (employee.employeeId === employeeId) {
          return {
            ...employee,
            skills: {
              ...employee.skills,
              [Object.keys(employee.skills).find(
                (key) => employee.skills[key].skillId === skillId
              )]: {
                ...employee.skills[Object.keys(employee.skills).find(
                  (key) => employee.skills[key].skillId === skillId
                )],
                grade: newGrade,
              },
            },
          };
        }
        return employee;
      })
    );
  
    // Add to removeEmp if grade has changed
    setRemoveEmp((prevRemoveEmp) => {
      const exists = prevRemoveEmp.some(
        (item) => item.employeeId === employeeId && item.skillId === skillId
      );
  
      if (!exists && newGrade !== null) {
        return [...prevRemoveEmp, { employeeId, skillId }];
      }
  
      return prevRemoveEmp;
    });
  };
  
  const handleUpdateGrades = () => {
    if (Object.keys(gradeChanges).length === 0) {
      toast.info('No changes to update.');
      return;
    }
  
    setLoading(true);
  
    saveEmployeeData(newSelectedEmp, removeEmp, gradeChanges)
      .then(() => {
        console.log("remove", removeEmp);
        toast.success('Grades updated successfully!');
        setGradeChanges({});
        setRemoveEmp([]); // Clear the removeEmp state after update
        fetchEmployeeData();
      })
      .catch((error) => {
        console.log('Error updating grades: ' + error.message);
      })
      .finally(() => setLoading(false));
  };
  

  const baseColumns = [
    { id: 'employeeName', label: 'Employee Name', align: 'center' },
    { id: 'departmentName', label: 'Department', align: 'center' },
    { id: 'trainerFeedback', label: 'Trainer Feedback', align: 'center' },
  ];

  const skillColumns = skills.map((skill) => ({
    id: skill,
    label: skill,
    align: 'center',
    render: (row) => (
      <Grade
        pemp_id={row.employeeId}
        pskill_id={row.skills[skill]?.skillId}
        pgrade={row.skills[skill]?.grade}
        onGradeChange={handleGradeChange}
        isChangable={row.trainerFeedback === 'Pass'}
      />
    ),
  }));

  const columns = [...baseColumns, ...skillColumns];

  const showUpdateButton = employeeData.some(
    (employee) => employee.trainerFeedback === 'Pass'
  );

  return (
    <div className="employee-training-enrolled-page">
      <div className="manager-employee-training-enrolled-title">
        <h2>Employees Enrolled for Training</h2>
      </div>

      <header className="employee-training-enrolled-dash-header">
        <FiArrowLeftCircle className="employeeSwitch-back-button" onClick={() => navigate(-1)} title="Go back" />
        <h4 className="employeeSwitch-title">View Training Details</h4>
      </header>

      {showUpdateButton && (
        <button
          className="employee-save-feedback-button"
          onClick={handleUpdateGrades}
          disabled={loading || Object.keys(gradeChanges).length === 0}
        >
          {loading ? 'Updating...' : 'Update Grade'}
        </button>
      )}

      <div className='manager-employee-training-container'>
        <TableCo rows={employeeData} columns={columns} />
      </div>

      <ToastContainer />
    </div>
  );
};

export default ManagerEmployeeTrainingEnrolled;
