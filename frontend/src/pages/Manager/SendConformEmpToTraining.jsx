import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SendConformEmpToTraining.css";
import GenralCheckBox from "../../components/GenralCheckBox";
import { useLocation,useNavigate } from 'react-router-dom';
import { FiArrowLeftCircle } from "react-icons/fi";
import AddTraining from "./AddTraining";
import { useSelector } from 'react-redux';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';


const SendConformEmpToTraining = () => {
    const [department, setDepartment] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [filterTrainingData, setFilterTrainingData] = useState([]);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [selectedTrainingId, setSelectedTrainingId] = useState(null);
    const [eligibleEmployees, setEligibleEmployees] = useState([]);
    const [PreSelectedEmp, setPreSelectedEmp] = useState([]);
    const [TrainingPreselectedemp , setTrainingPreselectedemp] = useState([]);
    const [trainingPreSelectedEmpId,setTrainingPreselectedempId] = useState([])
    const [loading, setLoading] = useState(false);
    const [selectToSend, setSelectToSend] = useState([]);
    const [constEmpId,setConstEmpId] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchData , setSearchData] = useState([]);
    const [removeEmpIds,setRemovedEmpIds] = useState([])

    const navigate = useNavigate();
    const location = useLocation();

    const { skill } = location.state || {}; 
    const departmentId = useSelector((state) => state.auth.user?.departmentId); 
    const employeeAccess = useSelector((state) => state.auth.user?.employeeAccess).split(",")[2];

    const Add = employeeAccess[13] === "1" ;
    const Read = employeeAccess[14] === "1" ;
    const Update = employeeAccess[15] === "1" ;
    const Delete = employeeAccess[16] === "1";
    const addTraining = employeeAccess[17] === "1";

    const formatDateToYYYYMMDD = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
    };

    useEffect(() =>{
        if(searchQuery){
            const filteredData = filterTrainingData.filter((training) => {
                return (
                    training.trainingTitle.toLowerCase().includes(searchQuery) ||
                    training.trainerName.toLowerCase().includes(searchQuery) ||
                    training.skills.toLowerCase().includes(searchQuery)
                );
            });
                setSearchData(filteredData);
            }else{
                setSearchData(filterTrainingData);
            }
    },[searchQuery,filterTrainingData,[]])

    const renderSkillsBubbles = (skills) => {
        if (!skills || skills.trim() === "") {
            return <span>No Skills</span>;
        }
        const skillList = skills.split(", ");
        return (
            <div className="skills-bubbles-container">
                {skillList.map((skill, index) => (
                    <span key={index} className="skill-bubble">
                        {skill}
                    </span>
                ))}
            </div>
        );
    };

    const handelToSend = (trainingId) => {
        if (selectToSend.length > 0 || removeEmpIds.length > 0) {
          console.log("Employees to send:", selectToSend); 
          
          axios.post('http://localhost:3000/send-multiple-emps-to-trainings', {
            trainingId: trainingId,
            selectedEmployees: selectToSend,
            selectedEmpToRemove : removeEmpIds 
          })
          .then((response) => {
            console.log("Employees successfully sent to training:", response.data);
            window.alert("Employees successfully sent to training")
          })
          .catch((error) => {
            console.error("Error sending employees to training:", error);
          });
        } else {
          console.log("No employees selected.");
        }
      };
      
    
    useEffect(() => {
        axios.get('http://localhost:3000/GetEmpFormRegister')
            .then((response) => {
                const preSelectedEmpIds = response.data.map(emp => emp.employeeId);  
                setPreSelectedEmp(preSelectedEmpIds); 
                setTrainingPreselectedemp(response.data);
                console.log("skillsssss",skill) 
                console.log("Add",Add);
                console.log("Read",Read);   
                console.log("Update",Update);
                console.log("Delete",Delete);
                //setSelectToSend(preSelectedEmpIds);  
            })
            .catch((error) => {
                console.error("Error fetching pre-selected employees:", error);
            });
    }, [selectedTrainingId]);
    
    
    useEffect(() => {
        axios
            .get("http://localhost:3000/departments")
            .then((response) => {
                const array = response.data.map((arr) => ({
                    id: arr.departmentId,
                    label: arr.departmentName,
                }));
                setDepartment(array);
                console.log("Happy happy")
            })
            .catch((error) => {
                console.error("Error fetching departments:", error);
            });
    }, []);

    useEffect(() => {
        if(skill == undefined){
            axios
            .get(`http://localhost:3000/get-department-needed-trainings/${departmentId}`)
            .then((response) => {
                const today = formatDateToYYYYMMDD(new Date());
                //console.log("Start Date : " , startDate);
                console.log("Todays Date : " , today)
                const filteredData = response.data
                    .filter((train) => {
                        const startDate = formatDateToYYYYMMDD(new Date(train.startTrainingDate));
                        console.log("Todays Date : " , today)
                        console.log("Start date : ",startDate)
                        console.log("jo",startDate >= today)
                        return startDate >= today;
                    })
                    .map((train) => ({
                        ...train,
                        evaluationType: reverseEvaluationType(train.evaluationType), // Map evaluationType here
                    }));

                console.log("Newly given:  ", filteredData);
                setFilterTrainingData(filteredData);
                console.log("Department training data: ", response.data);
            })
            .catch((error) => {
                console.error("Error fetching trainings:", error);
            });
        }else{
            axios
            .get(`http://localhost:3000/department-eligible-for-training/${departmentId}/${skill[0].id}`)
            .then((response) => {
                const today = formatDateToYYYYMMDD(new Date());
                const filteredData = response.data
                    .filter((train) => {
                        const startDate = formatDateToYYYYMMDD(new Date(train.startTrainingDate));
                        return startDate >= today;
                    })
                    .map((train) => ({
                        ...train,
                        evaluationType: reverseEvaluationType(train.evaluationType), // Map evaluationType here
                    }));
                setFilterTrainingData(filteredData);
                console.log("Depatemtn trainng data : ", filterTrainingData)
            })
            .catch((error) => {
                console.error("Error fetching trainings:", error);
            });
        }
        
    }, [departmentId]);


    useEffect(() => {
        if (!selectedTrainingId) return;
        const train_dept_data = {trainingId:selectedTrainingId,departmentId:departmentId}
        axios
            .get(`http://localhost:3000/eligible-employee-to-send-to-training`,{params : train_dept_data})
            .then((response) => {
                const empFromAssignedTrining = response.data
                // setEligibleEmployees(response.data.filter(emp =>!PreSelectedEmp.includes(emp.employeeId)));
                const emp_ids =TrainingPreselectedemp.filter(emp => emp.trainingId === selectedTrainingId).map(emp => emp.employeeId);
                const uniqueEmployees = response.data.filter(
                    (item, index, array) =>
                      index === array.findIndex(emp => emp.employeeId === item.employeeId)
                  );
                console.log("Uniques employees : ",uniqueEmployees)
                setEligibleEmployees(uniqueEmployees);
                //setEligibleEmployees(response.data);
                setTrainingPreselectedempId(emp_ids);
                setConstEmpId(emp_ids);
                console.log("Eligible employee data : ",emp_ids)
                console.log("Eligible employee data : ",response.data)
            })
            .catch((error) => {
                console.error("Error fetching eligible employees:", error);
                console.log("Error fetching eligible employees:",train_dept_data);
            });
    }, [selectedTrainingId]);

    const handleDeptSelect = (dept) => {
        setSelectedDepartment(dept);
        console.log("selected department id:", dept.id);
    };

    const toggleRowExpand = (id) => {
        setExpandedRowId((prevId) => (prevId === id ? null : id));
    };

        const onSelectionChange = (emp_id, isChecked) => {
            // Update `selectToSend`
            setSelectToSend((prev = []) => {
                const updated = isChecked
                    ? constEmpId.includes(emp_id)?[...prev]:[...prev, emp_id]
                    : prev.filter((id) => id !== emp_id);
                console.log("Updated selectToSend:", updated);
                return updated;
            });
        
            // Update `preSelectedEmp`
            setPreSelectedEmp((prev = []) => {
                const updated = isChecked
                    ? [...prev, emp_id]
                    : prev.filter((id) => id !== emp_id);
                console.log("Updated preSelectedEmp:", updated);
                return updated;
            });
        
            // Update `trainingPreselectedempId`
            setTrainingPreselectedempId((prev = []) => {
                const updated = isChecked
                    ? [...prev, emp_id]
                    : prev.filter((id) => id !== emp_id);
                console.log("Updated trainingPreselectedempId:", updated);
                return updated;
            });
        
            // Update `removedEmpIds` only if the employee was previously selected for this training
            setRemovedEmpIds((prev = []) => {
                const updated = isChecked
                    ? prev.filter((id) => id !== emp_id) // Remove if selected again
                    : constEmpId.includes(emp_id) // Only add if previously selected for training
                    ? [...prev, emp_id]
                    : prev; // Do nothing if not previously selected for training
                console.log("Updated removedEmpIds:", updated);
                return updated;
            });
        
            // Log action
            console.log(`Employee ${isChecked ? "selected" : "deselected"}:`, emp_id);
        };
    

    const handleTrainingAdded = (training) => {
        console.log("Training added:", training);
        const skillId = training.skills.map(skill => skill.id);
        const skillName = training.skills.map(skill => skill.label);
        const addedData = {
            ...training,
            skills: skillName.join(", "),
            skillIds: skillId.join(", "),
            evaluationType: reverseEvaluationType(training.evaluationType),
        }
        console.log("Added data:", addedData);
        setFilterTrainingData((prevData) => [...prevData, addedData]);
    }

    useEffect(() => {
        console.log("Updated filterTrainingData:", filterTrainingData);
    }, [filterTrainingData]);
    
    function reverseEvaluationType(value) {
        const evaluationTypeMapping = {
          1: 'Multiple Choice Questions',
          2: 'Assignments',
        };
        return evaluationTypeMapping[value] || null; 
    }

    const columns = [
        {
            label: "Training Name",
            id: "trainingTitle",
        },
        {
            label: "Trainer Name",
            id: "trainerName",
        },
        {
            label: "Training Skills",
            id: "skills",
            render: (row) => renderSkillsBubbles(row.skills),
        },
        {
            label: "Start Date",
            id: "startTrainingDate",
            render: (row) => new Date(row.startTrainingDate).toLocaleDateString(),
        },
        {
            label: "End Date",
            id: "endTrainingDate",
            render: (row) => new Date(row.endTrainingDate).toLocaleDateString(),
        },
        {label: "Evaluation Type", id: "evaluationType"},
    ];
   
    return (
        <div>
            <header className="send-confirm-dash-header">
                <FiArrowLeftCircle className="employeeSwitch-back-button" onClick={() => navigate("/SendAndGiveTraining")} title="Go back"/>
                <h4 className='employeeSwitch-title'>Back</h4>
            </header>

            <div className="SendEmpToTrain-addTraining">
                {addTraining &&
                    <AddTraining
                    onTrainingAdded={handleTrainingAdded}
                    editTrainingData={undefined}
                    isEditing={undefined}
                    setIsEditing={undefined}
                    departmentId={departmentId}
                    prevSelectedSkill = {skill}
                    cancelButton = {true}
                  />
                }
            </div>

            {filterTrainingData.length > 0 &&(<div className="training-search-bar-cont">
                <TextField
                    label="Search by training name, trainer, or skill"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    sx={{
                        width: '350px',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '15px',
                            height: '40px',
                            backgroundColor: 'white',
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                border: '2px solid #ccc', 
                                borderRadius: 'inherit',
                                pointerEvents: 'none',
                                zIndex: 1,
                                transition: 'all 0.2s ease',
                            },
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: '2px', 
                                backgroundColor: '#1976d2',
                                transform: 'scaleX(0)',
                                transformOrigin: 'left',
                                transition: 'transform 0.2s ease',
                                zIndex: 2,
                            },
                            '&.Mui-focused::before': {
                                border: 'none', 
                            },
                        },
                        '& .MuiInputLabel-root': {
                            top: '50%',
                            transform: 'translateY(-50%)',
                            transition: 'all 0.2s ease',
                            marginLeft: '35px',
                        },
                        '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.MuiFormLabel-filled': {
                            top: 0,
                            transform: 'translateY(-50%) scale(0.75)',
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setSearchQuery('')} edge="end">
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </div>)}


            {loading ? (
              <p className="loading-message">Loading data...</p>
            ) : (
            filterTrainingData.length > 0 && (
                <div className="overall-send-confirm-table-container">
                    <div className="send-confirm-table-container">
                        <table>
                            <thead>
                                <tr>
                                    {columns.map((col) => (
                                        <th key={col.id}>{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                { searchData .map((row) => (
                                    <React.Fragment key={row.trainingId}>
                                        <tr
                                            onClick={() => {
                                                console.log("traiing id",row.trainingId)
                                                toggleRowExpand(row.trainingId);
                                                setSelectedTrainingId(row.trainingId);
                                            }}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {columns.map((col) => (
                                                <td key={col.id}>
                                                    {col.render ? col.render(row) : row[col.id]}
                                                </td>
                                            ))}
                                        </tr>
                                        {expandedRowId === row.trainingId  && (
                                            <tr>
                                                <td colSpan={columns.length + 1}>
                                                    <div className="expanded-row-content">
                                                        <strong>Eligible Employees:</strong>
                                                        {
                                                            eligibleEmployees.length > 0 ?(
                                                                <table className="employee-details-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Sr No.</th>
                                                                    <th>Employee Name</th>
                                                                    {(Update || Add) && <th>Select</th>}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {eligibleEmployees.map((emp, index) => (
                                                                    <tr key={index}>
                                                                        <td>{index+1}</td>
                                                                        <td>{emp.employeeName}</td>
                                                                        {
                                                                            (Update || Add) && (
                                                                            <td>
                                                                                <GenralCheckBox
                                                                                    emp_id={emp.employeeId}
                                                                                    selectToSend={trainingPreSelectedEmpId}  
                                                                                    onSelectionChnge={onSelectionChange}
                                                                                />
                                                                            </td>
                                                                            )
                                                                        }
                                                                    </tr>
                                                                ))}

                                                                
                                                                {(Update || Add) && (
                                                                    <tr>
                                                                        <td colSpan={columns.length} style={{ textAlign: 'right' }}>
                                                                            <button
                                                                                className="send-conform-send-button"
                                                                                onClick={() => handelToSend(row.trainingId)}
                                                                            >
                                                                                Send
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                
                                                            </tbody>
                                                        </table>
                                                            ) : (
                                                                <p>
                                                                    No employee to select....
                                                                </p>
                                                            )
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SendConformEmpToTraining;

