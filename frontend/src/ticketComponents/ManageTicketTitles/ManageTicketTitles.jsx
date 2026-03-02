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
import TicketTitleForm from '../TicketTitleForm/TicketTitleForm';
import { IoArrowBackCircleOutline } from 'react-icons/io5'; // Import back arrow icon
import { IoIosAddCircleOutline } from 'react-icons/io'; // Import add icon
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation

const ManageTicketTitles = () => {
  const [ticketTitles, setTicketTitles] = useState([]);
  const [editTitle, setEditTitle] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // State for confirmation dialog
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    fetchTicketTitles();
  }, []);

  const fetchTicketTitles = async () => {
    try {
      const response = await axios.get('http://localhost:3000/ticketTitles/ticket_titles');
      setTicketTitles(response.data);
    } catch (error) {
      console.error('Error fetching ticket titles:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/ticketTitles/ticket_titles/${id}`);
      fetchTicketTitles();
    } catch (error) {
      console.error('Error deleting ticket title:', error);
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
            / Manage Ticket Titles
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditTitle({})}
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
          Add New Ticket Title
        </Button>
      </Box>

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
              <TableCell style={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Issue Type</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Ticket Title</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ticketTitles.map((title) => (
              <TableRow key={title.id} hover>
                <TableCell>{title.id}</TableCell>
                <TableCell>{title.issue_type}</TableCell>
                <TableCell>{title.title}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => setEditTitle(title)}
                    color="primary"
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => setConfirmDelete(title.id)}
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
          Are you sure you want to delete this ticket title?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editTitle} onClose={() => setEditTitle(null)} maxWidth="sm" fullWidth>
        <TicketTitleForm
          title={editTitle}
          onSave={fetchTicketTitles}
          onClose={() => setEditTitle(null)}
        />
      </Dialog>
    </Box>
  );
};

export default ManageTicketTitles;