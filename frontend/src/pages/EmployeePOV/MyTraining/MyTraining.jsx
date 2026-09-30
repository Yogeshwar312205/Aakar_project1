import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { 
  fetchMyTrainings, 
  fetchTodaySessions, 
  fetchAttendanceStats 
} from '../myTrainingAPI';
import TodaySessionsWidget from './TodaySessionsWidget';
import TrainingCard from './TrainingCard';
import SessionList from './SessionList';
import AttendanceStats from './AttendanceStats';
import './MyTraining.css';
import { FaBook, FaClock, FaChartLine, FaCheckCircle } from 'react-icons/fa';

const MyTraining = () => {
  const navigate = useNavigate();
  const employeeId = useSelector((state) => state.auth.user?.employeeId);
  const employeeName = useSelector((state) => state.auth.user?.employeeName);

  const [trainings, setTrainings] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 MyTraining component mounted with employeeId:', employeeId);
    if (employeeId) {
      loadAllData();
    }
  }, [employeeId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading data for employee ID:', employeeId);
      
      // Fetch all data in parallel
      const [trainingsData, todaySessionsData, statsData] = await Promise.all([
        fetchMyTrainings(employeeId),
        fetchTodaySessions(employeeId),
        fetchAttendanceStats(employeeId)
      ]);

      console.log('📊 Trainings received:', trainingsData);
      console.log('📅 Today sessions received:', todaySessionsData);
      console.log('📈 Stats received:', statsData);

      // Format dates
      const formattedTrainings = trainingsData.map(training => ({
        ...training,
        startTrainingDate: dayjs(training.startTrainingDate).format('DD-MM-YYYY'),
        endTrainingDate: dayjs(training.endTrainingDate).format('DD-MM-YYYY'),
      }));

      const formattedTodaySessions = todaySessionsData.map(session => ({
        ...session,
        sessionDate: dayjs(session.sessionDate).format('DD-MM-YYYY'),
      }));

      setTrainings(formattedTrainings);
      setTodaySessions(formattedTodaySessions);
      setStats(statsData);
      
      console.log('✅ Data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load training data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTrainingDetails = (training) => {
    if (training.totalSessions === 0) {
      toast.info('No sessions available for this training yet');
      return;
    }
    
    navigate('/EmployeeTrainingDetails', {
      state: {
        employeeId: employeeId,
        trainingId: training.trainingId,
        trainingTitle: training.trainingTitle,
        trainerName: training.trainerName,
        startTrainingDate: training.startTrainingDate,
        endTrainingDate: training.endTrainingDate,
      }
    });
  };

  if (loading) {
    return (
      <div className="my-training-loading">
        <div className="spinner"></div>
        <p>Loading your training data...</p>
      </div>
    );
  }

  return (
    <div className="my-training-container">
      <header className="my-training-header">
        <h2>My Training Dashboard</h2>
        <p>Welcome back, {employeeName}!</p>
      </header>

      {/* Statistics Summary */}
      <section className="statistics-summary">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#2196F3' }}>
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>{stats?.totalTrainings || 0}</h3>
            <p>Total Trainings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#4CAF50' }}>
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats?.ongoingTrainings || 0}</h3>
            <p>Ongoing Trainings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FF9800' }}>
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats?.todaySessions || 0}</h3>
            <p>Sessions Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#9C27B0' }}>
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{stats?.overallAttendancePercentage || 0}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
      </section>

      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <section className="today-sessions-section">
          <TodaySessionsWidget sessions={todaySessions} />
        </section>
      )}

      {/* My Trainings */}
      <section className="my-trainings-section">
        <h3>My Trainings ({trainings.length})</h3>
        {trainings.length === 0 ? (
          <div className="no-data">
            <p>You are not enrolled in any trainings yet.</p>
          </div>
        ) : (
          <div className="trainings-grid">
            {trainings.map((training) => (
              <TrainingCard 
                key={training.trainingId} 
                training={training}
                onClick={() => handleViewTrainingDetails(training)}
              />
            ))}
          </div>
        )}
      </section>

      {/* All Sessions */}
      <section className="all-sessions-section">
        <SessionList employeeId={employeeId} />
      </section>

      {/* Attendance Statistics */}
      <section className="attendance-stats-section">
        <AttendanceStats stats={stats} />
      </section>
    </div>
  );
};

export default MyTraining;
