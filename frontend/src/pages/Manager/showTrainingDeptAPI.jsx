import axios from "axios";
import { API_BASE_URL } from "../../App";

const departmentInfo = async() =>{
    try{
        const response = await axios.get(`${API_BASE_URL}/departments`);
        const deptList = response.data.map((dept) => ({
            id: dept.departmentId,
            label: dept.departmentName,
          }))
        return deptList;
    }catch(error){
        console.error('Error fetching departments:', error);
        throw error;
    }
}

const departmentSkills = async(departmentTId) =>{
    try{
        const response = await axios.get(`${API_BASE_URL}/DepartmentGiveTskills/${departmentTId}`);
        const skills = response.data.map((skill) => ({
            id: skill.skillId,
            label: skill.skillName,
          }))
        return skills;
    }catch(error){
        console.error('Error fetching skills:', error);
        throw error;
    }
}

const departmentEmployeeData = async(departmentTId) =>{
    try{
        const response = await axios.get(`${API_BASE_URL}/get-distinct-department-employess-skill-to-train/${departmentTId}`);
        return response.data;
    }catch(error){
        console.error('Error fetching employee data:', error);
        throw error;
    }
}

export { departmentInfo, departmentSkills, departmentEmployeeData };
