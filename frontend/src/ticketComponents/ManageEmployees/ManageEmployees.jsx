import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Paper,
  TableContainer,
  Link,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import EmployeeForm from '../EmployeeForm/EmployeeForm';
import { IoArrowBackCircleOutline } from 'react-icons/io5'; // Import back arrow icon
import { IoIosAddCircleOutline } from 'react-icons/io'; // Import add icon
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [editEmployee, setEditEmployee] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // State for confirmation dialog
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3000/employee/detailedEmployees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/department/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await axios.get('http://localhost:3000/designation/designations');
      setDesignations(response.data);
    } catch (error) {
      console.error('Error fetching designations:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/employee/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleDeleteConfirm = () => {
    if (confirmDelete) {
      handleDelete(confirmDelete);
      setConfirmDelete(null); // Close the dialog after confirming
    }
  };

  // Define common styles for the links
  const commonLinkStyles = {
    color: '#A3A3A3',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textDecoration: 'none',
  };

  return (
    <Box p={{ xs: '8px', sm: '16px' }} sx={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Breadcrumbs */}
      <Box display="flex" alignItems="center" mb={2}>
        <IoArrowBackCircleOutline
          style={{ fontSize: '2rem', color: '#0061A1', cursor: 'pointer' }}
          onClick={() => window.history.back()}
        />
        <Box display="flex" alignItems="center" ml={2}>
          <Link
            component="button"
            onClick={() => navigate('/dashboard')}
            sx={commonLinkStyles}
          >
            Dashboard
          </Link>
          <Link
            component="button"
            onClick={() => window.history.back()}
            sx={{ color: '#A3A3A3', fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none', mx: 1 }}
          >
            / Admin Functionalities
          </Link>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black', fontSize: '1.25rem' }}>
            / Manage Employees
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditEmployee({})}
          sx={{
            backgroundColor: '#0061A1',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: '#004d80', // Darken the button on hover
            },
          }}
        >
          <IoIosAddCircleOutline style={{ marginRight: '8px', fontSize: '1.5rem' }} />
          Add New Employee
        </Button>
      </Box>

      {/* Table for employees */}
      <TableContainer
        component={Paper}
        elevation={3}
        sx={{
          maxHeight: '600px', // Scrollable height
          overflow: 'auto',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow style={{ backgroundColor: '#f5f5f5' }}>
              <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Company Name</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Roles</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.contact}</TableCell>
                <TableCell>{employee.company_name}</TableCell>
                <TableCell>
                  {employee.roles.map((role, index) => (
                    <div key={index}>
                      {role.department} - {role.designation}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => setEditEmployee(employee)}
                    color="primary"
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => setConfirmDelete(employee.id)}
                    color="secondary"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogContent>
          Are you sure you want to delete this employee?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding/editing an employee */}
      <Dialog open={!!editEmployee} onClose={() => setEditEmployee(null)} maxWidth="sm" fullWidth>
        <EmployeeForm
          employee={editEmployee}
          onSave={fetchEmployees}
          onClose={() => setEditEmployee(null)}
          departments={departments}
          designations={designations}
        />
      </Dialog>
    </Box>
  );
};

export default ManageEmployees;