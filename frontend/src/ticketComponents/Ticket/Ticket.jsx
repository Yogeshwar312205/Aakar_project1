import React, { useState, useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import axios from 'axios';
import './Ticket.css';

export default function AccordionExpandDefault({ ticketId }) {
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/tickets/tickets/${ticketId}`);
        setTicketData(response.data);
      } catch (error) {
        console.error('Error fetching ticket data:', error);
      }
    };

    if (ticketId) {
      fetchTicketData();
    }
  }, [ticketId]);

  if (!ticketData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: 2, padding: 2, boxShadow: 1, marginBottom: 2 }}>
      <div className="date">
        <Typography>{new Date(ticketData.ticket_created_at).toLocaleDateString()}</Typography>
      </div>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" align="center" fontWeight="bold">
            Issue title
          </Typography>
          <Typography variant="body2" align="center">
            {ticketData.title}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" align="center" fontWeight="bold">
            Department
          </Typography>
          <Typography variant="body2" align="center">
            {ticketData.department}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" align="center" fontWeight="bold">
            Issue type
          </Typography>
          <Typography variant="body2" align="center">
            {ticketData.issue_type}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" align="center" fontWeight="bold">
            Priority
          </Typography>
          <Typography variant="body2" align="center">
            {ticketData.priority}
          </Typography>
        </Box>
        <Box sx={{ flex: 2 }}>
          <Typography variant="body2" align="center" fontWeight="bold">
            Description
          </Typography>
          <Typography variant="body2" align="center">
            {ticketData.description}
          </Typography>
        </Box>
      </Box>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography>Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {ticketData.details}
        </AccordionDetails>
      </Accordion>

      {/* Render each attachment link */}
      {ticketData.attachments && ticketData.attachments.length > 0 && (
        <div>
          <Typography variant="body2" fontWeight="bold">Attachments:</Typography>
          {ticketData.attachments.map((attachment, index) => (
            
            <a
              key={index}
              href={`http://localhost:3000/${attachment}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', marginTop: '5px' }}
            >
              {attachment.split(/[/\\]/).pop()}
            </a>
          ))}
        </div>
      )}
    </Box>
  );
}
