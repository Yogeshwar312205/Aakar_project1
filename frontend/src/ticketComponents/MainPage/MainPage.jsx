import React, { useState, useEffect, useContext } from "react";
import "./MainPage.css";
import { FiBarChart2, FiAlertCircle } from "react-icons/fi";
import { CiCirclePlus } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import TicketTable from "../TicketTable/TicketTable";
import axios from "axios";
import UserContext from "../context/UserContext"; // Import UserContext
import SearchBar from "../SearchBar/SearchBar";



function App() {
  const { user } = useContext(UserContext); // Access user from context
  const { currentRole } = useContext(UserContext); // Access user from context
  console.log(currentRole);

  const [selectedRole, setSelectedRole] = useState(() => {
    // Default to "Executive" role if it exists in the user's roles
    return currentRole || null;
  });
  const [activeCard, setActiveCard] = useState(null);
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async (role) => {
    try {
      let endpoint = "http://localhost:3000/tickets/tickets";
      let params = {};

      if (role?.designation === "Executive") {
        params = { employee_id: user.id };
      } else if (role?.designation === "HOD") {
        params = { department: role.department };
      } else if (role?.designation === "Admin") {
        // No additional params needed for admin
      } else if (role?.designation === "Assignee") {
        params = { assignee: user.name };
      }

      const response = await axios.get(endpoint, { params });
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    if (selectedRole) {
      fetchTickets(selectedRole); // Fetch tickets based on selected role
    }

    const interval = setInterval(() => {
      if (selectedRole) {
        fetchTickets(selectedRole); // Poll every 2 seconds
      }
    }, 2000);

    return () => clearInterval(interval); // Clean up on component unmount
  }, [selectedRole]);

  const handleCardClick = (card) => {
    if (card !== "dashboard") {
      setActiveCard(card);
    }
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role); // Set selected role
  };

  return (
    <>
      <div className="dropdown-container">
        <div className="dropdown">
          <button
            className="dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {selectedRole.designation +" " + selectedRole.department}
          </button>
          <ul className="dropdown-menu">
            {user?.roles?.map((role, index) => (
              <li key={index}>
                <button
                  className="dropdown-item"
                  onClick={() => handleRoleSelection(role)}
                >
                  {role.designation + "-" + role.department}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="create-ticket-card">
          <NavLink to="/createTicket">
            <CiCirclePlus className="create-ticket-icon" />
          </NavLink>
          <div className="create-ticket-body">Create Ticket</div>
        </div>
      </div>
      

      <div className="dropdown-container-2">
        <div className="dropdown">
          <button
            className="dropdown-toggle dropdown-toggle-2"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Sort By
          </button>
          <ul className="dropdown-menu dropdown-menu-2">
            <li>
              <button className="dropdown-item dropdown-item-2">Latest</button>
            </li>
            <li>
              <button className="dropdown-item dropdown-item-2">Type</button>
            </li>
            <li>
              <button className="dropdown-item dropdown-item-2">Status</button>
            </li>
          </ul>
          
        </div>
        
      </div>
      

      <div className="new-container">
        <TicketTable tickets={tickets} />
      </div>

      <div>
        <div
          className={`card ${activeCard === "dashboard" ? "active" : ""}`}
          onClick={() => handleCardClick("dashboard")}
          style={{ cursor: "default" }}
        >
          <NavLink to="/dashboard" state={{ Tickets: tickets }}>
            <FiBarChart2 className="card-icon" />
            <div className="card-body">Dashboard</div>
          </NavLink>
        </div>
        <div
          className={`card ${activeCard === "analytics" ? "active" : ""}`}
          onClick={() => handleCardClick("analytics")}
          style={{ cursor: "pointer" }}
        >
          <FiAlertCircle className="card-icon" />
          <div className="card-body">All Tickets</div>
        </div>
        <div
          className={`card ${activeCard === "reports" ? "active" : ""}`}
          onClick={() => handleCardClick("reports")}
          style={{ cursor: "pointer" }}
        >
          <FiAlertCircle className="card-icon" />
          <div className="card-body">My Tickets</div>
        </div>
        
        
      </div>
    </>
  );
}

export default App;
