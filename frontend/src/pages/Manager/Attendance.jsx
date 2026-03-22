import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Attendance.css';
import SessionAttendanceReport from "./SessionAttendanceReport";
import reportMetadata from "./reportMetadata.json";
import { FiArrowLeftCircle, FiFileText } from 'react-icons/fi';
import TableComponent from '../../components/TableCo';
import { fetchSessionAttendance } from './TrainingAPI';

const Attendance = () => {
  const location = useLocation();
  const { sessionId } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportKey, setReportKey] = useState(0);
  const { trainingId, trainingTitle, trainerName, startTrainingDate, endTrainingDate, sessionName, sessionDate, sessionTime } = location.state || {};
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

  const handleReport = () => {
    const reportMetadataValues = reportMetadata["Safety Training Report"] || {};
    setMetadata(reportMetadataValues);
    setIsReportModalOpen(true);
    setReportKey(prev => prev + 1);
  };

  const handleReportClose = () => {
    setIsReportModalOpen(false);
  };

  console.log('Attendance data:', attendanceData);
  console.log(trainingId, trainingTitle, trainerName, startTrainingDate, endTrainingDate);

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
        <button
          className="training-details-report-button"
          onClick={handleReport}
          style={{
            backgroundColor: '#2E7D32',
            color: '#fff',
            border: '2px solid #1B5E20',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            marginBottom: '15px',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#1B5E20';
            e.target.style.boxShadow = '0 4px 8px rgba(46, 125, 50, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#2E7D32';
            e.target.style.boxShadow = 'none';
          }}
        >
          <FiFileText size={18} />
          Session Attendance Report
        </button>
        <TableComponent
          rows={attendanceData}
          columns={columns}
          linkBasePath={null}
        />

        {/* Session Attendance Report Modal */}
        {metadata && isReportModalOpen && (
          <SessionAttendanceReport
            key={reportKey}
            trainingTitle={trainingTitle}
            trainerName={trainerName}
            sessionName={sessionName}
            sessionDate={sessionDate}
            sessionTime={sessionTime}
            startTrainingDate={startTrainingDate}
            endTrainingDate={endTrainingDate}
            location="Training Location: Pune"
            attendanceData={attendanceData}
            docNo={metadata.docNo}
            OriginDate={metadata.OriginDate}
            revNo={metadata.revNo}
            revDate={metadata.revDate}
            onClose={handleReportClose}
          />
        )}
      </div>
    </div>
  );
};

export default Attendance;
