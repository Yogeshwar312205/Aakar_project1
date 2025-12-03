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
import { FaChalkboardTeacher, FaUserAlt } from 'react-icons/fa'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { IoIosGrid } from 'react-icons/io'
import { GiSkills } from 'react-icons/gi'
import { TbSubtask } from 'react-icons/tb'
import { BsListTask } from 'react-icons/bs'
import { IP } from '../constants.js'

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

  const access = useSelector(
    (state) => state?.auth?.user?.employeeAccess
  ).split(',')
  const employeeId = useSelector((state) => state.auth.user?.employeeId);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const response = await axios.get(`http://${IP}:3000/GetEmployeeAccess`, {
          params: { employeeId }, // Send employeeId as a query parameter
        })
        const { isRegistered, isTrainer } = response.data;
        console.log("Responses: ", isRegistered ? '1' : '0');
  
        // Update access based on API response
        setEmployeeAccess1(isRegistered ? '1' : '0');
        setTrainerAccess(isTrainer ? '1' : '0');
      } catch (error) {
        console.error('Error fetching access:', error)
      }
    }
  
    if (employeeId) fetchAccess();
  }, [employeeId]);

  console.log("EMP: ", employeeAccess1);
        console.log("TRAINER: ", trainerAccess);
  
  const HRManagementAccess = access[0]
  const ProjectManagementAccess = access[1]
  const TrainingManagementAccess = access[2]
  const TicketManagementAccess = access[3]

  console.log("TRaining management: ", TrainingManagementAccess[0]);

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  const closeSubmenus = () => {
    setOpenSection(null)
  }

  const navItems = [
    {
      name: 'HR Management',
      access: HRManagementAccess[0],
      icon: 'FiClipboard',
      children: [
        {
          name: 'Employees',
          slug: '/employees',
          icon: 'FiUser',
          access: HRManagementAccess[2],
        },
        {
          name: 'Departments',
          slug: '/departments',
          icon: 'FiBriefcase',
          access: HRManagementAccess[6],
        },
        {
          name: 'Designations',
          slug: '/designations',
          icon: 'PiOfficeChair',
          access: HRManagementAccess[10],
        },
      ],
    },
    {
      name: 'Project Management',
      access: ProjectManagementAccess[0],
      icon: 'TbSubtask',
      children: [
        {
          name: 'All Projects',
          slug: '/allProjects',
          icon: 'BsListTask',
          access: ProjectManagementAccess[0],
        },
      ],
    },
    {
      name: 'Ticket Tracking',
      icon: 'BsTicket',
      access: TicketManagementAccess[0],
      children: [
        {
          name: 'Create Ticket',
          slug: '/createTicket',
          icon: 'BsTicket',
          access: TicketManagementAccess[0],
        },
        {
          name: 'Dashboard',
          slug: '/tickettracking',
          icon: 'BsTicket',
          access: TicketManagementAccess[0],
        },
        {
          name: 'My Tickets',
          slug: '/dashboard/1',
          icon: 'BsTicket',
          access: TicketManagementAccess[0],
        },
        {
          name: 'Department Created Tickets',
          slug: '/dashboard/2',
          icon: 'BsTicket',
          access: TicketManagementAccess[1],
        },
        {
          name: 'Department Assigned Tickets',
          slug: '/dashboard/3',
          icon: 'BsTicket',
          access: TicketManagementAccess[2],
        },
        {
          name: 'All Tickets',
          slug: '/dashboard/4',
          icon: 'BsTicket',
          access: TicketManagementAccess[3],
        },
        {
          name: 'Assigned Tickets',
          slug: '/dashboard/5',
          icon: 'BsTicket',
          access: TicketManagementAccess[4],
        },
      ],
    },
    {
      name: 'Training',
      icon: 'MdOutlineModelTraining',
      access: '1',
      children: [
        {
          name: 'My Status',
          slug: '/EmployeeSwitch',
          icon: 'FaUserAlt',
          access: '1',
        },
        {
          name: 'Skills',
          slug: '/Update_skills',
          icon: 'GiSkills',
          access: TrainingManagementAccess[2],
        },
        {
          name: 'Skill Matrix',
          slug: '/SearchBar',
          icon: 'IoIosGrid',
          access: TrainingManagementAccess[6] || TrainingManagementAccess[10],
        },
        {
          name: 'Assign Training',
          slug: '/SendAndGiveTraining',
          icon: 'FaChalkboardTeacher',
          access: TrainingManagementAccess[14],
        },
        {
          name: 'Training Plan',
          slug: '/trainings',
          icon: 'MdBook',
          access: TrainingManagementAccess[18],
        },
        {
          name: 'Trainer Status',
          slug: '/TrainerSwitch',
          icon: 'AiOutlineCheckCircle',
          access: trainerAccess,
        },
      ],
    },
  ]

  return (
    <div className="sidebar" onMouseLeave={closeSubmenus}>
      <div>
        <FiMenu className="menu-icon" size={22} color="white" />
        <div className="menu">
          {navItems.map(
            (item) =>
              item.access === '1' && (
                <div key={item.name}>
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
                    >
                      {item.children.map(
                        (child) =>
                          child.access === '1' && (
                            <Link
                              key={child.name}
                              to={child.slug}
                              className="icon-container"
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
      <div>
        <LogoutButton />
      </div>
    </div>
  )
}

export default Sidebar