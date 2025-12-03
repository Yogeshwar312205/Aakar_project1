import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Attendance.css';
import ReportGenerator from "./ReportGenerator"; // PDF generation component
import reportMetadata from "./reportMetadata.json"; // Import metadata JSON
import { FiArrowLeftCircle, FiFileText } from 'react-icons/fi';
import TableComponent from '../../components/TableCo'; 
import { fetchSessionAttendance } from './TrainingAPI';

const Attendance = () => {
  const location = useLocation();
  const { sessionId } = useParams(); 
  const [attendanceData, setAttendanceData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { trainingId, trainingTitle, trainerName, startTrainingDate, endTrainingDate } = location.state || {};
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
    setMetadata(reportMetadataValues); // Store metadata directly from JSON
    setIsReportModalOpen(true);
  }

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
        <button className="training-details-report-button" onClick={handleReport}>
          <FiFileText size={18} />
          Session Attendance Report
        </button>
        <TableComponent 
          rows={attendanceData} 
          columns={columns} 
          linkBasePath={null} 
        />
         {/* Report Modal */}
         {metadata && (
                    <ReportGenerator
                        reportTitle="Training Information"
                        docNo={metadata.docNo}
                        OriginDate={metadata.OriginDate}
                        revNo={metadata.revNo}
                        revDate={metadata.revDate}
                        trainerName = {trainerName || []}
                        location = "Training Location: pune"
                        trainingTitle = {trainingTitle || []}
                        startTrainingDate = {startTrainingDate || []}
                        endTrainingDate = {endTrainingDate || []}
                        tableHeaders={['Employee Name', 'Attendance Status']}
                        tableData={attendanceData.map((attendance, index) => ({
                        employeeName: attendance.employeeName,
                        attendanceStatus: attendance.attendanceStatus === 1 ? 'Present' : 'Absent'
                      }))} 
                    />
                    )}
      </div>
    </div>
  );
};

export default Attendance;
