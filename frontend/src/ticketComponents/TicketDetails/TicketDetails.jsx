import React, { useState } from 'react';
import {
  Typography, Button, TextField, Accordion, AccordionSummary, AccordionDetails, Table, TableHead, TableRow, TableBody, TableCell
} from '@mui/material';
import { styled } from '@mui/system';
import PropTypes from 'prop-types';
import StatusUpdate from '../StatusUpdate/StatusUpdate.jsx';
import AssigneeUpdate from '../AssigneeUpdate/AssigneeUpdate.jsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AccordionContainer = styled(Accordion)(({ theme }) => ({
  marginTop: '16px',
  backgroundColor: '#ffffff',
  border: `1px solid #d0d0d0`,
}));

const HistoryTableCell = styled(TableCell)(({ theme }) => ({
  padding: '8px',
  fontSize: '0.875rem',
}));

const ButtonRow = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '16px',
}));

const TicketDetails = ({ ticket, historyData, statusOptions, assigneeOptions, onUpdateStatus, onUpdateAssignee }) => {
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const handleNewMessageClick = () => {
    setShowMessageInput(!showMessageInput);
  };

  const handleSendMessage = () => {
    console.log('Message sent:', newMessage);
    setNewMessage('');
  };

  const renderHistoryAccordion = (history) => (
    <AccordionContainer>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Typography variant="h6">History</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Table size="small">
          <TableHead>
            <TableRow>
              <HistoryTableCell>Assignee ID</HistoryTableCell>
              <HistoryTableCell>Assignee Name</HistoryTableCell>
              <HistoryTableCell>Assigned At</HistoryTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history && history.length > 0 ? (
              history.map((entry, index) => (
                <TableRow key={index}>
                  <HistoryTableCell>{entry.assignee_id}</HistoryTableCell>
                  <HistoryTableCell>{entry.assignee_name}</HistoryTableCell>
                  <HistoryTableCell>{new Date(entry.assigned_at).toLocaleString()}</HistoryTableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <HistoryTableCell colSpan={3}>
                  <Typography variant="body2" align="center">No history available.</Typography>
                </HistoryTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </AccordionDetails>
    </AccordionContainer>
  );

  return (
    <div style={{ padding: '16px' }}>
      {renderHistoryAccordion(historyData || [])}

      <ButtonRow>
        {/* Status Update Component */}
        <StatusUpdate
          ticketId={ticket.id} // Passing the ticketId prop
          currentStatus={ticket.status} // Passing the current status
          onUpdate={onUpdateStatus} // Handling the update
        />

        {/* Assignee Update Component */}
        <AssigneeUpdate
          ticketId={ticket.id} // Passing the ticketId prop
          currentAssignee={ticket.assignee} // Passing the current assignee
          assigneeOptions={assigneeOptions} // Passing the assignee options
          onUpdate={onUpdateAssignee} // Handling the update
        />
      </ButtonRow>

      <Typography variant="h6" style={{ marginTop: '16px' }}>
        Message Details
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleNewMessageClick}
        style={{ marginTop: '8px' }}
      >
        {showMessageInput ? 'Cancel' : 'New Message'}
      </Button>

      {showMessageInput && (
        <div style={{ marginTop: '16px' }}>
          <TextField
            label="Enter your message"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ marginBottom: '8px' }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSendMessage}
          >
            Send Message
          </Button>
        </div>
      )}
    </div>
  );
};

TicketDetails.propTypes = {
  ticket: PropTypes.object.isRequired,
  historyData: PropTypes.array.isRequired,
  statusOptions: PropTypes.array.isRequired,
  assigneeOptions: PropTypes.array.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  onUpdateAssignee: PropTypes.func.isRequired,
};

export default TicketDetails;
