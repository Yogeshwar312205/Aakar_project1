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
import SendMailToForm from '../SendMailForm/SendMailForm';
import { IoArrowBackCircleOutline } from 'react-icons/io5'; // Import back arrow icon
import { IoIosAddCircleOutline } from 'react-icons/io'; // Import add icon
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation

const ManageSendMailTo = () => {
  const [sendMailEntries, setSendMailEntries] = useState([]);
  const [editEntry, setEditEntry] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // State for confirmation dialog
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    fetchSendMailEntries();
  }, []);

  const fetchSendMailEntries = async () => {
    try {
      const response = await axios.get('http://localhost:3000/sendMailTo/sendMailTo');
      setSendMailEntries(response.data.data);
    } catch (error) {
      console.error('Error fetching send mail entries:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/sendMailTo/sendMailTo/${id}`);
      fetchSendMailEntries();
    } catch (error) {
      console.error('Error deleting send mail entry:', error);
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
            / Manage Send Email To
          </Typography>
        </Box>
        {/* <Button
          variant="contained"
          color="primary"
          onClick={() => setEditEntry({})}
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
          Add New Send Mail Entry
        </Button> */}
      </Box>

      {/* Table for send mail entries */}
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
              <TableCell style={{ fontWeight: 'bold' }}>Event</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Send To</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sendMailEntries.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>{entry.id}</TableCell>
                <TableCell>{entry.event}</TableCell>
                <TableCell>{parseSendToBits(entry.sendTo)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => setEditEntry(entry)}
                    color="primary"
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => setConfirmDelete(entry.id)}
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
          Are you sure you want to delete this send mail entry?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding/editing an entry */}
      <Dialog open={!!editEntry} onClose={() => setEditEntry(null)} maxWidth="sm" fullWidth>
        <SendMailToForm
          entry={editEntry}
          onSave={fetchSendMailEntries}
          onClose={() => setEditEntry(null)}
        />
      </Dialog>
    </Box>
  );
};

// Helper function to map the sendTo bits to role names
const parseSendToBits = (sendTo) => {
  const roles = ['Admin', 'HOD', 'ticketCreatedBy', 'ticketAssignedTo', 'assigneesOfTheDepartment'];
  return sendTo.split('')
    .map((bit, index) => (bit === '1' ? roles[index] : null))
    .filter(role => role !== null)
    .join(', ');
};

export default ManageSendMailTo;