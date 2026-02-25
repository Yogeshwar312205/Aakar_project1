import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Textfield from '../../components/Textfield';
import TableComponent from '../../components/TableCo'; 
import ReportGenerator from "./ReportGenerator"; // PDF generation component
import CumulativeAttendanceGenerator from "./CumulativeAttendanceGenerator"; // Cumulative attendance component
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
    const [reportKey, setReportKey] = useState(0); // Force remount of ReportGenerator
    const [isCumulativeAttendanceModalOpen, setIsCumulativeAttendanceModalOpen] = useState(false);
    const [cumulativeAttendanceKey, setCumulativeAttendanceKey] = useState(0);
    const [cumulativeAttendanceData, setCumulativeAttendanceData] = useState([]);

    useEffect(() => {
        if (trainingId) loadSessionData();
    }, [trainingId]);

    const loadSessionData = async () => {
        try {
            const sessions = await fetchTrainingSessions(trainingId);
            
            // Fetch enrolled employees for the training (global list)
            const enrolledEmployees = await fetchEmployeesEnrolled(trainingId);
            
            // Enhance session data with attendance statistics
            const enhancedSessions = await Promise.all(
                sessions.map(async (session) => {
                    try {
                        // Fetch attendance data for THIS SPECIFIC SESSION
                        const attendanceData = await fetchSessionAttendance(session.sessionId);
                        
                        // Get the list of employees who have attendance records for this session
                        const sessionAttendanceSet = new Set(attendanceData.map(r => r.employeeName));
                        
                        // Expected employees for THIS session are those with attendance records
                        const expectedEmployeesForSession = attendanceData.map(r => ({
                            employeeName: r.employeeName,
                            attendanceStatus: r.attendanceStatus
                        }));
                        
                        const expectedCount = expectedEmployeesForSession.length;
                        const expectedNames = expectedEmployeesForSession.map(e => e.employeeName).join(', ') || 'N/A';
                        
                        // Get attended employees for THIS session
                        const attendedEmployees = expectedEmployeesForSession.filter(r => r.attendanceStatus === 1);
                        const attendedCount = attendedEmployees.length;
                        const attendedNames = attendedEmployees.map(e => e.employeeName).join(', ') || 'N/A';
                        
                        // Get absent employees for THIS session (expected - attended)
                        const absentEmployeesList = expectedEmployeesForSession.filter(r => r.attendanceStatus !== 1);
                        const absentCount = absentEmployeesList.length;
                        const absentNames = absentEmployeesList.map(e => e.employeeName).join(', ') || 'N/A';
                        
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
                            expectedEmployees: 0,
                            expectedEmployeeNames: 'N/A',
                            attendedEmployees: 0,
                            attendedEmployeeNames: 'N/A',
                            absentEmployees: 0,
                            absentEmployeeNames: 'N/A',
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

    const handleViewAttendance = (session) => {
        console.log(trainingId, trainingTitle, trainerName, startTrainingDate, endTrainingDate);
        navigate(`/attendance/${session.sessionId}`, {
            state: { 
                trainingId, 
                trainingTitle, 
                trainerName, 
                startTrainingDate, 
                endTrainingDate,
                sessionName: session.sessionName,
                sessionDate: dayjs(session.sessionDate).format("DD-MM-YYYY"),
                sessionTime: `${session.sessionStartTime} - ${session.sessionEndTime}`
            }  
        });
    };

    const handleReport = () => {
        const reportMetadataValues = reportMetadata["Safety Training Report"] || {}; 
        setMetadata(reportMetadataValues); // Store metadata directly from JSON
        setIsReportModalOpen(true);
        // Force remount of ReportGenerator to reset internal state
        setReportKey(prev => prev + 1);
    };

    const handleReportClose = () => {
        setIsReportModalOpen(false);
    };

    const handleCumulativeAttendanceReport = () => {
        // Calculate cumulative attendance data
        const cumulativeData = calculateCumulativeAttendance();
        setCumulativeAttendanceData(cumulativeData);
        
        const reportMetadataValues = reportMetadata["Safety Training Report"] || {}; 
        setMetadata(reportMetadataValues);
        setIsCumulativeAttendanceModalOpen(true);
        setCumulativeAttendanceKey(prev => prev + 1);
    };

    const handleCumulativeAttendanceClose = () => {
        setIsCumulativeAttendanceModalOpen(false);
    };

    const calculateCumulativeAttendance = () => {
        // Create a map to store employee attendance across all sessions
        const employeeMap = new Map();

        // Iterate through all sessions and collect attendance data
        sessionData.forEach(session => {
            if (session.sessionName) {
                // Parse attendance data from session
                const sessionAttendanceData = [];
                
                // We need to fetch or have access to the raw attendance data
                // For now, we'll reconstruct from the enhanced session data
                // This requires us to also track the raw attendance records in sessionData
            }
        });

        // Since we need raw attendance data, we'll collect it differently
        // Let's build the cumulative data from sessionData which should have attendance info
        
        const employeeDataMap = new Map();

        // First pass: collect all employees and their session details
        sessionData.forEach(session => {
            // Extract employee names and attendance from session data
            const expectedNames = session.expectedEmployeeNames ? 
                session.expectedEmployeeNames.split(', ').filter(n => n !== 'N/A') : [];
            
            expectedNames.forEach(employeeName => {
                if (!employeeDataMap.has(employeeName)) {
                    employeeDataMap.set(employeeName, {
                        employeeName: employeeName,
                        totalSessions: 0,
                        attended: 0,
                        absent: 0,
                        sessions: []
                    });
                }
                
                const employeeData = employeeDataMap.get(employeeName);
                employeeData.totalSessions += 1;
                
                // Check if employee attended this session
                const attendedNames = session.attendedEmployeeNames ? 
                    session.attendedEmployeeNames.split(', ').filter(n => n !== 'N/A') : [];
                
                if (attendedNames.includes(employeeName)) {
                    employeeData.attended += 1;
                    employeeData.sessions.push({
                        sessionName: session.sessionName,
                        attendanceStatus: 1
                    });
                } else {
                    employeeData.absent += 1;
                    employeeData.sessions.push({
                        sessionName: session.sessionName,
                        attendanceStatus: 0
                    });
                }
            });
        });

        // Calculate attendance percentage and convert to array
        const cumulativeArray = Array.from(employeeDataMap.values()).map(emp => ({
            ...emp,
            attendancePercentage: emp.totalSessions > 0 ? (emp.attended / emp.totalSessions) * 100 : 0
        }));

        // Sort by employee name
        cumulativeArray.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

        console.log('Cumulative Attendance Data:', cumulativeArray);
        return cumulativeArray;
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
                    <FiEye onClick={() => handleViewAttendance(row)} className="action-icon" size={18} style={{ color: '#0061A1', fontWeight: '900' }} />
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
                                backgroundColor: '#0061A1',
                                color: '#fff',
                                border: '2px solid #0061A1',
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
                                e.target.style.backgroundColor = '#0061A1';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 97, 161, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#0061A1';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <FiFileText size={18} /> Cumulative Training Report
                        </button>
                        <button 
                            className="training-details-attendance-report-button" 
                            onClick={handleCumulativeAttendanceReport}
                            style={{
                                backgroundColor: '#0061A1',
                                color: '#fff',
                                border: '2px solid #0061A1',
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
                                e.target.style.backgroundColor = '#0061A1';
                                e.target.style.boxShadow = '0 4px 8px rgba(255, 149, 0, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#0061A1';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <FiFileText size={18} /> Cumulative Attendance Report
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
            {metadata && isReportModalOpen && (
                <ReportGenerator
                    key={reportKey}
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
                    onClose={handleReportClose}
                />
            )}

            {/* Cumulative Attendance Report Modal */}
            {metadata && isCumulativeAttendanceModalOpen && (
                <CumulativeAttendanceGenerator
                    key={cumulativeAttendanceKey}
                    reportTitle="Cumulative Attendance Report"
                    docNo={metadata.docNo}
                    OriginDate={metadata.OriginDate}
                    revNo={metadata.revNo}
                    revDate={metadata.revDate}
                    trainerName={trainerName}
                    location="Training Location: pune"
                    trainingTitle={trainingTitle}
                    startTrainingDate={startTrainingDate}
                    endTrainingDate={endTrainingDate}
                    employeeAttendanceData={cumulativeAttendanceData}
                    onClose={handleCumulativeAttendanceClose}
                />
            )}
        </div>
    );
};


export default TrainingDetails;
