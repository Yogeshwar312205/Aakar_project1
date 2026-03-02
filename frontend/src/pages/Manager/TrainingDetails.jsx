import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Textfield from '../../components/Textfield';
import TableComponent from '../../components/TableCo'; 
import '../Overall/TrainingDetails.css';
import { FiEye, FiArrowLeftCircle } from 'react-icons/fi';
import dayjs from 'dayjs';
import {fetchTrainingSessions} from './TrainingAPI';

const TrainingDetails = () => {
    const location = useLocation();
    const { 
        trainingId, 
        trainingTitle, 
        trainerName, 
        startTrainingDate, 
        endTrainingDate 
      } = location.state || {};
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState([]);
    
    useEffect(() => {
      // Fetch session data
      if (trainingId) loadSessionData();
    }, [trainingId]);
  
    const loadSessionData = async () => {
        try {
            const sessions = await fetchTrainingSessions(trainingId);
            setSessionData(sessions);
        } catch (error) {
            console.error('Error loading session data:', error);
        }
    };

    const handleEmployees = () => {
        navigate('/ManagerEmployeeTrainingEnrolled', { state: { trainingId } });
      }

    const handleViewAttendance = (sessionId) => {
        navigate(`/attendance/${sessionId}`);
    };

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
                <FiEye onClick={() => handleViewAttendance(row.sessionId)} className="action-icon" size={18} style={{color: '#0061A1', fontWeight: '900'}}/>                    
                </>
            ),
        },
    ];

    return (
        <div className="training-details-page">
            <div className="training-details-main-content">
                <header className="training-details-dash-header">
                    <FiArrowLeftCircle className="employeeSwitch-back-button" onClick={() => navigate(-1)} title="Go back"/>
                    <h4 className='employeeSwitch-title'>All Trainings</h4>
                </header>
                
                <section className="training-details-section">
                    <h3>Training details
                        <button className="training-details-employee-button" onClick={handleEmployees}>Employees</button>
                    </h3>
                    <div className="training-details-form">
                        <Textfield label="Training Name" value={trainingTitle || ''} readOnly />
                        <Textfield label="Trainer Name" value={trainerName || ''} readOnly />
                        <Textfield label="Start Date" value={startTrainingDate || ''} readOnly />
                        <Textfield label="End Date" value={endTrainingDate || ''} readOnly />
                    </div>
                </section>

                <section className="training-details-session-details-section">
                    <h3>Session details</h3>
                    <TableComponent
                        rows={sessionData}
                        columns={columns}
                    />
                </section>
            </div>
        </div>
    );
};

export default TrainingDetails;