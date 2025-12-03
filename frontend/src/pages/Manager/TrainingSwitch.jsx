import React, { useState, useEffect } from 'react';
import { FiAward, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './TrainingSwitch.css';

const CustomButton = ({ text, icon, onClick, isActive }) => {
  return (
    <button className={`trainingSwitch-custom-button ${isActive ? 'active' : ''}`} onClick={onClick}>
      <span className="icon">{icon}</span>
      <span className="text">{text}</span>
    </button>
  );
};


const TrainingSwitch = () => {
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();



  return (
    <div>
      <div className="trainingSwitch-button-container">
        <CustomButton
          text="Employees To Train"
          icon={<FiAward />}
          onClick={() => {
            setActiveButton('EmployeesToTrain');
            navigate('/Dept_G_training');
          }}
          isActive={activeButton === 'EmployeesToTrain'}
        />
        <CustomButton
          text="Send Employees"
          icon={<FiUser />}
          onClick={() => {
            setActiveButton('SendConfirm');
            navigate('/SendConformEmpToTraining');
          }}
          isActive={activeButton === 'SendConfirm'}
        />
      </div>
    </div>
  );
};

export default TrainingSwitch;
