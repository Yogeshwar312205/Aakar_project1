import axios from 'axios';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { API_BASE_URL } from '../../App';

export const fetchSkillsByDepartment = async (departmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/DepartmentGiveTskills/${departmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching skills:', error);
    toast.error('Failed to fetch skills.');
    return null;
  }
};

export const fetchTrainersBySkills = async (skillIds) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trainer-employee`, {
      params: { skillIds },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trainers:', error);
    toast.error('Failed to fetch trainers.');
    return null;
  }
};

export const addTraining = async (trainingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/add-training`, trainingData);
    return response.data;
  } catch (error) {
    console.error('Error saving new training:', error);
    return null;
  }
};

export const updateTraining = async (trainingId, trainingData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/update-training/${trainingId}`, trainingData);
    toast.success('Training updated successfully!');
    return response.data;
  } catch (error) {
    console.error('Error updating training:', error);
    toast.error('Failed to update training.');
    return null;
  }
};

export const fetchAllTraining = async (departmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/all-training/${departmentId}`);
    const updatedTrainings = response.data.map((training) => {
      const startDate = dayjs(training.startTrainingDate);
      const endDate = dayjs(training.endTrainingDate);
      const numberOfDays = endDate.diff(startDate, 'day') + 1;
      const evaluationTypeMapping = {
        1: 'Multiple Choice Questions',
        2: 'Assignments',
      };
      //console.log("Fetch evaluation type in server: ", training.evaluationType)
      const evaluationTypeValue = evaluationTypeMapping[training.evaluationType];
      //console.log("Fetch evaluation type value: ", evaluationTypeValue)
      return {
        ...training,
        numberOfDays: numberOfDays >= 0 ? numberOfDays : 0,
        evaluationType: evaluationTypeValue || 'none',
      };
    });
    return updatedTrainings;
  } catch (error) {
    console.error('Error fetching training data:', error);
    throw error;
  }
};

export const deleteTraining = async (trainingId) => {
  try {
    await axios.delete(`${API_BASE_URL}/delete-training/${trainingId}`);
  } catch (error) {
    console.error('Error deleting training:', error);
    throw error;
  }
};

export const fetchEmployeeoneDataAPI = async (departmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/employeeoneCount`, {
      params: { departmentId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching employee data:', error);
    throw error;
  }
};

export const fetchEmployeetwoDataAPI = async (departmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/employeetwoCount`, {
      params: { departmentId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching employee data:', error);
    throw error;
  }
};

export const fetchTrainingSessions = async (trainingId) => {
    try {
        const response = await axios.get(`http://localhost:3000/training/all_sessions/${trainingId}`);
        if (Array.isArray(response.data)) {
            return response.data.map((session) => ({
                ...session,
                sessionDate: formatDate(session.sessionDate),
            }));
        } else {
            console.error('Session data format is incorrect:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching session data:', error);
        throw error;
    }
};
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

export const fetchSessionAttendance = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/sessions/attendance/${sessionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching session attendance:', error);
      throw error;
    }
  };
  
  export const fetchEmployeesEnrolled = async (trainingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ManagerPOV/employeesEnrolled/${trainingId}`)
      console.log("Response Data : trainin planning : ",response);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee data:', error);
      throw error;
    }
  };
