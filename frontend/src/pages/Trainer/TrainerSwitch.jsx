import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';
import TableCo from '../../components/TableCo';
import './TrainerSwitch.css';
import GeneralSearchBar from '../../components/GenralSearchBar';
import { fetchTrainings, fetchTrainingEmployees } from './trainerapi';
import Modal from 'react-modal';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';


const Tickit = ({ text, icon, onClick, count }) => (
  <button className="custom-button-all-training-ticket" onClick={onClick}>
    <span className="icon">{icon}</span>
    <span className="text">{text}</span>
    <span className="count">{count !== null ? count : 'Loading...'}</span>
  </button>
);


const TrainerSwitch = () => {
  const [trainings, setTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeesData, setEmployeesData] = useState([]);
  const [employeecount, setemployeecount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const employeeId = useSelector((state) => state.auth.user?.employeeId);
  const trainerName = useSelector((state) => state.auth.user?.employeeName);


  const getTrainingStatusLabel = (startDate, endDate) => {
    const start = dayjs(startDate).format("DD-MM-YYYY");
    const end = dayjs(endDate).format("DD-MM-YYYY");
    const today = dayjs(new Date()).format("DD-MM-YYYY");
  
    if (today >= start && today <= end) {
      return "Ongoing"
    } else if (today > end) {
      return "Completed"
    } else {
      return "Upcoming"
    }
  };
  useEffect(() => {
    if (employeeId) {
      loadTrainings();
    } else {
      console.error('Employee ID is missing!');
      toast.error('Failed to fetch employee data. Employee ID is not available.');
    }
  }, [employeeId]);

  const loadTrainings = async () => {
      const data = await fetchTrainings(employeeId);
      const updatedData = data.map(data => ({
        ...data ,
        startTrainingDate: dayjs(data.startTrainingDate).format("DD-MM-YYYY"),
        endTrainingDate: dayjs(data.endTrainingDate).format("DD-MM-YYYY"),
        "trainingStatus" : getTrainingStatusLabel(data.startTrainingDate, data.endTrainingDate)

      }))
      setTrainings(updatedData);
      setFilteredTrainings(updatedData);
  };

  const handleViewEmployees = async (setCount) => {
    if (trainings.length === 0) {
      console.error("No trainings available to fetch employees.");
      return;
    }
  
    try {
      const allEmployees = [];
      let totalEmployees = 0; // To track the total count
  
      for (const training of trainings) {
        const response = await fetchTrainingEmployees(training.trainingId);
  
        // Ensure response has the correct structure
        if (response && response.data) {
          const employeesWithDetails = response.data.map((employee) => ({
            ...employee,
            trainingId: training.trainingId,
            trainingTitle: training.trainingTitle,
            startTrainingDate: training.startTrainingDate,
            endTrainingDate:training.endTrainingDate,
          }));
  
          allEmployees.push(...employeesWithDetails);
          totalEmployees += response.count || employeesWithDetails.length; // Use `count` or fallback to data length
        }
      }
  
      setEmployeesData(allEmployees);
      console.log("data", allEmployees)
      setCount(totalEmployees);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setCount(0);
    }
  };
  
  useEffect(() => {
    if (trainings.length > 0) {
      handleViewEmployees(setemployeecount);
    }
  }, [trainings]); 
  
  const modalopen1 = async () =>{
    setIsModalOpen(true);
  }

  const handleSearch = (selectedValue) => {
    setSearchTerm(selectedValue);
    if (!selectedValue) {
      setFilteredTrainings(trainings);
    } else {
      setFilteredTrainings(
        trainings.filter((training) => training.id === selectedValue.id)
      );
    }
  };

  const getTrainingStatus = (startDate, endDate) => {
    const today = dayjs(new Date()).format("DD-MM-YYYY");
    const start = startDate;
    const end = endDate;

    if (today >= start && today <= end) {
      return <span className="status-bubble ongoing">Ongoing</span>;
    } else if (today > end) {
      return <span className="status-bubble completed">Completed</span>;
    } else {
      return <span className="status-bubble upcoming">Upcoming</span>;
    }
  };

  const handleViewDetails = (training) => {
    const today = dayjs(new Date()).format("DD-MM-YYYY");
    const trainingEndDate = training.endTrainingDate;
    const isActive = today > trainingEndDate ? 1 : 0;
    navigate('/TrainerTrainingDetails', {
      state: {
        trainingId: training.trainingId,
        trainingTitle: training.trainingTitle,
        startTrainingDate: training.startTrainingDate,
        endTrainingDate: training.endTrainingDate,
        skillNames: training.skillNames,
        active: isActive
      },
    });
  };

  const handleEmployeeViewDetails = (row) => {
    if (!row || !row.employeeId || !row.trainingId) {
      console.error('Required details are missing!');
      return;
    }

    navigate('/EmployeeTrainingDetails', {
      state: {
        employeeId: row.employeeId,
        trainingId: row.trainingId,
        trainingTitle: row.trainingTitle,
        trainerName: trainerName,
        startTrainingDate: row.startTrainingDate,
        endTrainingDate: row.endTrainingDate,
      },
    });
  };

  const renderSkillsBubbles = (skills) => {
    console.log("Rendered skills: ", skills);
    if (!skills || skills.trim() === '') {
      return <span>No Skills</span>;  
    }
   
    const skillList = skills.split(', ');
    return (
      <div className="skills-bubbles-container">
        {skillList.map((skill, index) => (
          <span key={index} className="skill-bubble">{skill}</span>
        ))}
      </div>
    );
  };

  const columns = [
    { id: 'trainingTitle', label: 'Training Title', align: 'center' },
    { id: 'skillNames', label: 'Skills', align: 'center', render: (row) => renderSkillsBubbles(row.skillNames) },
    { id: 'startTrainingDate', label: 'Start Date', align: 'center'},
    { id: 'endTrainingDate', label: 'End Date', align: 'center'},
    { id: 'trainingStatus', label: 'Training Status', align: 'center', render: (row) => getTrainingStatus(row.startTrainingDate, row.endTrainingDate) },
    {
      id: 'actions',
      label: 'View Details',
      align: 'center',
      width: '20px',
      render: (row) => (
        <FiEdit
          onClick={() => handleViewDetails(row)}
          className="action-icon"
          size={18}
          style={{ color: '#0061A1', fontWeight: '900', align: 'right', marginLeft: '70px' }}
        />
      ),
    },
  ];

  const employeeColumns = [
    { id: 'employeeName', label: 'Employee Name', align: 'center' },
    { id: 'departmentName', label: 'Department', align: 'center' },
    { id: 'trainingTitle', label: 'Training Title', align: 'center' },
    { id: 'startTrainingDate', label: 'Start Date', align: 'center' },
    { id: 'endTrainingDate', label: 'End Date', align: 'center' },
    {
      id: 'actions',
      label: 'View Details',
      align: 'center',
      render: (row) => (
        <FiEdit
          onClick={() => handleEmployeeViewDetails(row)}
          className="action-icon"
          size={18}
          style={{ color: '#0061A1', fontWeight: '900', align: 'right', marginLeft: '50px' }}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="trainerSwitch-training-content">
        {/* <header className="trainerSwitch-dash-header">
          <FiArrowLeftCircle
            className="employeeSwitch-back-button"
            onClick={() => navigate(`/Overall-Switch`)}
            title="Go back"
          />
          <h4 className="employeeSwitch-title">Back to main page</h4>
        </header> */}

        <div className="trainerSwitch-tickets">
          <div className="trainerSwitch-ticket" >
            <Tickit text="Total Trainings" count={trainings.length} />
            <Tickit text="Employees List" onClick={() => modalopen1()} count={employeecount} />
          </div>
        </div>
        <div className="trainerSwitch-search-bar-container">
          <GeneralSearchBar
            options={trainings}
            label="Search Training"
            displayKey="trainingTitle"
            isMultiSelect={false}
            selectedValues={searchTerm}
            setSelectedValues={handleSearch}
            includeSelectAll={false}
          />
        </div>
        <div className="trainerSwitch-table-container">
          <TableCo
            rows={filteredTrainings}
            columns={columns}
            items={trainings}
            itemKey="trainingId"
            searchLabel="Search Training"
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setIsModalOpen(false)}>
              &times;
            </button>
                <TableCo rows={employeesData} columns={employeeColumns} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerSwitch;
