import React, { useState, useEffect, useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@mui/material';
import {
  Box, Checkbox, FormControlLabel, FormGroup, TextField
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UserContext from "../context/UserContext"; // Import UserContext




const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    backgroundColor: theme.palette.background.paper,
    padding: '4px 8px', // Adjust padding for smaller size
    borderRadius: 4,
    border: `1px solid ${theme.palette.grey[300]}`,
    fontSize: '0.8rem', // Adjust font size for smaller dropdown
    '&:focus': {
      borderColor: theme.palette.primary.main,
    },
  },
}));


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

function StatusUpdate({ ticketId, currentStatus, onUpdate={} }) {

  const { user } = useContext(UserContext); // Access user from context
  const { currentRole } = useContext(UserContext); // Access user from context


  const [row, setRow] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState(null); // To store ticketId and status
  const [formDescription, setFormDescription] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const [emailOptions, setEmailOptions] = useState({
    owner: false,
    manager: false
  });



  const handleEmailOptionChange = (event) => {
    setEmailOptions({
      ...emailOptions,
      [event.target.name]: event.target.checked
    });
  };



  // Open dialog before status change
  const handleStatusChange = (ticketId, event) => {
    const newStatus = event.target.value;

    // Find the current ticket to get its status
    const currentTicket = row;
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
        onUpdate(Date.now());
        // onTicketUpdate(response.data.ticket); // Pass the updated ticket to the parent
      }
      setRow({...row,status:newStatus});
      console.log('Status updated successfully to:', newStatus);

      // Close the dialog and reset state
      setIsStatusDialogOpen(false); // Correct state change
      setPendingStatusChange(null);
      setSnackbarMessage('Status updated successfully.');
      setShowDropdown(false);
      

      // Optional: Refresh ticket data or handle success UI feedback
    } catch (err) {
      setSnackbarMessage('Error updating status.');
      console.error('Error updating status:', err);
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }

    
  };


  const handleCloseStatusDialog = () => {
    setIsStatusDialogOpen(false);
    setPendingStatusChange(null); // Reset pending status change
  };



  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/tickets/tickets/${ticketId}`);
        setSelectedStatus(response.data.status);
        setRow(response.data);
      } catch (error) {
        console.error('Error fetching ticket data:', error);
      }
    };

    if (ticketId) {
      fetchTicketData();
    }
  }, [ticketId]);

  const handleUpdateClick = () => {
    setShowDropdown(!showDropdown);
  };

  // const handleStatusChange = (event) => {
  //   setSelectedStatus(event.target.value);
  // };

  // const handleUpdateSubmit = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     await axios.put(`http://localhost:3000/tickets/tickets/${ticketId}/status`, { status: selectedStatus });

  //     setSnackbarMessage('Status updated successfully.');
  //     setShowDropdown(false);
  //   } catch (err) {
  //     setSnackbarMessage('Error updating status.');
  //     console.error('Error updating status:', err);
  //   } finally {
  //     setLoading(false);
  //     setSnackbarOpen(true);
  //   }
  // };

  const handleCancel = () => {
    setShowDropdown(false);
    setSelectedStatus(currentStatus); // Reset to current status if cancelled
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      {showDropdown ? (
        <>
          {/* <StyledSelect
            value={selectedStatus}
            onChange={handleStatusChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Status' }}
            disabled={loading}
          >
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="close">Closed</MenuItem>
            <MenuItem value="hold">Hold</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="reopened">Reopened</MenuItem>
          </StyledSelect>
          &nbsp;&nbsp;&nbsp;
          <Button
            variant="contained"
            onClick={handleUpdateSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button> */}

          <StyledSelect
            value={status[row.id] || row.status}
            onChange={(event) => handleStatusChange(row.id, event)}
            displayEmpty
            inputProps={{ 'aria-label': 'Status' }}
          >
            {(user.permissions.charAt(5) ==='1' && <MenuItem value="open">Open</MenuItem>) || ((row.status === "open") && <MenuItem value="open">Open</MenuItem>)}
            {(user.permissions.charAt(5) ==='1' && <MenuItem value="close">Closed</MenuItem>) || ((row.status === "close") && <MenuItem value="close">Closed</MenuItem>)}
            {(user.permissions.charAt(5) ==='1' && <MenuItem value="hold">Hold</MenuItem>) || ((row.status === "hold") && <MenuItem value="hold">Hold</MenuItem>)}
            {(user.permissions.charAt(5) ==='1' && <MenuItem value="pending">Pending</MenuItem>) || ((row.status === "pending") && <MenuItem value="pending">Pending</MenuItem>)}
            {user.permissions.charAt(8) ==='1' && row.status === 'close' && <MenuItem value="reopened">Reopened</MenuItem>}
          </StyledSelect>
          &nbsp;&nbsp;&nbsp;
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button variant="contained" onClick={handleUpdateClick} disabled={loading}>
          Update Status
        </Button>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />

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
    </div>
  );
}

export default StatusUpdate;
