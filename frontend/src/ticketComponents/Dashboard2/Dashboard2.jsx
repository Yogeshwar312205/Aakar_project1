import React, { useMemo, useState, useContext, useEffect } from 'react';
import { Box, Typography, Paper, Grid, LinearProgress } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DonutChart from '../DonutChart/DonutChart';
import './Dashboard2.css';
import BackButton from '../Backbutton/Backbutton';
import UserContext from '../context/UserContext';
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { use } from 'react';


const SummaryBoxes = ({ summaryData, onCardClick }) => (
  <Grid container spacing={2} justifyContent="center" padding={{ xs: '8px', sm: '16px' }}>
    {summaryData.map((item, index) => (
      <Grid item key={index} xs={12} sm={6} md={4} lg={2}>
        <Paper
          elevation={3}
          style={{ padding: '16px', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => onCardClick(item.label)}
        >
          <Typography variant="h5" style={{ color: '#1A73E8', fontWeight: 'bold' }}>
            {item.value}
          </Typography>
          <Typography variant="body2" style={{ color: '#757575' }}>
            {item.label}
          </Typography>
        </Paper>
      </Grid>
    ))}
  </Grid>
);

const TicketStatus = ({ statusData }) => (
  <Box>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="body1" gutterBottom style={{ color: '#757575', fontWeight: 'bold' }}>
        Unresolved tickets by status
      </Typography>
      <AccessTimeIcon style={{ color: '#757575' }} />
    </Box>
    {statusData.map((status, index) => (
      <Box key={index} display="flex" flexDirection="column" mb={2}>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="body2" style={{ flexGrow: 1 }}>
            {status.label}
          </Typography>
          <Typography variant="body2">{status.percentage}%</Typography>
          <Typography variant="body2" style={{ marginLeft: 8 }}>
            {status.count}
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={status.percentage} />
      </Box>
    ))}
  </Box>
);

const CategoryWiseTickets = ({ categories }) => (
  <Box>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="body1" gutterBottom style={{ color: '#757575', fontWeight: 'bold' }}>
        New and open tickets category-wise
      </Typography>
      <AccessTimeIcon style={{ color: '#757575' }} />
    </Box>
    {categories.map((category, index) => (
      <Box key={index} mb={2}>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="body2" style={{ flexGrow: 1 }}>
            {category.label}
          </Typography>
          <Typography variant="body2">{category.percentage}%</Typography>
          <Typography variant="body2" style={{ marginLeft: 8 }}>
            {category.count}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={category.percentage}
          style={{
            backgroundColor: index % 2 === 0 ? '#e0f7fa' : '#e3f2fd',
            color: '#0288d1',
          }}
        />
      </Box>
    ))}
  </Box>
);


// Updated fetchTickets function to pass the correct user info and params based on currentRole
const fetchTickets = async (user, setTickets, setDepartmentTickets, setTicketSummary, department, AccessLevelValue) => {
  console.log(AccessLevelValue);
  try {
    // let endpoint = "http://localhost:3000/tickets/tickets";

    let params = {};

    if (AccessLevelValue === 1) {
      params = { employee_id: user.id };
    } else if (AccessLevelValue === 2) {
      params = { department: department };
    } else if (AccessLevelValue === 3) {
      params = { department: department };
    } else if (5) {
      params = { assignee: user.name };
    }
    params.accessLevel = AccessLevelValue;


    let endpoint = `http://localhost:3000/tickets/tickets/summary2`;

    const response = await axios.get(endpoint, { params });
    setTicketSummary(response.data);

  } catch (error) {
    console.error("Error fetching tickets:", error);
  }
};

function App() {
  const { accessLevel} = useParams();
  const AccessLevelValue = parseInt(accessLevel, 10);
  const { currentRole, user, updateCurrentRole } = useContext(UserContext); // Make sure to use user from context
  const [tickets, setTickets] = useState([]);
  const [departmentTickets, setDepartmentTickets] = useState([]);
  const [ticketSummary, setTicketSummary] = useState({});
  const [department, setDepartment] = useState(() => {
    // Default to "Executive" role if it exists in the user's roles
    return currentRole?.department || null;
  });

  const navigate = useNavigate(); // Initialize useNavigate

  const handleDepartmentSelection = (department, setDepartment) => {
    setDepartment(department);

  };
  useEffect(() => {
    setDepartment(currentRole?.department);

  }, [currentRole]);


  useEffect(() => {
    if (user) {
      fetchTickets(user, setTickets, setDepartmentTickets, setTicketSummary, department, AccessLevelValue); // Fetch tickets based on current role and user
    }

    const interval = setInterval(() => {
      if (user) {
        fetchTickets(user, setTickets, setDepartmentTickets, setTicketSummary, department, AccessLevelValue); // Poll every 2 seconds
      }
    }, 10000);

    return () => clearInterval(interval); // Clean up on component unmount
  }, [user, department, currentRole, AccessLevelValue]);

  // Function to handle card clicks and navigate with filtered tickets
  const handleCardClick = (label) => {
    let filteredTickets = [];
    let type = '';

    switch (label) {
      case 'Overdue':
        type = 'Overdue';
        break;
      case 'Due today':
        type = 'Due today';
        break;
      case 'Open':
        type = 'Open';
        break;
      case 'On hold':
        type = 'On hold';
        break;
      case 'Unassigned':
        type = 'Unassigned';
        break;
      case 'All tickets':
        type = 'All tickets';
        break;
      default:
        break;
    }

    navigate('/FilteredTicketPage2', { state: { ticketsType: type, AccessLevelValue: AccessLevelValue, department: department } });
  };

  // Calculate summary data
  const summaryData = useMemo(() => {

    return [
      { label: 'Overdue', value: ticketSummary?.summary?.overdue ?? 0 },
      { label: 'Due today', value: ticketSummary?.summary?.dueToday ?? 0 },
      { label: 'Open', value: ticketSummary?.summary?.open ?? 0 },
      { label: 'On hold', value: ticketSummary?.summary?.onHold ?? 0 },
      { label: 'Unassigned', value: ticketSummary?.summary?.unassigned ?? 0 },
      { label: 'All tickets', value: ticketSummary?.summary?.allTickets ?? 0 }
    ];
  }, [tickets, ticketSummary]);

  // Calculate status data
  const statusData = useMemo(() => {

    const total = ticketSummary?.summary?.allTickets ?? 0;

    // Provide a fallback to an empty array if `statusData` is undefined or null
    return Object.keys(ticketSummary?.statusData ?? {}).map(status => ({
      label: ticketSummary.statusData[status]?.label || 'Unknown', // Default label
      count: ticketSummary.statusData[status]?.count || 0, // Default count
      percentage: total > 0 ? ((ticketSummary.statusData[status]?.count / total) * 100).toFixed(2) : '0.00',
    }));

  }, [tickets, ticketSummary]);

  // Calculate category-wise data
  const categories = useMemo(() => {

    const total = ticketSummary?.summary?.allTickets ?? 0;

    // Provide a fallback to an empty object if `categories` is undefined or null
    return Object.keys(ticketSummary?.categories ?? {}).map(categoryKey => {
      const category = ticketSummary.categories[categoryKey] || {}; // Fallback to an empty object if the category is undefined

      return {
        label: category?.label || 'Unknown', // Default label
        count: category?.count || 0, // Default count
        percentage: total > 0 ? ((category?.count / total) * 100).toFixed(2) : '0.00',
      };
    });

  }, [tickets, ticketSummary]);


  return (

    <Box p={{ xs: '8px', sm: '16px' }}>
      {console.log("rendering dashboard")}

      <div className="topline">
        <BackButton title={
          AccessLevelValue === 1 ? "My Tickets" :
            AccessLevelValue === 2 ? "Department Created Tickets" :
              AccessLevelValue === 3 ? "Department Assigned Tickets" :
                AccessLevelValue === 4 ? "All Tickets" :
                  AccessLevelValue === 5 ? "Assigned Tickets" : ""
        } />
        
        {(AccessLevelValue === 2 || AccessLevelValue === 3) && <div className="dropdown">
          <button
            className="dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {(department ?? "Select Departmet")}

          </button>
          <ul className="dropdown-menu">
            {user?.roles?.map((role, index) => (
              <li key={index}>
                <button
                  className="dropdown-item"
                  onClick={() => handleDepartmentSelection(role.department, setDepartment)}
                >
                  {role.department}
                </button>
              </li>
            ))}
          </ul>
        </div>
  }

      </div>

      <SummaryBoxes summaryData={summaryData} onCardClick={handleCardClick} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <DonutChart priorityCount={ticketSummary.priority} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <TicketStatus statusData={statusData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CategoryWiseTickets categories={categories} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;


