import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Autocomplete } from '@mui/material';
import axios from 'axios';

const IssueTypeForm = ({ issueType, onSave, onClose }) => {
  const [formData, setFormData] = useState(issueType || { department_name: '', issue: '' });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Fetch the list of departments when the form is opened
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:3000/department/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutocompleteChange = (event, newValue) => {
    setFormData({ ...formData, department_name: newValue });
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        // If there's an ID, update the existing issue type
        await axios.put(`http://localhost:3000/issue_type/issue_types/${formData.id}`, formData);
      } else {
        // Otherwise, create a new issue type
        await axios.post('http://localhost:3000/issue_type/issue_types', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving issue type:', error);
    }
  };

  return (
    <Box p={3}>
      <Autocomplete
        freeSolo
        options={departments.map((dept) => dept.departmentName)}
        value={formData.department_name}
        onChange={handleAutocompleteChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Department"
            margin="normal"
            name="department_name"
            fullWidth
          />
        )}
      />
      <TextField
        label="Issue"
        name="issue"
        value={formData.issue}
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

export default IssueTypeForm;
