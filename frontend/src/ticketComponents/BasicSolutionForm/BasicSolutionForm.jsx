import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Autocomplete } from '@mui/material';
import axios from 'axios';

const BasicSolutionForm = ({ solution, onSave, onClose }) => {
  const [formData, setFormData] = useState({ issue: '', solution: '' });
  const [issueTypes, setIssueTypes] = useState([]);

  useEffect(() => {
    // Fetch the list of issue types when the form is opened
    const fetchIssueTypes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/issue_type/issue_types');
        setIssueTypes(response.data);
      } catch (error) {
        console.error('Error fetching issue types:', error);
      }
    };

    fetchIssueTypes();

    // Set the form data when the solution prop changes (i.e., when editing)
    if (solution) {
      setFormData({ 
        issue: solution.issue_type, // Ensure this matches the data structure returned from the API
        solution: solution.solution 
      });
    }
  }, [solution]); // Run effect when solution changes

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutocompleteChange = (event, newValue) => {
    setFormData({ ...formData, issue: newValue });
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        // If there's an ID, update the existing basic solution
        await axios.put(`http://localhost:3000/basicSolutions/basic_solutions/${formData.id}`, formData);
      } else {
        // Otherwise, create a new basic solution
        await axios.post('http://localhost:3000/basicSolutions/basic_solutions', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving basic solution:', error);
      alert('An error occurred while saving the solution. Please check your inputs.');
    }
  };

  return (
    <Box p={3}>
      <Autocomplete
        freeSolo
        options={issueTypes.map((type) => type.issue)} // Assuming type.issue returns the string for the issue
        value={formData.issue} // Correctly set value from formData
        onChange={handleAutocompleteChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Issue Type"
            margin="normal"
            name="issue"
            fullWidth
          />
        )}
      />
      <TextField
        label="Solution"
        name="solution"
        value={formData.solution}
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

export default BasicSolutionForm;
