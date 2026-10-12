import axios from 'axios';
import { toast } from 'react-toastify';

// Fetch trainings by employee ID
export const fetchEmployeeTrainings = async (employeeId) => {
  try {
    console.log('📡 API: Fetching trainings for employee:', employeeId);
    const url = `http://localhost:3000/employee/${employeeId}`;
    console.log('📡 API URL:', url);
    
    const response = await axios.get(url, { withCredentials: true });
    
    console.log('✅ API Response status:', response.status);
    console.log('✅ API Response data:', response.data);
    console.log('✅ Number of trainings:', response.data?.length || 0);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.error('❌ Invalid response format:', response.data);
      toast.error('Invalid training data format received');
      return [];
    }
    
    const mappedData = response.data.map((training) => ({
      ...training,
      id: training.trainingId,
    }));
    
    console.log('✅ Mapped training data:', mappedData);
    return mappedData;
  } catch (error) {
    console.error('❌ API Error fetching trainings:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);
    
    const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error fetching trainings';
    toast.error(errorMsg);
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
