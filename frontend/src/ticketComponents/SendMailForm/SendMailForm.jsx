import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import axios from 'axios';

const SendMailToForm = ({ entry, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    event: '',
    sendTo: '00000',
  });

  // Roles correspond to bits in sendTo: Admin, HOD, ticketCreatedBy, ticketAssignedTo, assigneesOfTheDepartment
  const roles = ['Admin', 'HOD', 'ticketCreatedBy', 'ticketAssignedTo', 'assigneesOfTheDepartment'];
  const [checkedRoles, setCheckedRoles] = useState([false, false, false, false, false]);

  useEffect(() => {
    if (entry) {
      const sendToBits = entry.sendTo.split('').map(bit => bit === '1');
      setFormData({ event: entry.event, sendTo: entry.sendTo });
      setCheckedRoles(sendToBits);
    }
  }, [entry]);

  const handleCheckboxChange = (index) => {
    const updatedCheckedRoles = [...checkedRoles];
    updatedCheckedRoles[index] = !updatedCheckedRoles[index];
    setCheckedRoles(updatedCheckedRoles);

    const updatedSendTo = updatedCheckedRoles.map(checked => (checked ? '1' : '0')).join('');
    setFormData({ ...formData, sendTo: updatedSendTo });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (entry?.id) {
        // Update existing entry
        await axios.put(`http://localhost:3000/sendMailTo/sendMailTo/${entry.id}`, formData);
      } else {
        // Create new entry
        await axios.post('http://localhost:3000/sendMailTo/sendMailTo', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('An error occurred while saving the entry. Please check your inputs.');
    }
  };

  return (
    <Box p={3}>
      <TextField
        label="Event"
        name="event"
        value={formData.event}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      
      <FormGroup>
        {roles.map((role, index) => (
          <FormControlLabel
            key={role}
            control={
              <Checkbox
                checked={checkedRoles[index]}
                onChange={() => handleCheckboxChange(index)}
              />
            }
            label={role}
          />
        ))}
      </FormGroup>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSubmit}
        style={{ marginTop: '16px' }}
      >
        Save
      </Button>
      <Button 
        variant="outlined" 
        color="secondary" 
        onClick={onClose} 
        style={{ marginTop: '16px', marginLeft: '8px' }}
      >
        Cancel
      </Button>
    </Box>
  );
};

export default SendMailToForm;
