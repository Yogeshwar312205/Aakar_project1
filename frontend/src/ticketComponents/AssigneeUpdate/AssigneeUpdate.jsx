import React, { useState, useContext, useEffect } from 'react';



import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import axios from 'axios';

import {
  Typography, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@mui/material';
import {
  Box, Checkbox, FormControlLabel, FormGroup, TextField
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UserContext from "../context/UserContext"; // Import UserContext


const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    backgroundColor: theme.palette.background.paper,
    padding: '4px 8px',
    borderRadius: 4,
    border: `1px solid ${theme.palette.grey[300]}`,
    fontSize: '0.8rem',
    '&:focus': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

function AssigneeUpdate({ ticketId, assigneeOptions, currentAssignee, onUpdate }) {

  const { user } = useContext(UserContext); // Access user from context
  const { currentRole } = useContext(UserContext); // Access user from context


  const [row, setRow] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(currentAssignee || '');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [assigneeOptionsState, setAssigneeOptionsState] = useState([]);
  const [formDescription, setFormDescription] = useState('');
  const [pendingAssigneeChange, setPendingAssigneeChange] = useState(null); // To store ticketId and assignee
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false);
  const [emailOptions, setEmailOptions] = useState({
    owner: false,
    manager: false
  });


  const handleUpdateClick = async () => {
    const assigneeResponse = await axios.get(`http://localhost:3000/employee/employees/department/${row.department}`);
    setAssigneeOptionsState(assigneeResponse.data);
    setShowDropdown(!showDropdown);
  };



  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/tickets/tickets/${ticketId}`);

        setRow(response.data);

      } catch (error) {
        console.error('Error fetching ticket data:', error);
      }
    };

    if (ticketId) {
      fetchTicketData();
    }
  }, [ticketId]);

  // const handleAssigneeChange = (event) => {
  //   setSelectedAssignee(event.target.value);
  // };

  // const handleUpdateSubmit = async () => {
  //   if (selectedAssignee === currentAssignee) {
  //     setSnackbarMessage('Please select a different assignee.');
  //     setSnackbarOpen(true);
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     await axios.put(`http://localhost:3000/tickets/tickets/${ticketId}/assignee`, { assignee: selectedAssignee });
  //     // onUpdate(selectedAssignee); // Call the parent callback to update UI
  //     setSnackbarMessage('Assignee updated successfully.');
  //     setShowDropdown(false);
  //   } catch (error) {
  //     setSnackbarMessage('Error updating assignee.');
  //     console.error('Error updating assignee:', error);
  //   } finally {
  //     setLoading(false);
  //     setSnackbarOpen(true);
  //   }
  // };

  const handleCancel = () => {
    setShowDropdown(false);
    setSelectedAssignee(currentAssignee);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  const handleAssigneeChange = (ticketId, newAssignee, onUpdate={}) => {
    const currentAssignee = row.assignee || '';
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
        onUpdate(Date.now());
        
      }
      setRow({...row,assignee:newAssignee});
      setSnackbarMessage('Assignee updated successfully.');
      setShowDropdown(false);



    } catch (err) {
      setSnackbarMessage('Error updating assignee.');
      console.error('Error updating assignee:', error);
    }finally {
          setLoading(false);
          setSnackbarOpen(true);
          handleCloseAssigneeDialog();
        }

    
    
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










  return (
    <div>
      {showDropdown ? (
        <>
          {row.assignee ? (
            <>
              {/* Show the "Release Ticket" button if the current role is "Assignee" and the ticket has an assignee */}
              {user.permissions.charAt(7) ==='1' ? (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => handleAssigneeChange(row.id, '')} // Set the assignee to null (or empty string) to unassign
                  style={{ marginLeft: '10px' }}
                >
                  Release Ticket
                </Button>
              ) : (
                <StyledSelect
                  value={row.assignee}
                  onChange={(event) => handleAssigneeChange(row.id, event.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Assignee' }}
                >
                  {assigneeOptionsState.map((option, index) => (
                    user.permissions.charAt(6) ==='1' || row.assignee === option.name ? (
                      <MenuItem key={index} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ) : null
                  ))}
                </StyledSelect>
              )}
            </>
          ) : (
            // If there is no assignee and the current role is 'Assignee', show the "Get Assigned" button
            user.permissions.charAt(7) ==='1' ? (
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
                  user.permissions.charAt(6) ==='1' || row.assignee === option.name ? (
                    <MenuItem key={index} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ) : null
                ))}
              </StyledSelect>
            )
          )}
          &nbsp;&nbsp;&nbsp;
          <Button variant="outlined" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
        </>
      ) : (
        <Button variant="contained" onClick={handleUpdateClick} disabled={loading}>
          Update Assignee
        </Button>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />


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
    </div>
  );
}

export default AssigneeUpdate;
 