import { useEffect } from 'react'
import axios from 'axios'
import './Sidebar.css'
import {
  FiMenu,
  FiClipboard,
  FiBriefcase,
  FiUser,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import LogoutButton from './LogoutButton.jsx'
import { BsTicket } from 'react-icons/bs'
import { PiOfficeChair } from 'react-icons/pi'
import { MdBook, MdOutlineModelTraining } from 'react-icons/md'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { FaChalkboardTeacher, FaUserAlt, FaUserTie } from 'react-icons/fa'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { IoIosGrid } from 'react-icons/io'
import { GiSkills } from 'react-icons/gi'
import { TbSubtask } from 'react-icons/tb'
import { BsListTask } from 'react-icons/bs'

// Utility to map icon strings to actual icon components
const iconMap = {
  FiClipboard: <FiClipboard size={22} color="white" />,
  FiBriefcase: <FiBriefcase size={22} color="white" />,
  FiUser: <FiUser size={22} color="white" />,
  BsTicket: <BsTicket size={22} color="white" />,
  PiOfficeChair: <PiOfficeChair size={22} color="white" />,
  MdOutlineModelTraining: <MdOutlineModelTraining size={22} color="white" />,
  MdBook: <MdBook size={22} color="white" />,
  FaUserAlt: <FaUserAlt size={22} color="white" />,
  FaChalkboardTeacher: <FaChalkboardTeacher size={22} color="white" />,
  FaUserTie: <FaUserTie size={22} color="white" />,
  GiSkills: <GiSkills size={22} color="white" />,
  AiOutlineCheckCircle: <AiOutlineCheckCircle size={22} color="white" />,
  IoIosGrid: <IoIosGrid size={22} color="white" />,
  TbSubtask: <TbSubtask size={22} color="white" />,
  BsListTask: <BsListTask size={22} color="white" />,
}

const Sidebar = () => {
  const navigate = useNavigate()
  const [openSection, setOpenSection] = useState(null)
  const [employeeAccess1, setEmployeeAccess1] = useState('0')
  const [trainerAccess, setTrainerAccess] = useState('0')
  const [canManageExternalTrainers, setCanManageExternalTrainers] = useState(false)

  const employeeAccess = useSelector(
    (state) => state?.auth?.user?.employeeAccess
  ) || '';
  
  const userType = useSelector(
    (state) => state?.auth?.user?.userType
  ) || 'internal';
  
  // Get canManageExternalTrainers from Redux (already loaded during login)
  const canManageExternalTrainersFromRedux = useSelector(
    (state) => state?.auth?.user?.canManageExternalTrainers
  );
  
  console.log('🎯 Sidebar Redux state:', {
    userType,
    employeeAccess,
    canManageExternalTrainersFromRedux,
    fullUser: useSelector((state) => state?.auth?.user)
  });
  
  // For external trainers, employeeAccess is a single long string of zeros
  // For internal users, it's comma-separated: HR,Project,Training,Ticket
  const access = userType === 'external_trainer' 
    ? ['0', '0', '1', '0']  // External trainers only get Training access
    : (employeeAccess ? employeeAccess.split(',') : ['', '', '', '']);

  const employeeId = useSelector((state) => state.auth.user?.employeeId);

  console.log("Employee ID: ", employeeId);
  console.log("Full user object:", useSelector((state) => state.auth.user));
  console.log("User Type: ", userType);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/GetEmployeeAccess`, {
          params: { employeeId }, // Send employeeId as a query parameter
        })
        const { isRegistered, isTrainer } = response.data;
        console.log("Responses: ", isRegistered ? '1' : '0');

        // Update access based on API response
        setEmployeeAccess1(isRegistered ? '1' : '0');
        setTrainerAccess(isTrainer ? '1' : '0');
        
        // Fetch canManageExternalTrainers permission
        try {
          const accessResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/employee/${employeeId}/access`,
            { 
              withCredentials: true,
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            }
          );
          console.log('🔍 Sidebar API Response:', accessResponse.data);
          setCanManageExternalTrainers(accessResponse.data.canManageExternalTrainers || false);
          console.log('🔍 Sidebar: canManageExternalTrainers =', accessResponse.data.canManageExternalTrainers);
          console.log('🔍 Sidebar: userType =', userType);
        } catch (err) {
          console.error('❌ Error fetching external trainer permission:', err);
        }
      } catch (error) {
        console.error('Error fetching access:', error)
      }
    }

    if (employeeId) fetchAccess();
  }, [employeeId]);

  console.log("EMP: ", employeeAccess1);
  console.log("TRAINER: ", trainerAccess);

  const HRManagementAccess = access[0] || ''
  const ProjectManagementAccess = access[1] || ''
  const TrainingManagementAccess = access[2] || ''
  const TicketManagementAccess = access[3] || ''

  console.log("Training management: ", TrainingManagementAccess ? TrainingManagementAccess[0] : 'undefined');

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  const closeSubmenus = () => {
    setOpenSection(null)
  }

  const navItems = [
    {
      name: 'HR Management',
      access: userType === 'external_trainer' ? '0' : (HRManagementAccess ? HRManagementAccess[0] : '0'),
      icon: 'FiClipboard',
      children: [
        {
          name: 'Employees',
          slug: '/employees',
          icon: 'FiUser',
          access: HRManagementAccess?.[2] || '0',
        },
        {
          name: 'Departments',
          slug: '/departments',
          icon: 'FiBriefcase',
          access: HRManagementAccess?.[6] || '0',
        },
        {
          name: 'Designations',
          slug: '/designations',
          icon: 'PiOfficeChair',
          access: HRManagementAccess?.[10] || '0',
        },
      ],
    },
    {
      name: 'Project Management',
      access: userType === 'external_trainer' ? '0' : (ProjectManagementAccess?.[0] || '0'),
      icon: 'TbSubtask',
      children: [
        {
          name: 'All Projects',
          slug: '/allProjects',
          icon: 'BsListTask',
          access: ProjectManagementAccess?.[0] || '0',
        },
        {
          name: 'BOM',
          slug: '/bom-project',
          icon: 'BsListTask',
          access: ProjectManagementAccess?.[0] || '0',
        },
        {
          name: 'Stage Templates',
          slug: '/templates',
          icon: 'IoIosGrid',
          access: ProjectManagementAccess?.[0] || '0',
        },
      ],
    },
    {
      name: 'Ticket Tracking',
      icon: 'BsTicket',
      access: userType === 'external_trainer' ? '0' : (TicketManagementAccess?.[0] || '0'),
      children: [
        {
          name: 'Create Ticket',
          slug: '/createTicket',
          icon: 'BsTicket',
          access: TicketManagementAccess?.[0] || '0',
        },
        {
          name: 'Dashboard',
          slug: '/tickettracking',
          icon: 'BsTicket',
          access: TicketManagementAccess?.[0] || '0',
        },
        {
          name: 'My Tickets',
          slug: '/dashboard/1',
          icon: 'BsTicket',
          access: TicketManagementAccess?.[0] || '0',
        },
        {
          name: 'Department Created Tickets',
          slug: '/dashboard/2',
          icon: 'BsTicket',
          access: TicketManagementAccess?.[1] || '0',
        },
        {
          name: 'Department Assigned Tickets',
          slug: '/dashboard/3',
          icon: 'BsTicket',
          access: TicketManagementAccess?.[2] || '0',
        },
        {
          name: 'All Tickets',
          slug: '/dashboard/4',
          icon: 'BsTicket',
          access: TicketManagementAccess?.[3] || '0',
        },
        {
          name: 'Assigned Tickets',
          slug: '/dashboard/5',
          icon: 'BsTicket',
          access: TicketManagementAccess?.[4] || '0',
        },
      ],
    },
    {
      name: 'Training',
      icon: 'MdOutlineModelTraining',
      access: userType === 'external_trainer' ? '1' : (employeeAccess1 === '1' || trainerAccess === '1' || TrainingManagementAccess?.[0] === '1') ? '1' : '0',
      children: [
        {
          name: 'My Status',
          slug: '/EmployeeSwitch',
          icon: 'FaUserAlt',
          access: userType === 'external_trainer' ? '1' : '1',
        },
        {
          name: 'Skills',
          slug: '/Update_skills',
          icon: 'GiSkills',
          access: userType === 'external_trainer' ? '0' : (TrainingManagementAccess?.[2] === '1' ? '1' : '0'),
        },
        {
          name: 'Skill Matrix',
          slug: '/SearchBar',
          icon: 'IoIosGrid',
          access: userType === 'external_trainer' ? '0' : ((TrainingManagementAccess?.[6] === '1' || TrainingManagementAccess?.[10] === '1') ? '1' : '0'),
        },
        {
          name: 'Assign Training',
          slug: '/SendAndGiveTraining',
          icon: 'FaChalkboardTeacher',
          access: userType === 'external_trainer' ? '0' : (TrainingManagementAccess?.[14] === '1' ? '1' : '0'),
        },
        {
          name: 'Training Plan',
          slug: '/trainings',
          icon: 'MdBook',
          access: userType === 'external_trainer' ? '0' : (TrainingManagementAccess?.[18] === '1' ? '1' : '0'),
        },
        {
          name: 'Trainer Status',
          slug: '/TrainerSwitch',
          icon: 'AiOutlineCheckCircle',
          access: userType === 'external_trainer' ? '0' : trainerAccess,
        },
        {
          name: 'External Trainers',
          slug: '/training/external-trainer',
          icon: 'FaUserTie',
          access: (canManageExternalTrainersFromRedux === 1 || canManageExternalTrainersFromRedux === true) && userType === 'internal' ? '1' : '0',
        },
      ],
    },
  ]

  console.log('🎯 External Trainers menu access:', {
    canManageExternalTrainersFromRedux,
    canManageExternalTrainers,
    userType,
    calculatedAccess: (canManageExternalTrainersFromRedux === 1 || canManageExternalTrainersFromRedux === true) && userType === 'internal' ? '1' : '0'
  });

  return (
    <div className="sidebar" onMouseLeave={closeSubmenus} style={{ backgroundColor: '#0061a1' }}>
      <div style={{ backgroundColor: '#0061a1' }}>
        <FiMenu className="menu-icon" size={22} color="white" />
        <div className="menu" style={{ backgroundColor: '#0061a1' }}>
          {navItems.map(
            (item) =>
              item.access === '1' && (
                <div key={item.name} style={{ backgroundColor: '#0061a1' }}>
                  <div
                    className="icon-container main-item"
                    onClick={() => item.children && toggleSection(item.name)}
                  >
                    <div className="main-item-content">
                      {iconMap[item.icon]}
                      <span className="menu-text">{item.name}</span>
                    </div>
                    {item.children && (
                      <span className="chevron">
                        {openSection === item.name ? (
                          <FiChevronUp size={18} color="white" />
                        ) : (
                          <FiChevronDown size={18} color="white" />
                        )}
                      </span>
                    )}
                  </div>
                  {item.children && (
                    <div
                      className={`submenu ${
                        openSection === item.name ? 'expanded' : ''
                      }`}
                      style={{ backgroundColor: '#0061a1' }}
                    >
                      {item.children.map(
                        (child) =>
                          child.access === '1' && (
                            <Link
                              key={child.name}
                              to={child.slug}
                              className="icon-container"
                              style={{ backgroundColor: 'transparent', border: 'none' }}
                            >
                              {iconMap[child.icon]}
                              <span className="menu-text">{child.name}</span>
                            </Link>
                          )
                      )}
                    </div>
                  )}
                </div>
              )
          )}
        </div>
      </div>
      <div style={{ backgroundColor: '#0061a1' }}>
        <LogoutButton />
      </div>
    </div>
  )
}

export default Sidebar
