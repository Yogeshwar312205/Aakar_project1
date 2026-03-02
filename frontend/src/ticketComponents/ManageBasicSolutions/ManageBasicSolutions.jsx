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
import BasicSolutionForm from '../BasicSolutionForm/BasicSolutionForm';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation

const ManageBasicSolutions = () => {
  const [basicSolutions, setBasicSolutions] = useState([]);
  const [editSolution, setEditSolution] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // State for deletion confirmation
  const navigate = useNavigate(); // Using navigate for routing

  useEffect(() => {
    fetchBasicSolutions();
  }, []);

  const fetchBasicSolutions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/basicSolutions/basic_solutions');
      setBasicSolutions(response.data);
    } catch (error) {
      console.error('Error fetching basic solutions:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/basicSolutions/basic_solutions/${id}`);
      fetchBasicSolutions();
    } catch (error) {
      console.error('Error deleting basic solution:', error);
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
            / Manage Basic Solutions
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditSolution({})}
          sx={{
            backgroundColor: '#0061A1',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: '#004d80',
            },
          }}
        >
          <IoIosAddCircleOutline style={{ marginRight: '8px', fontSize: '1.5rem' }} />
          Add New Basic Solution
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        elevation={3}
        sx={{
          maxHeight: '600px',
          overflow: 'auto',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow style={{ backgroundColor: '#f5f5f5' }}>
              <TableCell style={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Issue Type</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Solution</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {basicSolutions.map((solution) => (
              <TableRow key={solution.id} hover>
                <TableCell>{solution.id}</TableCell>
                <TableCell>{solution.issue_type}</TableCell>
                <TableCell>{solution.solution}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => setEditSolution(solution)}
                    color="primary"
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => setConfirmDelete(solution.id)}
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
          Are you sure you want to delete this basic solution?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editSolution} onClose={() => setEditSolution(null)} maxWidth="sm" fullWidth>
        <BasicSolutionForm
          solution={editSolution}
          onSave={fetchBasicSolutions}
          onClose={() => setEditSolution(null)}
        />
      </Dialog>
    </Box>
  );
};

export default ManageBasicSolutions;