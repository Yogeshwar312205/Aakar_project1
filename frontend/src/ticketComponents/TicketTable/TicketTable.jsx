import React, { useState, useCallback, useContext } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@mui/material';
import {
  Box, Checkbox, FormControlLabel, FormGroup, TextField
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import UserContext from "../context/UserContext.jsx"; // Import UserContext
import { styled } from '@mui/system';
import axios from 'axios';
import debounce from 'lodash/debounce';
import TicketDetails from '../Css/TicketDetails/TicketDetails2.jsx';
// import AssigneeUpdate from '../Css/AssigneeUpdate/AssigneeUpdate2.jsx';
import { FiExternalLink } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

const StyledTableCell = styled(TableCell)({
  fontWeight: 'bold',
  backgroundColor: '#f1f1f1',
  borderBottom: `2px solid #d0d0d0`,
  color: '#333',
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

const StatusChip = styled('div')(({ status }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '12px',
  color: '#fff',
  backgroundColor: status === 'open' ? '#4caf50' :
    status === 'close' ? '#f44336' :
      status === 'hold' ? '#ffeb3b' :
        status === 'pending' ? '#2196f3' : '#4caf50',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  textAlign: 'center',
  minWidth: '60px',
}));

const StyledTableRow = styled(TableRow)(({ expanded }) => ({
  cursor: 'pointer',
  position: 'relative',
  backgroundColor: expanded ? '#EEF7FF' : 'inherit',
  '&:hover': {
    backgroundColor: expanded ? '#EEF7FF' : '#f5f5f5',
  },
}));

const ExpandedRow = styled(TableRow)({
  backgroundColor: '#EEF7FF',
});

const ExternalLinkIcon = styled(FiExternalLink)({
  position: 'absolute',
  right: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  opacity: 0,
  transition: 'opacity 0.3s',
  fontSize: '20px',
  color: '#0061A1',
});

const StyledSelect = styled(Select)({
  '& .MuiSelect-select': {
    backgroundColor: '#fff',
    padding: '4px 8px',
    borderRadius: 4,
    border: `1px solid #ccc`,
    fontSize: '0.8rem',
    '&:focus': {
      borderColor: '#0061A1',
    },
  },
});


const getStatusColor = (status) => {
  switch (status) {
    case 'open':
      return '#4caf50'; // Green
    case 'close':
      return '#f44336'; // Red
    case 'hold':
      return '#ffeb3b'; // Yellow
    case 'pending':
      return '#2196f3'; // Blue
    case 'reopened':
      return '#0061A1'; // Dark Blue
    default:
      return '#4caf50'; // Default Green
  }
};


const TicketTable = ({
  tickets = [],
  statusOptions = [],
  assigneeOptions = [],
  onUpdateStatus = () => { },
  onUpdateAssignee = () => { },
  onTicketUpdate = () => { }
}) => {
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const { user } = useContext(UserContext); // Access user from context
  const { currentRole } = useContext(UserContext); // Access user from context
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [assigneeOptionsState, setAssigneeOptionsState] = useState([]);
  const [status, setStatus] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null); // To store ticketId and status
  const [formDescription, setFormDescription] = useState('');
  const [pendingAssigneeChange, setPendingAssigneeChange] = useState(null); // To store ticketId and assignee
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false);


  const [emailOptions, setEmailOptions] = useState({
    owner: false,
    manager: false
  });




  const handleAssigneeChange = (ticketId, newAssignee) => {
    const currentAssignee = tickets.find(ticket => ticket.id === ticketId)?.assignee || '';
    setPendingAssigneeChange({ ticketId, newAssignee, currentAssignee });
    setFormDescription(''); // Optionally reset the form description
    setEmailOptions({ owner: false, manager: false }); // Reset the email options to unchecked
    setIsAssigneeDialogOpen(true); // Open assignee change dialog
  };



  const handleConfirmAssigneeChange = async () => {
    const { ticketId, newAssignee, currentAssignee } = pendingAssigneeChange;

    // Prepare the payload for the assignee history update
    const assigneeChangePayload = {
      ticket_id: ticketId,
      changed_by: user.id,
      old_assignee: currentAssignee,
      new_assignee: newAssignee,
      change_reason: formDescription,
      email_sent_to_owner: emailOptions.owner,
      email_sent_to_manager: emailOptions.manager // Add email options to the payload
    };

    try {
      // Update the assignee in the tickets table
      const response = await axios.put(`http://localhost:3000/tickets/tickets/${ticketId}/assignee`, { assignee: newAssignee });

      // Add the assignee change to the ticket_assignee_history table
      await axios.post('http://localhost:3000/ticketAssigneeHistory/assignee-history', assigneeChangePayload);

      console.log('Assignee updated successfully to:', newAssignee);
      if (response.status === 200) {
        console.log(response.data);
        onTicketUpdate(response.data.ticket); // Pass the updated ticket to the parent
      }


    } catch (err) {
      console.error('Error updating assignee:', err);
    }

    // Close the dialog and reset state
    handleCloseAssigneeDialog();
  };



  const handleCloseAssigneeDialog = () => {
    setIsAssigneeDialogOpen(false);
    setPendingAssigneeChange(null);
  };


  // Handler for checkbox changes
  const handleEmailOptionChange = (event) => {
    setEmailOptions({
      ...emailOptions,
      [event.target.name]: event.target.checked
    });
  };

  const handleRowClick = async (ticketId, department) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
      setHistoryData({});
      setAssigneeOptionsState([]);
    } else {
      setExpandedTicketId(ticketId);
      try {
        const historyResponse = await axios.get(`http://localhost:3000/ticketAssigneeHistory/assignee-history/${ticketId}`);
        setHistoryData({ [ticketId]: historyResponse.data });

        const assigneeResponse = await axios.get(`http://localhost:3000/employee/employees/department/${department}`);
        setAssigneeOptionsState(assigneeResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  const debouncedHandleMouseOver = useCallback(
    debounce(async (ticketId, department) => {
      setHoveredRowId(ticketId);
      try {
        const assigneeResponse = await axios.get(`http://localhost:3000/employee/employees/department/${department}`);
        setAssigneeOptionsState(assigneeResponse.data);
      } catch (error) {
        console.error('Error fetching assignee options on mouse over:', error);
      }
    }, 300), // 300ms debounce delay
    []
  );

  const handleMouseOver = (ticketId, department) => {
    if (ticketId && department) {  // Ensure both ticketId and department are valid
      debouncedHandleMouseOver(ticketId, department);
    }
  };

  const handleMouseOut = () => setHoveredRowId(null);

  // Open dialog before status change
  const handleStatusChange = (ticketId, event) => {
    const newStatus = event.target.value;

    // Find the current ticket to get its status
    const currentTicket = tickets.find(ticket => ticket.id === ticketId);
    const currentStatus = currentTicket ? currentTicket.status : '';

    // Reset the dialog states
    setFormDescription(''); // Clear the description
    setEmailOptions({ owner: false, manager: false }); // Reset the email options to unchecked

    setPendingStatusChange({ ticketId, newStatus, currentStatus }); // Include currentStatus
    setIsStatusDialogOpen(true); // Open status change dialog
  };


  // Confirm the status change in the dialog
  const handleConfirmStatusChange = async () => {
    const { ticketId, newStatus, currentStatus } = pendingStatusChange;

    // Prepare the payload for the status history update
    const statusChangePayload = {
      ticket_id: ticketId,
      changed_by: user.id,
      old_status: currentStatus,
      new_status: newStatus,
      status_change_reason: formDescription,
      email_sent_to_owner: emailOptions.owner,
      email_sent_to_manager: emailOptions.manager
    };

    try {
      // Update the status in the tickets table
      const response = await axios.put(`http://localhost:3000/tickets/tickets/${ticketId}/status`, { status: newStatus });


      // Add the status change to the ticket_status_history table
      await axios.put('http://localhost:3000/ticketStatusHistory/status-history', statusChangePayload);

      if (response.status === 200) {
        console.log(response.data);
        onTicketUpdate(response.data.ticket); // Pass the updated ticket to the parent
      }

      console.log('Status updated successfully to:', newStatus);

      // Optional: Refresh ticket data or handle success UI feedback
    } catch (err) {
      console.error('Error updating status:', err);
    }

    // Close the dialog and reset state
    setIsStatusDialogOpen(false); // Correct state change
    setPendingStatusChange(null);
  };


  const handleCloseStatusDialog = () => {
    setIsStatusDialogOpen(false);
    setPendingStatusChange(null); // Reset pending status change
  };






  return (
    <>
      <TableContainer component={Paper} style={{ margin: '20px', maxHeight: '600px' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>Sr. No.</StyledTableCell>
              <StyledTableCell>Ticket ID</StyledTableCell>
              <StyledTableCell>Priority</StyledTableCell>
              <StyledTableCell>Description</StyledTableCell>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Time</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Department</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Assigned To</StyledTableCell>
              <StyledTableCell></StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.length > 0 ? (
              tickets.map((row, index) => (
                <React.Fragment key={row.id}>
                  <StyledTableRow
                    expanded={expandedTicketId === row.id}
                    onClick={() => handleRowClick(row.id, row.department)}
                    onMouseOver={() => handleMouseOver(row.id, row.department)}
                    onMouseOut={handleMouseOut}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.priority}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{new Date(row.ticket_created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(row.ticket_created_at).toLocaleTimeString()}</TableCell>
                    <TableCell>{row.issue_type}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>
                      {expandedTicketId === row.id ? (
                        <StyledSelect
                          value={status[row.id] || row.status}
                          onChange={(event) => handleStatusChange(row.id, event)}
                          displayEmpty
                          inputProps={{ 'aria-label': 'Status' }}
                        >
                          {(user.permissions.charAt(5) === '1' && <MenuItem value="open">Open</MenuItem>) || ((row.status === "open") && <MenuItem value="open">Open</MenuItem>)}
                          {(user.permissions.charAt(5) === '1' && <MenuItem value="close">Closed</MenuItem>) || ((row.status === "close") && <MenuItem value="close">Closed</MenuItem>)}
                          {(user.permissions.charAt(5) === '1' && <MenuItem value="hold">Hold</MenuItem>) || ((row.status === "hold") && <MenuItem value="hold">Hold</MenuItem>)}
                          {(user.permissions.charAt(5) === '1' && <MenuItem value="pending">Pending</MenuItem>) || ((row.status === "pending") && <MenuItem value="pending">Pending</MenuItem>)}
                          {user.permissions.charAt(8) === '1' && row.status === 'close' && new Date() - new Date(row.last_status_updated_at) < 3 * 24 * 60 * 60 * 1000 && <MenuItem value="reopened">Reopened</MenuItem>}
                        </StyledSelect>
                      ) : (
                        <StatusChip status={row.status}>{row.status}</StatusChip>
                      )}
                    </TableCell>
                    <TableCell>
                      {expandedTicketId === row.id ? (
                        row.assignee ? (
                          // If there is an assignee, show the dropdown for changing the assignee
                          <>

                            {/* Show the "Release Ticket" button if the current role is "Assignee" and the ticket has an assignee */}
                            {(user.permissions.charAt(7) === '1' && (
                              <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                onClick={() => handleAssigneeChange(row.id, '')} // Set the assignee to null (or empty string) to unassign
                                style={{ marginLeft: '10px' }}
                              >
                                Release Ticket
                              </Button>
                            )) || <StyledSelect
                              value={row.assignee}
                              onChange={(event) => handleAssigneeChange(row.id, event.target.value)}
                              displayEmpty
                              inputProps={{ 'aria-label': 'Assignee' }}
                            >
                                {assigneeOptionsState.map((option, index) => (
                                  (user.permissions.charAt(6) === '1' && <MenuItem key={index} value={option.name}>{option.name}</MenuItem>) ||
                                  (row.assignee === option.name && <MenuItem key={index} value={option.name}>{option.name}</MenuItem>)
                                ))}
                              </StyledSelect>}
                          </>
                        ) : (
                          // If there is no assignee and the current role is 'Assignee', show the "Get Assigned" button
                          user.permissions.charAt(7) === '1' ? (
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => handleAssigneeChange(row.id, user.name)} // Assign the current user
                            >
                              Get Assigned
                            </Button>
                          ) : (
                            // Show the dropdown for other roles (e.g., Admin, HOD) to assign an assignee
                            <StyledSelect
                              value={row.assignee || ''}
                              onChange={(event) => handleAssigneeChange(row.id, event.target.value)}
                              displayEmpty
                              inputProps={{ 'aria-label': 'Assignee' }}
                            >
                              {assigneeOptionsState.map((option, index) => (
                                (user.permissions.charAt(6) === '1' && <MenuItem key={index} value={option.name}>{option.name}</MenuItem>) ||
                                (row.assignee === option.name && <MenuItem key={index} value={option.name}>{option.name}</MenuItem>)
                              ))}
                            </StyledSelect>
                          )
                        )
                      ) : (
                        // Conditionally render "Get Assigned" button or the assignee's name when the row is not expanded
                        row.assignee ? (
                          row.assignee // Display the assignee's name
                        ) : (
                          user.permissions.charAt(7) === '1' && (
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => handleAssigneeChange(row.id, user.name)} // Assign the current user
                            >
                              Get Assigned
                            </Button>
                          )
                        )
                      )}
                    </TableCell>



                    <TableCell>
                      <NavLink to={{
                        pathname: `/ticketPage/${row.id}`
                      }} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <ExternalLinkIcon style={{ opacity: hoveredRowId === row.id ? 1 : 0 }} />
                      </NavLink>
                    </TableCell>
                  </StyledTableRow>

                  {expandedTicketId === row.id && (
                    <ExpandedRow>
                      <TableCell colSpan={10}>
                        <TicketDetails
                          ticket={row} // Pass the whole ticket object
                          historyData={historyData[row.id] || []}
                        />
                      </TableCell>
                    </ExpandedRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10}>
                  <Typography>No tickets available.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isStatusDialogOpen}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>You are attempting to change the status!</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            {/* Dynamic Current Status Button */}
            <Button
              variant="contained"
              disabled
              style={{
                backgroundColor: getStatusColor(pendingStatusChange?.currentStatus),
                color: '#fff',
                marginRight: '10px',
              }}
            >
              {pendingStatusChange?.currentStatus || 'Loading...'}
            </Button>
            <ArrowForwardIcon style={{ color: '#000' }} />
            {/* Dynamic New Status Button */}
            <Button
              variant="contained"
              disabled
              style={{
                backgroundColor: getStatusColor(pendingStatusChange?.newStatus),
                color: '#fff',
                marginLeft: '10px',
              }}
            >
              {pendingStatusChange?.newStatus || 'Loading...'}
            </Button>
          </Box>

          <TextField
            label="Reason for changing the status"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            margin="dense"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <Box mt={2} mb={2}>
            <Typography variant="body1">Send email to</Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={emailOptions.owner}
                    onChange={handleEmailOptionChange}
                    name="owner"
                  />
                }
                label="owner"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={emailOptions.manager}
                    onChange={handleEmailOptionChange}
                    name="manager"
                  />
                }
                label="manager"
              />
            </FormGroup>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseStatusDialog} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmStatusChange} color="primary" variant="contained">
            Change status
          </Button>
        </DialogActions>
      </Dialog>



      <Dialog
        open={isAssigneeDialogOpen}
        onClose={handleCloseAssigneeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Assignee Change</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <Typography variant="body1" style={{ marginRight: '10px' }}>
              Current Assignee:
            </Typography>
            <Typography variant="body1" style={{ marginRight: '20px', fontWeight: 'bold' }}>
              {pendingAssigneeChange?.currentAssignee}
            </Typography>
            <ArrowForwardIcon style={{ color: '#000' }} />
            <Typography variant="body1" style={{ marginLeft: '20px', fontWeight: 'bold' }}>
              {pendingAssigneeChange?.newAssignee}
            </Typography>
          </Box>

          <TextField
            label="Reason for changing the assignee"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            margin="dense"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <Box mt={2} mb={2}>
            <Typography variant="body1">Send email to</Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={emailOptions.owner}
                    onChange={(e) => handleEmailOptionChange(e)}
                    name="owner"
                  />
                }
                label="owner"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={emailOptions.manager}
                    onChange={(e) => handleEmailOptionChange(e)}
                    name="manager"
                  />
                }
                label="manager"
              />
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssigneeDialog} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmAssigneeChange} color="primary" variant="contained">
            Change Assignee
          </Button>
        </DialogActions>
      </Dialog>





    </>
  );
};

export default TicketTable;
