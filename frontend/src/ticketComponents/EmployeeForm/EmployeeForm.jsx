import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import axios from 'axios';

const EmployeeForm = ({ employee, onSave, onClose, departments, designations }) => {
  const permissionsList = [
    'VIEW_SELF_CREATED_TICKETS',
    'VIEW_DEPARTMENT_CREATED_TICKETS',
    'VIEW_DEPARTMENT_ASSIGNED_TICKETS',
    'VIEW_ALL_TICKETS',
    'VIEW_ASSIGNED_TICKETS',
    'CHANGE_TICKET_STATUS',
    'CHANGE_TICKET_ASSIGNEE',
    'GET_AND_RELEASE_TICKET',
    'REOPEN_TICKET',
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    whatsapp_no: '',
    company_name: '',
    roles: [{ department_id: '', designation_id: '' }],
    permissions: Array(permissionsList.length).fill(false), // Array of booleans for permissions
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        contact: employee.contact,
        whatsapp_no: employee.whatsapp_no,
        company_name: employee.company_name,
        roles: employee.roles || [{ department_id: '', designation_id: '' }],
        permissions: employee.permissions || Array(permissionsList.length).fill(false),
      });
    }
  }, [employee]);

  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...formData.roles];
    updatedRoles[index][field] = value;
    setFormData({ ...formData, roles: updatedRoles });
  };

  const addRole = () => {
    setFormData({
      ...formData,
      roles: [...formData.roles, { department_id: '', designation_id: '' }],
    });
  };

  const removeRole = (index) => {
    const updatedRoles = formData.roles.filter((_, i) => i !== index);
    setFormData({ ...formData, roles: updatedRoles });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (index) => {
    const updatedPermissions = [...formData.permissions];
    updatedPermissions[index] = !updatedPermissions[index]; // Toggle permission
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleSubmit = async () => {
    try {
      // Convert permissions array to a concatenated string of 0s and 1s
      const permissionsString = formData.permissions.map((val) => (val ? '1' : '0')).join('');
      const dataToSubmit = { ...formData, permissions: permissionsString };

      if (employee?.id) {
        await axios.put(`http://localhost:3000/employee/updateEmployee/${employee.id}`, dataToSubmit);
      } else {
        await axios.post('http://localhost:3000/employee/createEmployee', dataToSubmit);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('An error occurred while saving the employee.');
    }
  };

  return (
    <Box p={3}>
      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Contact"
        name="contact"
        value={formData.contact}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="WhatsApp Number"
        name="whatsapp_no"
        value={formData.whatsapp_no}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Company Name"
        name="company_name"
        value={formData.company_name}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      {/* Dynamically adding multiple roles */}
      {formData.roles.map((role, index) => (
        <Grid container spacing={2} alignItems="center" key={index}>
          <Grid item xs={5}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select
                name="department_id"
                value={role.department_id}
                onChange={(e) => handleRoleChange(index, 'department_id', e.target.value)}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Designation</InputLabel>
              <Select
                name="designation_id"
                value={role.designation_id}
                onChange={(e) => handleRoleChange(index, 'designation_id', e.target.value)}
              >
                {designations.map((desig) => (
                  <MenuItem key={desig.id} value={desig.id}>
                    {desig.designation}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            {index === 0 ? (
              <IconButton onClick={addRole} color="primary">
                <AddCircleOutline />
              </IconButton>
            ) : (
              <IconButton onClick={() => removeRole(index)} color="secondary">
                <RemoveCircleOutline />
              </IconButton>
            )}
          </Grid>
        </Grid>
      ))}

      {/* Permissions Checkboxes */}
      <Box mt={3}>
  <InputLabel sx={{ fontWeight: 'bold', mb: 2 }}>Permissions</InputLabel>
  <Grid container spacing={3}> {/* Increased spacing between items */}
    {permissionsList.map((permission, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}> {/* Responsive layout */}
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.permissions[index]}
              onChange={() => handlePermissionChange(index)}
              sx={{ color: '#4CAF50' }} // Theme color
            />
          }
          label={permission.replace(/_/g, ' ')} // Replace underscores for better readability
          sx={{
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            width: '100%',
          }}
        />
      </Grid>
    ))}
  </Grid>
</Box>



      <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '16px' }}>
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

export default EmployeeForm;
