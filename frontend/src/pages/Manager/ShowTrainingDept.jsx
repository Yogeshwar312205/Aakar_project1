import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GeneralSearchBar from '../../components/GenralSearchBar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './ShowTrainingDept.css';
import { FiArrowLeftCircle } from 'react-icons/fi';
import { departmentInfo,departmentSkills,departmentEmployeeData } from './showTrainingDeptAPI';
import { useSelector } from 'react-redux';

const ShowTrainingDept = () => {
  const [empData, setEmpData] = useState({});
  const [depts, setDepts] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const navigate = useNavigate();
  const departmentId = useSelector((state) => state.auth.user?.departmentId); 

  useEffect(() => {
      const departments = departmentInfo;
      console.log("Show training department , ",departments);
      setDepts(departments);  
  }, []);

  useEffect(() => {
    if (departmentId) {
      setLoading(true);
      axios
        .get(`http://localhost:3000/DepartmentGiveTskills/${departmentId}`)
        .then((response) => {
          const skills = response.data.map((skill) => ({
            id: skill.skillId,
            label: skill.skillName,
          }));
          setSkillOptions(skills);
          console.log("Show training department SKill , ",response.data);
        })
        .catch((error) => {
          console.error('Error fetching skills:', error);
          toast.error('Failed to fetch skills.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSkillOptions([]);
    }
  }, [departmentId]);

  useEffect(() => {
    if (departmentId) {
      setLoading(true);
      axios
        .get(
          `http://localhost:3000/get-distinct-department-employess-skill-to-train/${departmentId}`
        )
        .then((response) => {
          const deptData = response.data || {};
          setEmpData(deptData);
          console.log("get-distinct-department-employess-skill-to-train",response.data);
        })
        .catch((error) => {
          console.error('Error fetching employee data:', error);
          toast.error('Failed to fetch employee data.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setEmpData({});
    }
  }, [departmentId]);

  // Group employee data by department and skill
  const transformDataForTable = () => {
    const departmentRows = Object.keys(empData).map((departmentName) => {
      const employeeSkills = empData[departmentName];

      // Group employees by skill
      const skillsWithEmployees = skillOptions.reduce((acc, skill) => {
        acc[skill.label] = employeeSkills.filter(
          (emp) => emp.skillName === skill.label
        );
        return acc;
      }, {});

      return {
        departmentName,
        skillsWithEmployees,
      };
    });

    return departmentRows;
  };

  const tableData = transformDataForTable();

  const handleHeaderClick = (skillId, skillLabel) => {
    const skill = [
      {
        id: skillId,
        label: skillLabel,
      },
    ];

    console.log('Navigating with skill:', skill);

    navigate(`/SendConformEmpToTraining`, {
      state: { skill },
    });
  };

  const handleRowClick = (departmentName) => {
    setExpandedRows((prev) => ({
      ...prev,
      [departmentName]: !prev[departmentName],
    }));
  };

  return (
    <div className="show-training-content">
      <header className="show-training-dept-dash-header">
        <FiArrowLeftCircle
          className="employeeSwitch-back-button"
          onClick={() => navigate(-1)}
          title="Go back"
        />
        <h4 className="employeeSwitch-title">Back</h4>
      </header>

      {loading ? (
        <p className="loading-message">Loading data...</p>
      ) : (
        tableData.length > 0 && (
        <div className="show-training-employee-table">
          <table className='show-training-tableComponent'>
            <thead>
              <tr>
                <th>Department</th>
                {skillOptions.map((skill) => (
                  <th
                    key={skill.id}
                    className="clickable-header"
                    onClick={() => handleHeaderClick(skill.id, skill.label)}
                  >
                    {skill.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <React.Fragment key={index}>
                  <tr
                    onClick={() => handleRowClick(row.departmentName)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{row.departmentName}</td>
                    {skillOptions.map((skill) => (
                      <td key={skill.id}>
                        {row.skillsWithEmployees[skill.label]?.length || 0}
                      </td>
                    ))}
                  </tr>
                {expandedRows[row.departmentName] && (
                  <tr>
                    <td style={{ background: 'transparent' }}></td>
                    {skillOptions.map((skill) => {
                      const employeesWithSkill = row.skillsWithEmployees[skill.label] || [];
                      return (
                        <td key={skill.id} style={{ textAlign: 'center', verticalAlign: 'top' }}>
                          {employeesWithSkill.length > 0 ? (
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                              {employeesWithSkill.map((emp, idx) => (
                                <li key={idx} style={{ marginBottom: '5px' }}>
                                  {emp.employeeName}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span>No employees</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ShowTrainingDept;
