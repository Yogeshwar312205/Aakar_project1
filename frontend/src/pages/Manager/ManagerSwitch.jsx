import React, { useState, useEffect } from 'react';
import { FiAward, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManagerSwitch.css';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';



const CustomButton = ({ text, icon, onClick, isActive }) => {
  return (
    <button className={`custom-button ${isActive ? 'active' : ''}`} onClick={onClick}>
      <span className="icon">{icon}</span>
      <span className="text">{text}</span>
    </button>
  );
};

const ManagerSwitch = () => {
  const [activeButton, setActiveButton] = useState('employees');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleDepartmentSelected = (event) => {
      setSelectedDepartment(event.detail);
    };

    window.addEventListener('departmentSelected', handleDepartmentSelected);
    return () => {
      window.removeEventListener('departmentSelected', handleDepartmentSelected);
    };
  }, []);

  const handleTrainingsClick = () => {
    setActiveButton('trainings');
    navigate('/trainings');
  };

  const handleEmployeesClick = () => {
    setActiveButton('employees');
    navigate('/SearchBar');
  };

  const handleDeptGClick = () => {
    setActiveButton('gtraining');
    navigate('/SendAndGiveTraining');
  };

  const handleUpdateSkillClick = () => {
    navigate('/Update_skills');
  };

  return (
    <div className="button-container">
      <CustomButton
        text="My trainings"
        icon={<FiAward />}
        onClick={handleTrainingsClick}
        isActive={activeButton === 'trainings'}
      />
      <CustomButton
        text="Employees"
        icon={<FiUser />}
        onClick={handleEmployeesClick}
        isActive={activeButton === 'employees'}
      />
      <CustomButton
        text="Give training"
        icon={<FiUser />}
        onClick={handleDeptGClick}
        isActive={activeButton === 'gtraining'}
      />
      <CustomButton
        text="Update skill"
        icon={<FiAward />}
        onClick={handleUpdateSkillClick}
        isActive={activeButton === 'updateSkill'}
      />
    </div>
  );
};

export default ManagerSwitch;
