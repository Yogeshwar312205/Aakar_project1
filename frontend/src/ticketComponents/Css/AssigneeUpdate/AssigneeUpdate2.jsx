import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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

function AssigneeUpdate({ ticketId, currentAssignee, assigneeOptions, onUpdate }) {
  const handleAssigneeChange = async (event) => {
    const newAssignee = event.target.value;
    try {
      // Make an API call to update the assignee
      const response = await axios.put(`http://localhost:3000/tickets/tickets/${ticketId}/assignee`, { assignee: newAssignee });

      if (response.status === 200) {
        console.log('Assignee updated successfully to:', newAssignee);
        onUpdate(newAssignee); // Optionally update the parent component's state
      } else {
        console.error('Failed to update assignee:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating assignee:', error);
    }
  };

  return (
    <StyledSelect
      value={currentAssignee}
      onChange={handleAssigneeChange}
      displayEmpty
      inputProps={{ 'aria-label': 'Assignee' }}
    >
      <MenuItem value=""><em>Select assignee</em></MenuItem>
      {assigneeOptions.map((option, index) => (
        <MenuItem key={index} value={option.name}>{option.name}</MenuItem>
      ))}
    </StyledSelect>
  );
}

export default AssigneeUpdate;
