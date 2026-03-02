import axios from 'axios';
import { API_BASE_URL } from '../../App';

// API call to fetch department skills based on department ID
export const fetchDepartmentSkills = async (departmentId) => {
  try {
    const response = await axios.get(`${ API_BASE_URL }/get-skillName-skillId/${departmentId}`);
    console.log("fetched skkill : ",response);
    return response.data.map((da) => ({ id: da.skillId, label: da.skillName }));
  } catch (error) {
    console.error('Error fetching department skills:', error);
    throw error;
  }
};

// API call to fetch assigned employee data
export const fetchAssignedEmployeeData = async () => {
  try {
    const response = await axios.get(`${ API_BASE_URL }/get-assign-data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee data:', error);
    throw error;
  }
};

// API call to fetch skills for a specific department
export const fetchSkillsForDepartment = async (departmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/skills/${departmentId}`);
    return response.data.map(skill => ({
      label: skill.skillName,
      value: skill.skillId,
    }));
  } catch (error) {
    console.error('Error fetching skills for department:', error);
    throw error;
  }
};

// API call to fetch data based on selected skills and department
export const fetchDataBySkillsAndDepartment = async (selectedSkills, departmentId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/fetch-data`, {
      skillIds: selectedSkills.map(skill => skill.id),
      departmentId
    });
    console.log("from API code: ", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data by skills and department:', error);
    throw error;
  }
};

// API call to save updated employee data
export const saveEmployeeData = async (newSelectedEmp, removeEmp, gradeChanges) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/update-bulk`, {
      newSelectedEmp,
      removeEmp,
      grades: Object.values(gradeChanges),
    });
    return response.data;
  } catch (error) {
    console.error('Error saving employee data:', error);
    throw error;
  }
};
