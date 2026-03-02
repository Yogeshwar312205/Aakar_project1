import axios from 'axios';
import { toast } from 'react-toastify';

// Fetch trainings by employee ID
export const fetchEmployeeTrainings = async (employeeId) => {
  try {
    const response = await axios.get(`http://localhost:3000/employee/${employeeId}`);
    return response.data.map((training) => ({
      ...training,
      id: training.trainingId,
    }));
  } catch (error) {
    toast.error('Error fetching trainings');
    throw error;
  }
};

export const fetchEmployeeSkillMatrix = async (employeeId) =>{
  try {
    const response = await axios.get(`http://localhost:3000/employeeSkill/${employeeId}`);
    return response;
  } catch (error){
    toast.error('Error fetching grade');
    throw error;
  }
}

// Fetch all sessions for a specific training
export const fetchAllSessions = async (trainingId) => {
  try {
    const response = await axios.get(`http://localhost:3000/training/all_sessions/${trainingId}`);
    return response.data;
  } catch (error) {
    toast.error('Session not found');
    throw Error
  }
};

// Fetch attendance for a specific session and employee
export const fetchAttendanceForSession = async (employeeId, sessionId) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/attendance?employeeId=${employeeId}&sessionId=${sessionId}`
    );
    if (response.status !== 200) {
      throw new Error("Failed to fetch attendance.");
    }
    return response.data.attendanceStatus; // Assuming the response contains attendanceStatus field
  } catch (error) {
    toast.error('Attendance not found');
    throw error;
  }
};