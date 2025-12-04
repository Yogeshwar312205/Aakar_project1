import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Textfield from '../../components/Textfield';
import TableComponent from '../../components/TableCo'; 
import ReportGenerator from "./ReportGenerator"; // PDF generation component
import '../Overall/TrainingDetails.css';
import { FiEye, FiArrowLeftCircle, FiFileText } from 'react-icons/fi';
import dayjs from 'dayjs';
import { fetchTrainingSessions, fetchSessionAttendance, fetchEmployeesEnrolled } from './TrainingAPI';
import reportMetadata from "./reportMetadata.json"; // Import metadata JSON
import { Modal, Box } from '@mui/material';

const TrainingDetails = () => {
    const location = useLocation();
    const { trainingId, trainingTitle, trainerName, startTrainingDate, endTrainingDate } = location.state || {};
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        if (trainingId) loadSessionData();
    }, [trainingId]);

    const loadSessionData = async () => {
        try {
            const sessions = await fetchTrainingSessions(trainingId);
            
            // Fetch enrolled employees (expected attendees)
            const enrolledEmployees = await fetchEmployeesEnrolled(trainingId);
            const expectedCount = enrolledEmployees?.length || 0;
            const expectedNames = enrolledEmployees?.map(e => e.employeeName || e.name).join(', ') || 'N/A';
            
            // Enhance session data with attendance statistics
            const enhancedSessions = await Promise.all(
                sessions.map(async (session) => {
                    try {
                        const attendanceData = await fetchSessionAttendance(session.sessionId);
                        
                        // Get attended employee names from this specific session's attendance
                        const attendedEmployees = attendanceData.filter(r => r.attendanceStatus === 1);
                        const attendedCount = attendedEmployees.length;
                        const attendedNames = attendedEmployees.map(e => e.employeeName).join(', ') || 'N/A';
                        
                        // Calculate absent employees by comparing expected vs attended for THIS SESSION ONLY
                        const attendedEmployeeNames = new Set(attendedEmployees.map(e => e.employeeName));
                        const absentEmployeesList = enrolledEmployees.filter(
                            e => !attendedEmployeeNames.has(e.employeeName || e.name)
                        );
                        const absentCount = absentEmployeesList.length;
                        const absentNames = absentEmployeesList.map(e => e.employeeName || e.name).join(', ') || 'N/A';
                        
                        return {
                            ...session,
                            expectedEmployees: expectedCount,
                            expectedEmployeeNames: expectedNames,
                            attendedEmployees: attendedCount,
                            attendedEmployeeNames: attendedNames,
                            absentEmployees: absentCount,
                            absentEmployeeNames: absentNames,
                        };
                    } catch (error) {
                        console.error('Error fetching attendance for session:', session.sessionId, error);
                        return {
                            ...session,
                            expectedEmployees: expectedCount,
                            expectedEmployeeNames: expectedNames,
                            attendedEmployees: 0,
                            attendedEmployeeNames: 'N/A',
                            absentEmployees: expectedCount,
                            absentEmployeeNames: expectedNames,
                        };
                    }
                })
            );
            
            setSessionData(enhancedSessions);
            console.log('Enhanced sessions data:', enhancedSessions);
            
        } catch (error) {
            console.error('Error loading session data:', error);
        }
    };

    const handleEmployees = () => {
        navigate('/ManagerEmployeeTrainingEnrolled', { 
            state: { trainingId, trainingTitle, trainerName, startTrainingDate, endTrainingDate } 
        });
    };

    const handleViewAttendance = (sessionId) => {
        console.log(trainingId, trainingTitle, trainerName, startTrainingDate, endTrainingDate);
        navigate(`/attendance/${sessionId}`, {
            state: { trainingId, trainingTitle, trainerName, startTrainingDate, endTrainingDate }  
        });
    };

    const handleReport = () => {
        const reportMetadataValues = reportMetadata["Safety Training Report"] || {}; 
        setMetadata(reportMetadataValues); // Store metadata directly from JSON
        setIsReportModalOpen(true);
    };

    console.log('Session data:', sessionData);
    const columns = [
        { id: 'sessionName', label: 'Session Name', align: 'center' },
        { id: 'sessionDate', label: 'Date', align: 'center' },
        { id: 'sessionStartTime', label: 'Start Time', align: 'center' },
        { id: 'sessionEndTime', label: 'End Time', align: 'center' },
        { id: 'sessionDescription', label: 'Session Description' },
        {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            render: (row) => (
                <>
                    <FiEye onClick={() => handleViewAttendance(row.sessionId)} className="action-icon" size={18} style={{ color: '#0061A1', fontWeight: '900' }} />
                </>
            ),
        },
    ];

    return (
        <div className="training-details-page">
            <div className="training-details-main-content">
                <header className="training-details-dash-header">
                    <FiArrowLeftCircle className="employeeSwitch-back-button" onClick={() => navigate(-1)} title="Go back"/>
                    <h3 className="employeeSwitch-title">All Trainings</h3>
                </header>
                
                <section className="training-details-section">
                    <h3>
                        Training Details
                        <button 
                            className="training-details-employee-button" 
                            onClick={handleEmployees}
                            style={{
                                backgroundColor: '#0061A1',
                                color: '#fff',
                                border: '2px solid #004A7A',
                                borderRadius: '6px',
                                padding: '10px 20px',
                                marginLeft: '15px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#004A7A';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 97, 161, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#0061A1';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            Employees
                        </button>
                        <button 
                            className="training-details-report-button" 
                            onClick={handleReport}
                            style={{
                                backgroundColor: '#28A745',
                                color: '#fff',
                                border: '2px solid #1E8E3E',
                                borderRadius: '6px',
                                padding: '10px 20px',
                                marginLeft: '10px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#1E8E3E';
                                e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#28A745';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <FiFileText size={18} /> Report
                        </button>
                    </h3>
                    <div className="training-details-form">
                        <Textfield label="Training Name" value={trainingTitle || ''} readOnly />
                        <Textfield label="Trainer Name" value={trainerName || ''} readOnly />
                        <Textfield label="Start Date" value={startTrainingDate || ''} readOnly />
                        <Textfield label="End Date" value={endTrainingDate || ''} readOnly />
                    </div>
                </section>

                <section className="training-details-session-details-section">
                    <h3>Session Details</h3>
                    <TableComponent rows={sessionData} columns={columns} />
                </section>
            </div>

            {/* Report Modal */}
            {metadata && (
                <ReportGenerator
                    reportTitle="Training Information"
                    docNo={metadata.docNo}
                    OriginDate={metadata.OriginDate}
                    revNo={metadata.revNo}
                    revDate={metadata.revDate}
                    trainerName={trainerName}
                    location="Training Location: pune"
                    trainingTitle={trainingTitle}
                    startTrainingDate={startTrainingDate}
                    endTrainingDate={endTrainingDate}
                    tableHeaders={['Session Name', 'Date', 'Time', 'Expected', 'Attended', 'Absent']}
                    tableData={sessionData.map((session) => ({
                        sessionName: session.sessionName,
                        sessionDate: dayjs(session.sessionDate).format("DD-MM-YYYY"),
                        sessionTime: `${session.sessionStartTime} - ${session.sessionEndTime}`,
                        expectedEmployees: session.expectedEmployees || 0,
                        expectedEmployeeNames: session.expectedEmployeeNames || 'N/A',
                        attendedEmployees: session.attendedEmployees || 0,
                        attendedEmployeeNames: session.attendedEmployeeNames || 'N/A',
                        absentEmployees: session.absentEmployees || 0,
                        absentEmployeeNames: session.absentEmployeeNames || 'N/A',
                    }))}
                />
            )}
        </div>
    );
};


export default TrainingDetails;
