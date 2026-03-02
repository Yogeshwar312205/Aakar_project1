import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Autocomplete } from '@mui/material';
import axios from 'axios';

const TicketTitleForm = ({ title, onSave, onClose }) => {
  const [formData, setFormData] = useState(title || { issue_type: '', title: '' });
  const [issueTypes, setIssueTypes] = useState([]);

  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/issue_type/issue_types');
        setIssueTypes(response.data);
      } catch (error) {
        console.error('Error fetching issue types:', error);
      }
    };

    fetchIssueTypes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutocompleteChange = (event, newValue) => {
    setFormData({ ...formData, issue_type: newValue });
  };

  const handleSubmit = async () => {
    const { title, issue_type } = formData; // Destructure the required fields
    console.log('Submitting form data:', { issue: issue_type, title }); // Log the data being submitted
    try {
      if (formData.id) {
        await axios.put(`http://localhost:3000/ticketTitles/ticket_titles/${formData.id}`, { issue: issue_type, title });
      } else {
        await axios.post('http://localhost:3000/ticketTitles/ticket_titles', { issue: issue_type, title });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving ticket title:', error);
    }
  };

  return (
    <Box p={3}>
      <Autocomplete
        freeSolo
        options={issueTypes.map((type) => type.issue)}
        value={formData.issue_type}
        onChange={handleAutocompleteChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Issue Type"
            margin="normal"
            name="issue_type"
            fullWidth
          />
        )}
      />
      <TextField
        label="Ticket Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
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

export default TicketTitleForm;
