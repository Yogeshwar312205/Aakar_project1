import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeftCircle, FiEdit, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import TableCo from '../../components/TableCo';
import './TrainerSwitch.css';
import GeneralSearchBar from '../../components/GenralSearchBar';
import { fetchTrainings, fetchTrainingEmployees } from './trainerapi';
import Modal from 'react-modal';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import Grade from '../Manager/Grade';
import axios from 'axios';
import TrainerReportGenerator from './TrainerReportGenerator';


const Tickit = ({ text, icon, onClick, count }) => (
  <button className="custom-button-all-training-ticket" onClick={onClick}>
    <span className="icon">{icon}</span>
    <span className="text">{text}</span>
    <span className="count">{count !== null ? count : 'Loading...'}</span>
  </button>
);


const TrainerSwitch = () => {
  const [trainings, setTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeesData, setEmployeesData] = useState([]);
  const [employeecount, setemployeecount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTrainerReport, setShowTrainerReport] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedTrainingForAttendance, setSelectedTrainingForAttendance] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState({ sessions: [], attendees: [] });
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const navigate = useNavigate();
  const employeeId = useSelector((state) => state.auth.user?.employeeId);
  const trainerName = useSelector((state) => state.auth.user?.employeeName);


  const getTrainingStatusLabel = (startDate, endDate) => {
    const start = dayjs(startDate).format("DD-MM-YYYY");
    const end = dayjs(endDate).format("DD-MM-YYYY");
    const today = dayjs(new Date()).format("DD-MM-YYYY");

    if (today >= start && today <= end) {
      return "Ongoing"
    } else if (today > end) {
      return "Completed"
    } else {
      return "Upcoming"
    }
  };
  useEffect(() => {
    if (employeeId) {
      loadTrainings();
    } else {
      console.error('Employee ID is missing!');
      toast.error('Failed to fetch employee data. Employee ID is not available.');
    }
  }, [employeeId]);

  const loadTrainings = async () => {
      const data = await fetchTrainings(employeeId);
      const updatedData = data.map(data => ({
        ...data ,
        startTrainingDate: dayjs(data.startTrainingDate).format("DD-MM-YYYY"),
        endTrainingDate: dayjs(data.endTrainingDate).format("DD-MM-YYYY"),
        "trainingStatus" : getTrainingStatusLabel(data.startTrainingDate, data.endTrainingDate)

      }))
      setTrainings(updatedData);
      setFilteredTrainings(updatedData);
  };

  const handleViewEmployees = async (setCount) => {
    if (trainings.length === 0) {
      console.error("No trainings available to fetch employees.");
      return;
    }

    try {
      const allEmployees = [];
      let totalEmployees = 0; // To track the total count

      for (const training of trainings) {
        const response = await fetchTrainingEmployees(training.trainingId);

        // Ensure response has the correct structure
        if (response && response.data) {
          const employeesWithDetails = response.data.map((employee) => ({
            ...employee,
            trainingId: training.trainingId,
            trainingTitle: training.trainingTitle,
            startTrainingDate: training.startTrainingDate,
            endTrainingDate:training.endTrainingDate,
          }));

          allEmployees.push(...employeesWithDetails);
          totalEmployees += response.count || employeesWithDetails.length; // Use `count` or fallback to data length
        }
      }

      setEmployeesData(allEmployees);
      console.log("data", allEmployees)
      setCount(totalEmployees);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setCount(0);
    }
  };

  useEffect(() => {
    if (trainings.length > 0) {
      handleViewEmployees(setemployeecount);
    }
  }, [trainings]);

  const modalopen1 = async () =>{
    setIsModalOpen(true);
  }

  const handleSearch = (selectedValue) => {
    setSearchTerm(selectedValue);
    if (!selectedValue) {
      setFilteredTrainings(trainings);
    } else {
      setFilteredTrainings(
        trainings.filter((training) => training.id === selectedValue.id)
      );
    }
  };

  const getTrainingStatus = (startDate, endDate) => {
    const today = dayjs(new Date()).format("DD-MM-YYYY");
    const start = startDate;
    const end = endDate;

    if (today >= start && today <= end) {
      return <span className="status-bubble ongoing">Ongoing</span>;
    } else if (today > end) {
      return <span className="status-bubble completed">Completed</span>;
    } else {
      return <span className="status-bubble upcoming">Upcoming</span>;
    }
  };

  const handleOpenAttendanceAndGrade = async (training) => {
    setSelectedTrainingForAttendance(training);
    setShowAttendanceModal(true);
    setLoadingAttendance(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/training/${training.trainingId}/full-attendance-summary`);
      setAttendanceSummary(response.data);
    } catch (err) {
      console.error('Error fetching attendance summary:', err);
      toast.error('Failed to load attendance & student data.');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleGradeChangeInModal = async (empId, skillId, newGrade) => {
    try {
      await axios.post('http://localhost:3000/update-grade', {
        employeeId: empId,
        skillId,
        grade: newGrade,
      });
      setAttendanceSummary(prev => ({
        ...prev,
        attendees: prev.attendees.map(att =>
          att.employeeId === empId ? { ...att, grade: newGrade } : att
        )
      }));
      if (newGrade === 4) {
        toast.success(`All 4 ticked! Student is now eligible as an Internal Trainer for this skill!`);
      } else {
        toast.success(`Grade updated to ${newGrade}`);
      }
    } catch (err) {
      console.error('Error updating grade:', err);
      toast.error('Failed to update grade.');
    }
  };

  const handleToggleAttendance = async (empId, sessionId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await axios.post('http://localhost:3000/api/attendance/update-single', {
        employeeId: empId,
        sessionId,
        attendanceStatus: newStatus
      });
      setAttendanceSummary(prev => ({
        ...prev,
        attendees: prev.attendees.map(att => {
          if (att.employeeId === empId) {
            const updatedSessions = att.sessions.map(s =>
              s.sessionId === sessionId ? { ...s, status: newStatus } : s
            );
            const attendedCount = updatedSessions.filter(s => s.status === 1).length;
            return {
              ...att,
              sessions: updatedSessions,
              attendedSessions: attendedCount,
              attendancePercentage: att.totalSessions > 0 ? Math.round((attendedCount / att.totalSessions) * 100) : 0
            };
          }
          return att;
        })
      }));
      toast.success(newStatus === 1 ? 'Marked Present' : 'Marked Absent');
    } catch (err) {
      console.error('Error updating attendance:', err);
      toast.error('Failed to update attendance.');
    }
  };

  const handleViewDetails = (training) => {
    const today = dayjs(new Date()).format("DD-MM-YYYY");
    const trainingEndDate = training.endTrainingDate;
    const isActive = today > trainingEndDate ? 1 : 0;
    console.log("traininId", training.trainingId)
    navigate('/TrainerTrainingDetails', {
      state: {
        trainingId: training.trainingId,
        trainingTitle: training.trainingTitle,
        startTrainingDate: training.startTrainingDate,
        endTrainingDate: training.endTrainingDate,
        skillNames: training.skillNames,
        active: isActive
      },
    });
  };

  const handleEmployeeViewDetails = (row) => {
    if (!row || !row.employeeId || !row.trainingId) {
      console.error('Required details are missing!');
      return;
    }

    navigate('/EmployeeTrainingDetails', {
      state: {
        employeeId: row.employeeId,
        trainingId: row.trainingId,
        trainingTitle: row.trainingTitle,
        trainerName: trainerName,
        startTrainingDate: row.startTrainingDate,
        endTrainingDate: row.endTrainingDate,
      },
    });
  };

  const renderSkillsBubbles = (skills) => {
    console.log("Rendered skills: ", skills);
    if (!skills || skills.trim() === '') {
      return <span>No Skills</span>;
    }

    const skillList = skills.split(', ');
    return (
      <div className="skills-bubbles-container">
        {skillList.map((skill, index) => (
          <span key={index} className="skill-bubble">{skill}</span>
        ))}
      </div>
    );
  };

  const columns = [
    { id: 'trainingTitle', label: 'Training Title', align: 'center' },
    { id: 'skillNames', label: 'Skills', align: 'center', render: (row) => renderSkillsBubbles(row.skillNames) },
    { id: 'startTrainingDate', label: 'Start Date', align: 'center'},
    { id: 'endTrainingDate', label: 'End Date', align: 'center'},
    { id: 'trainingStatus', label: 'Training Status', align: 'center', render: (row) => getTrainingStatus(row.startTrainingDate, row.endTrainingDate) },
    {
      id: 'attendanceAndGrade',
      label: 'Attendance & Grade',
      align: 'center',
      render: (row) => (
        <button
          style={{
            backgroundColor: '#0061A1',
            color: 'white',
            border: 'none',
            padding: '7px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            boxShadow: '0 2px 6px rgba(0, 97, 161, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onClick={() => handleOpenAttendanceAndGrade(row)}
        >
          📋 Attendance & Grade
        </button>
      ),
    },
    {
      id: 'actions',
      label: 'View Details',
      align: 'center',
      width: '20px',
      render: (row) => (
        <FiEdit
          onClick={() => handleViewDetails(row)}
          className="action-icon"
          size={18}
          style={{ color: '#0061A1', fontWeight: '900', align: 'right', marginLeft: '70px' }}
        />
      ),
    },
  ];

  const employeeColumns = [
    { id: 'employeeName', label: 'Employee Name', align: 'center' },
    { id: 'departmentName', label: 'Department', align: 'center' },
    { id: 'trainingTitle', label: 'Training Title', align: 'center' },
    { id: 'startTrainingDate', label: 'Start Date', align: 'center' },
    { id: 'endTrainingDate', label: 'End Date', align: 'center' },
    {
      id: 'actions',
      label: 'View Details',
      align: 'center',
      render: (row) => (
        <FiEdit
          onClick={() => handleEmployeeViewDetails(row)}
          className="action-icon"
          size={18}
          style={{ color: '#0061A1', fontWeight: '900', align: 'right', marginLeft: '50px' }}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="trainerSwitch-training-content">
        <div className="trainerSwitch-tickets">
          <div className="trainerSwitch-ticket" >
            <Tickit text="Total Trainings" count={trainings.length} />
            <Tickit
              text="Employees List"
              onClick={() => (trainings.length > 0 ? handleOpenAttendanceAndGrade(trainings[0]) : modalopen1())}
              count={employeecount}
            />
          </div>
        </div>
        <div className="trainerSwitch-search-bar-container">
          <GeneralSearchBar
            options={trainings}
            label="Search Training"
            displayKey="trainingTitle"
            isMultiSelect={false}
            selectedValues={searchTerm}
            setSelectedValues={handleSearch}
            includeSelectAll={false}
          />
          <button
            className="trainer-report-button"
            onClick={() => setShowTrainerReport(true)}
            disabled={trainings.length === 0}
          >
            Trainer Report
          </button>
        </div>
        <div className="trainerSwitch-table-container">
          <TableCo
            rows={filteredTrainings}
            columns={columns}
            items={trainings}
            itemKey="trainingId"
            searchLabel="Search Training"
          />
        </div>
      </div>

      {/* Attendance & Student Grading Modal */}
      {showAttendanceModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1200,
          }}
          onClick={() => setShowAttendanceModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '28px 32px',
              width: '92%',
              maxWidth: '980px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f0f4f8', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#002773', fontSize: '20px', fontWeight: 'bold' }}>
                  📋 Student Attendance & Skill Grading
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#555', fontSize: '14px' }}>
                  Training: <strong>{selectedTrainingForAttendance?.trainingTitle}</strong> &nbsp;|&nbsp;
                  Skill: <strong>{selectedTrainingForAttendance?.skillNames}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  color: '#888',
                  cursor: 'pointer',
                  lineHeight: '1',
                }}
              >
                &times;
              </button>
            </div>

            {loadingAttendance ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '15px' }}>
                Loading attendance records and student grades...
              </div>
            ) : attendanceSummary.attendees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No students enrolled in this training program yet.
              </div>
            ) : (
              <div>
                {/* Session list tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '18px', backgroundColor: '#f8fbff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e1ecf4' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0061A1' }}>Sessions ({attendanceSummary.sessions.length}):</span>
                  {attendanceSummary.sessions.map((sess, i) => (
                    <span
                      key={sess.sessionId}
                      style={{
                        fontSize: '12px',
                        backgroundColor: '#e6f0fa',
                        color: '#004f78',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}
                    >
                      #{i + 1} {sess.sessionName} ({dayjs(sess.sessionDate).format('DD MMM')})
                    </span>
                  ))}
                </div>

                {/* Attendees Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f4f8', color: '#002773', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>#</th>
                      <th style={{ padding: '10px 12px' }}>Student Name</th>
                      <th style={{ padding: '10px 12px' }}>Department</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Session Attendance (Click to toggle)</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Total Attendance</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Skill & Grade (4 = Internal Trainer)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceSummary.attendees.map((att, idx) => (
                      <tr key={att.employeeId} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', color: '#666' }}>{idx + 1}</td>
                        <td style={{ padding: '12px', fontWeight: '600', color: '#222' }}>{att.employeeName}</td>
                        <td style={{ padding: '12px', color: '#555' }}>{att.departmentName || '—'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {att.sessions.map((sess, sIdx) => (
                              <button
                                key={sess.sessionId}
                                onClick={() => handleToggleAttendance(att.employeeId, sess.sessionId, sess.status)}
                                title={`Session ${sIdx + 1}: ${sess.sessionName} — Click to toggle`}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '11px',
                                  backgroundColor: sess.status === 1 ? '#e8f5e9' : '#ffebee',
                                  color: sess.status === 1 ? '#2e7d32' : '#c62828',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                {sess.status === 1 ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                                S{sIdx + 1}: {sess.status === 1 ? 'Present' : 'Absent'}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span
                            style={{
                              backgroundColor: att.attendancePercentage >= 75 ? '#e8f5e9' : '#fff3e0',
                              color: att.attendancePercentage >= 75 ? '#2e7d32' : '#e65100',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}
                          >
                            {att.attendedSessions}/{att.totalSessions} ({att.attendancePercentage}%)
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                            <span style={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>{att.skillName}</span>
                            <Grade
                              pemp_id={att.employeeId}
                              pskill_id={att.skillId}
                              pgrade={att.grade || 0}
                              onGradeChange={(empId, sId, newGrade) => handleGradeChangeInModal(empId, sId, newGrade)}
                              isChangable={true}
                            />
                            {att.grade === 4 && (
                              <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 'bold' }}>
                                ✓ Qualified as Internal Trainer
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <button
                style={{
                  backgroundColor: '#0061A1',
                  color: 'white',
                  border: 'none',
                  padding: '9px 24px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
                onClick={() => setShowAttendanceModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setIsModalOpen(false)}>
              &times;
            </button>
            <TableCo rows={employeesData} columns={employeeColumns} />
          </div>
        </div>
      )}

      {/* Trainer Report Generator */}
      {showTrainerReport && (
        <TrainerReportGenerator
          trainerName={trainerName}
          trainingsData={trainings}
          onClose={() => setShowTrainerReport(false)}
        />
      )}
    </div>
  );
};

export default TrainerSwitch;
