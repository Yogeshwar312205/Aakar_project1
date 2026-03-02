import React, { useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import axios from 'axios';




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

function StatusUpdate({ ticketId, currentStatus }) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);

    setLoading(true);
    setError(null);

    try {
      // Make an API call to update the ticket status
      await axios.put(`http://localhost:3000/tickets/tickets/${ticketId}/status`, { status: newStatus });
      console.log('Status updated successfully to:', newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <StyledSelect
        value={selectedStatus}
        onChange={handleStatusChange}
        displayEmpty
        inputProps={{ 'aria-label': 'Status' }}
      >
        
        <MenuItem value="open">Open</MenuItem>
        <MenuItem value="close">Closed</MenuItem>
        <MenuItem value="hold">Hold</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="reopened">Reopened</MenuItem>
      </StyledSelect>
      {loading && <p>Updating...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default StatusUpdate;
