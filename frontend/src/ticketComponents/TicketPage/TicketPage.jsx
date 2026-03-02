import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './TicketPage.css';
import Ticket from '../Ticket/Ticket.jsx';
import StatusUpdate from '../StatusUpdate/StatusUpdate.jsx';
import BackButton from '../Backbutton/Backbutton.jsx';
import AssigneeUpdate from '../AssigneeUpdate/AssigneeUpdate.jsx';
import TicketMessage from '../Css/TicketMessage/TicketMessage.jsx';
import MessageCard from '../Css/MessageCard/MessageCard.jsx';
import TicketDetails from '../Css/TicketDetails/TicketDetails2.jsx';








function TicketPage() {
  const { id } = useParams();

  const { assigneeOptions } = {};

  const [showTicketMessage, setShowTicketMessage] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [updated, setUpdated] = useState(Date.now()); // or new Date()


  const onUpdate = (currentDate)=>{
    setUpdated(currentDate);
  };


  useEffect(() => {
    console.log("Updated prop changed:", updated);
  }, [updated]);
  


  useEffect(() => {
    const fetchAssigneeHistory = async () => {
      try {
        const response = await fetch(`http://localhost:3000/ticketAssigneeHistory/assignee-history/${id}`);
        const data = await response.json();
        setHistoryData(data);
        const ticketresponse = await fetch(`http://localhost:3000/tickets/tickets/${id}`);
        const ticketdata = await ticketresponse.json();
        setTicket(ticketdata);



      } catch (error) {
        console.error('Error fetching assignee history:', error);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3000/logs/logs/ticket/${id}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchAssigneeHistory();
    fetchMessages();
  }, [id,updated]);

  const handleNewMessageClick = () => {
    setShowTicketMessage(!showTicketMessage);
  };

  const handleHistoryToggle = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  const renderHistory = () => (
    <div className="content">
      <button className="history-toggle-button" onClick={handleHistoryToggle}>
        {isHistoryOpen ? 'Hide Assignee History' : 'Show Assignee History'}
      </button>
      {isHistoryOpen && (
        <div className="history-table-container">
          <h3>Assignee History</h3>
          <table className="assignee-history-table">
            <thead>
              <tr>
                <th>Assignee ID</th>
                <th>Assignee Name</th>
                <th>Assigned Date</th>
                <th>Assigned Time</th>
              </tr>
            </thead>
            <tbody>
              {historyData && historyData.length > 0 ? (
                historyData.map((entry, index) => {
                  const assignedDate = new Date(entry.assigned_at).toLocaleDateString();
                  const assignedTime = new Date(entry.assigned_at).toLocaleTimeString();

                  return (
                    <tr key={index}>
                      <td>{entry.assignee_id}</td>
                      <td>{entry.assignee_name}</td>
                      <td>{assignedDate}</td>
                      <td>{assignedTime}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4">No history available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderMessages = () => (
    <div className="message-section">
      <h3>Messages</h3>
      {messages.length > 0 ? (
        messages.map((message, index) => (
          <MessageCard key={index} message={message} />
        ))
      ) : (
        <p>No messages available.</p>
      )}
    </div>
  );

  return (
    <div className="content-container">
      <div className="ticketPageContent">
        <BackButton />
      </div>

      <div className="ticketPageContent">
        <Ticket ticketId={id} />
      </div>

      <div className="assignee-functionality">
        <StatusUpdate ticketId={id} onUpdate={onUpdate} />
        <AssigneeUpdate ticketId={id} assigneeOptions={assigneeOptions} onUpdate={onUpdate} />

      </div>

      {/* {renderHistory()} */}



      {/* <div className="content">
        <div className="createLogButton">
          <button onClick={handleNewMessageClick}>
            {showTicketMessage ? 'Hide Message Form' : 'Create New Message'}
          </button>
          
        </div>
        {showTicketMessage && (
            <TicketMessage ticketId={id} employeeId={1} />
          )}
      </div> */}

      {/* {renderMessages()} */}
      <TicketDetails ticket={ticket} />


    </div>
  );
}

export default TicketPage;
