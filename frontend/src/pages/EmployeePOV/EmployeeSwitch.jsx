import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiArrowLeftCircle } from 'react-icons/fi';
import TableComponent from '../../components/TableCo'; 
import Grade from '../Manager/Grade'; // Import Grade Component
import { fetchEmployeeTrainings, fetchEmployeeSkillMatrix } from './employeeapi'; // Import the API function
import './EmployeeSwitch.css';
import GeneralSearchBar from '../../components/GenralSearchBar';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const EmployeeSwitch = () => {
  const [trainings, setTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [skillMatrix, setSkillMatrix] = useState({ rows: [], skillNames: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const employeeId = useSelector((state) => state.auth.user?.employeeId);


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
    fetchTrainings();
    fetchSkillMatrix();
  }, []);

  const fetchTrainings = async () => {
    try {
      const data = await fetchEmployeeTrainings(employeeId);
      const updatedData = data.map(data => ({
        ...data ,
        startTrainingDate: dayjs(data.startTrainingDate).format("DD-MM-YYYY"),
        endTrainingDate: dayjs(data.endTrainingDate).format("DD-MM-YYYY"),
        "trainingStatus" : getTrainingStatusLabel(data.startTrainingDate, data.endTrainingDate)

      }))
      console.log("Training status from employeeSwitch : ",updatedData)
      
      setTrainings(updatedData);
      setFilteredTrainings(updatedData);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      toast.error("Failed to fetch trainings.");
    }
  };

  const fetchSkillMatrix = async () => {
    try {
      
      const response = await fetchEmployeeSkillMatrix(employeeId);
      const skillNames = [...new Set(response.data.map((item) => item.skillName))];

      // Grouping by department for grid-like grade structure
      const groupedData = response.data.reduce((acc, { departmentName, skillName, grade, skillId }) => {
        let department = acc.find((d) => d.departmentName === departmentName);
        if (!department) {
          department = { departmentName, skills: {} };
          acc.push(department);
        }
        department.skills[skillName] = { grade, skillId };
        return acc;
      }, []);

      setSkillMatrix({ rows: groupedData, skillNames });
    } catch (error) {
      toast.error('Error fetching skill matrix');
    }
  };

  
  const handleViewDetails = (training) => {
    if (!training || !training.trainingId) {
      console.error('Training details are missing!');
      return;
    }
    navigate('/EmployeeTrainingDetails', { 
      state: { 
        employeeId : employeeId,
        trainingId: training.trainingId,
        trainingTitle: training.trainingTitle,
        trainerName: training.trainerName,
        startTrainingDate: training.startTrainingDate,
        endTrainingDate: training.endTrainingDate,
      } 
    });
  };

  const getTrainingStatus = (startDate, endDate) => {
    const today = dayjs(new Date()).format("DD-MM-YYYY");
  
    if (today >= startDate && today <= endDate) {
      return <span className="status-bubble ongoing">Ongoing</span>;
    } else if (today > endDate) {
      return <span className="status-bubble completed">Completed</span>;
    } else {
      return <span className="status-bubble upcoming">Upcoming</span>;
    }
  };

  const skillMatrixColumns = [
    { id: 'departmentName', label: 'Department Name', align: 'center' },
    ...(skillMatrix.skillNames.length > 0
      ? skillMatrix.skillNames.map((skill) => ({
          id: skill,
          label: skill,
          align: 'center',
          render: (row) =>
            row.skills[skill] ? (
              <Grade
                pemp_id={employeeId}
                pskill_id={row.skills[skill].skillId}
                pgrade={row.skills[skill].grade}
                isChangable={false} // View-only
              />
            ) : (
              'N/A'
            ),
        }))
      : []),
  ];
  
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

  return (
    <div>
      <div className="employeeSwitch-training-content">
        {/* <header className="employeeSwitch-dash-header">
          <FiArrowLeftCircle className="employeeSwitch-back-button" onClick={() => navigate(-1)} title="Go back"/>
          <h4 className='employeeSwitch-title'>Back to main page</h4>
        </header> */}

        {/* Skill Matrix Table */}
        {skillMatrix.rows.length === 0 ? (
           <div className='overall-no-data'>No Skills found for your Department!</div>
          ) :(
        <div className="employeeSwitch-table-container">
          <h3>Skill Matrix</h3>
          <TableComponent
            rows={skillMatrix.rows} // Use grouped data
            columns={skillMatrixColumns} // Include grade grid for skills
          />
        </div>
          )}
        {filteredTrainings.length === 0 ? (
          <div className='overall-no-data'>No trainings found!</div>
         ) :(
          <>
            <div className="employeeSwitch-search-bar-container">
              <GeneralSearchBar
                options={trainings}
                label='Search Training'
                displayKey='trainingTitle'
                includeSelectAll={false}
                selectedValues={searchTerm}
                setSelectedValues={handleSearch}
                isMultiSelect={false}
              />
            </div>

            <div className="employeeSwitch-table-container">
              <TableComponent
                rows={filteredTrainings}
                columns={[
                  { id: 'trainingTitle', label: 'Training Title', align: 'center' },
                  { id: 'trainerName', label: 'Trainer Name', align: 'center' },
                  {
                    id: 'skillNames',
                    label: 'Skills',
                    align: 'center',
                    render: (row) => renderSkillsBubbles(row.skillNames),
                  },
                  {
                    id: 'startTrainingDate',
                    label: 'Start Date',
                    align: 'center',
                  },
                  {
                    id: 'endTrainingDate',
                    label: 'End Date',
                    align: 'center',
                  },
                  { id: 'trainingStatus', label: 'Training Status', align: 'center', render: (row) => getTrainingStatus(row.startTrainingDate, row.endTrainingDate) },
                  {
                    id: 'actions',
                    label: 'View Details',
                    align: 'center',
                    render: (row) => (
                      <FiEdit onClick={() => handleViewDetails(row)} className="action-icon" size={18} style={{color: '#0061A1', fontWeight: '900', marginLeft: '40px'}}/>
                    ),
                  },
                ]}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeSwitch;
