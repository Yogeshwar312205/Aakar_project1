import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

// Fetch all enrolled trainings for the employee
export const fetchMyTrainings = async (employeeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-training/${employeeId}`, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching trainings:', error);
    toast.error('Failed to fetch trainings');
    throw error;
  }
};

// Fetch today's sessions for the employee
export const fetchTodaySessions = async (employeeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-training/${employeeId}/today-sessions`, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching today\'s sessions:', error);
    toast.error('Failed to fetch today\'s sessions');
    throw error;
  }
};

// Fetch all sessions with optional filter (all/upcoming/completed)
export const fetchAllSessions = async (employeeId, filter = 'all') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-training/${employeeId}/sessions?filter=${filter}`, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    toast.error('Failed to fetch sessions');
    throw error;
  }
};

// Fetch training progress for a specific training
export const fetchTrainingProgress = async (employeeId, trainingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-training/${employeeId}/training/${trainingId}/progress`, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching training progress:', error);
    toast.error('Failed to fetch training progress');
    throw error;
  }
};

// Fetch overall attendance statistics
export const fetchAttendanceStats = async (employeeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-training/${employeeId}/attendance-stats`, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    toast.error('Failed to fetch attendance statistics');
    throw error;
  }
};
