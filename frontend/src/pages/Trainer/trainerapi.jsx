import axios from 'axios';
import { toast } from 'react-toastify';

// Fetch trainings by employee ID
export const fetchTrainings = async (employeeId) => {
  try {
    const response = await axios.get(`http://localhost:3000/TrainerTrainings/${employeeId}`);
    return response.data.map((training) => ({
      ...training,
      id: training.trainingId,
    }));
  } catch (error) {
    //toast.error('Error fetching trainings');
    if (error.response && error.response.status === 404) {
    } else {
      toast.error('Failed to fetch trainings. Please try again later.');
    }
    throw error;
  }
};

export const fetchTrainingEmployees = async (trainingId) => {
  try {
    const response = await axios.get (`http://localhost:3000/TrainerEmployees/${trainingId}`);
    return response;
  } catch (error) {
    toast.error('Error fetching employees', error);
    throw error;
  }
};
// Fetch all sessions by training ID
export const fetchAllSessions = async (trainingId) => {
  try {
    const response = await axios.get(`http://localhost:3000/training/all_sessions/${trainingId}`);
    return response.data;
  } catch (error) {
   toast.error('Error fetching session data:', error);
    throw error;
  }
};

// Save or update a session
export const saveSession = async (sessionData, sessionId = null) => {
  const apiEndpoint = sessionId 
    ? `http://localhost:3000/api/sessions/${sessionId}` 
    : 'http://localhost:3000/api/sessions';

  const method = sessionId ? 'PUT' : 'POST';

  try {
    const response = await axios({
      method: method,
      url: apiEndpoint,
      data: sessionData,
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to save the session.');
  }
};


// Delete a session by session ID
export const deleteSession = async (sessionId) => {
  try {
    await axios.delete(`http://localhost:3000/api/sessions/${sessionId}`);
    toast.success("Session deleted successfully!");
  } catch (error) {
    console.error("Error deleting session:", error);
    toast.error("An error occurred while deleting the session.");
    throw error;
  }
};

// Fetch employees enrolled in a training
export const fetchEmployeesEnrolled = async (trainingId) => {
  try {
    const response = await axios.get(`http://localhost:3000/employeesEnrolled/${trainingId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching employees');
  }
};

export const saveFeedback = async (feedbackArray) => {
  try {
    console.log("brfeh");
    const response = await axios.post(`http://localhost:3000/saveFeedback`, feedbackArray);
    console.log("response", response.data);
    return response;
    
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error saving feedback');
  }
};

export const viewAttendance = async (sessionId) => {
  try{
    const response = await axios.get (`http://localhost:3000/viewAttendance/${sessionId}`);
    return response;
  }catch (error) {
    console.error('Error fetching attendance data:', error);
    //toast.error('Error fetching attendance data:');
    throw Error
  }
}

// Save updated attendance
export const saveAttendance = async (updatedAttendance) => {
  try {
    const response = await axios.post('http://localhost:3000/saveAttendance', updatedAttendance);
    console.log(response);
    return response.data;
    
  } catch (error) {
    throw error;
  }
};