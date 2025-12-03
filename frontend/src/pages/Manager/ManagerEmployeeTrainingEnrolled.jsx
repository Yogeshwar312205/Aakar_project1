import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FiArrowLeftCircle, FiFileText } from 'react-icons/fi';
import { Modal, Box, Typography } from "@mui/material";
import TableCo from '../../components/TableCo';
import Grade from './Grade';
import './ManagerEmployeeTrainingEnrolled.css';
import { saveEmployeeData } from './SkillMatrixAPI';
import { fetchEmployeesEnrolled } from './TrainingAPI';
import reportMetadata from "./reportMetadata.json"; // Import metadata JSON
import ReportGenerator from "./ReportGenerator"; // PDF generation component
import dayjs from "dayjs";  // Import day.js

const ManagerEmployeeTrainingEnrolled = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trainingId, trainingTitle, trainerName, startTrainingDate, endTrainingDate } = location.state || {};
  const [employeeData, setEmployeeData] = useState([]);
  const [skills, setSkills] = useState([]);
  const [gradeChanges, setGradeChanges] = useState({});
  const [newSelectedEmp, setNewSelectedEmp] = useState([]);
  const [removeEmp, setRemoveEmp] = useState([]);
  const [sessionDate, setSessionDate] = useState("");  // Initialize state
  const [loading, setLoading] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [metadata, setMetadata] = useState({});
  const today = dayjs(new Date()).format("DD-MM-YYYY");
  

  const fetchEmployeeData = () => {
    if (!trainingId) {
      toast.error('Training ID is missing.');
      console.log("ttt", trainingId);
      navigate(-1);
      return;
    }

    fetchEmployeesEnrolled(trainingId)
      .then((response) => {
        if (Array.isArray(response)) {
          const skillSet = new Set();
          const data = response.reduce((acc, curr) => {
            if (curr.skillName) {
              skillSet.add(curr.skillName);
            }

            let employee = acc.find((e) => e.employeeId === curr.employeeId);
            if (!employee) {
              employee = {
                employeeId: curr.employeeId,
                employeeName: curr.employeeName,
                departmentName: curr.departmentName,
                trainerFeedback: curr.trainerFeedback,
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

  const handleAttendanceReport = async (employeeId, trainingId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/attendance-report`, {
        params: { employeeId, trainingId }
      });
  
      console.log("trainingId:", trainingId);
      console.log("employeeId:", employeeId);
      console.log("response:", response.data.attendanceRecords);
  
      if (response.data.attendanceRecords && response.data.attendanceRecords.length > 0) {
        const formattedDate = dayjs(response.data.attendanceRecords[0].sessionDate).format("DD-MM-YYYY");
  
        const records = response.data.attendanceRecords.map(record => ({
          sessionName: record.sessionName,
          attendanceStatus: record.attendanceStatus
        }));
  
        const headers = [
          { id: "sessionName", label: "Session Name", align: "center" },
          { id: "attendanceStatus", label: "Attendance Status", align: "center" },
        ];
  
        // Extract relevant metadata under "Report Title" header
        const reportMetadataValues = reportMetadata["Training Attendance Report"] || {}; 
  
        setMetadata(reportMetadataValues); // Store metadata directly from JSON
        setAttendanceData({ headers, records });
        setSessionDate(formattedDate); // Store sessionDate separately
        setAttendanceModalOpen(true);
        console.log("metadata:", metadata);
      } else {
        toast.info("No attendance records found.");
      }
    } catch (error) {
      toast.error("Error fetching attendance report: " + error.message);
    }
  };
  
  const handleGradeChange = (employeeId, skillId, newGrade) => {
    setGradeChanges((prev) => ({
      ...prev,
      [`${employeeId}-${skillId}`]: { employeeId, skillId, grade: newGrade },
    }));

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
        toast.success('Grades updated successfully!');
        setGradeChanges({});
        setRemoveEmp([]);
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
        isChangable={row}
        // isChangable={row.trainerFeedback === 'Pass'}
      />
    ),
  }));

  const attendanceColumn = {
    id: 'attendanceReport',
    label: 'Attendance Report',
    align: 'center',
    render: (row) => (
      <FiFileText
        className="attendance-icon"
        onClick={() => handleAttendanceReport(row.employeeId, trainingId)}
        title="View Attendance Report"
        style={{ cursor: 'pointer', color: '#007bff' }}
      />
    ),
  };

  const columns = [...baseColumns, ...skillColumns, attendanceColumn];

  // const showUpdateButton = employeeData.some(
  //   (employee) => employee.trainerFeedback === 'Pass'
  // );

  return (
    <div className="employee-training-enrolled-page">
      <div className="manager-employee-training-enrolled-title">
        <h2>Employees Enrolled for Training</h2>
      </div>

      <header className="employee-training-enrolled-dash-header">
        <FiArrowLeftCircle className="employeeSwitch-back-button" onClick={() => navigate(-1)} title="Go back" />
        <h4 className="employeeSwitch-title">View Training Details</h4>
      </header>

      {
        <button
          className="employee-save-feedback-button"
          onClick={handleUpdateGrades}
          disabled={loading || Object.keys(gradeChanges).length === 0}
        >
          {loading ? 'Updating...' : 'Update Grade'}
        </button>
      }

      <div className='manager-employee-training-container'>
        <TableCo rows={employeeData} columns={columns} />
      </div>

      {/* Attendance Report Modal */}
      {/* <Modal open={attendanceModalOpen} onClose={() => setAttendanceModalOpen(false)}>
        <Box sx={{ width: "80%", margin: "auto", mt: 5, backgroundColor: "white", padding: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Attendance Report
          </Typography> */}
          {attendanceData && (
            <ReportGenerator 
            reportTitle = "Training Attendance Sheet" 
            docNo={metadata.docNo}
            OriginDate={metadata.OriginDate}
            revNo={metadata.revNo}
            revDate={metadata.revDate}
            trainerName = {trainerName} //pass "Trainer name: "
            location = "pune"
            trainingTitle = {trainingTitle}
            startTrainingDate = {startTrainingDate}
            sessionDate={sessionDate}
            endTrainingDate = {endTrainingDate}
            tableHeaders={attendanceData.headers}
            tableData={attendanceData.records || []}
            />
          )}
        {/* </Box>
      </Modal> */}

      <ToastContainer />
    </div>
  );
};

export default ManagerEmployeeTrainingEnrolled;
