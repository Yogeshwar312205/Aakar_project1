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
  Paper,
  TableContainer,
  Snackbar,
  Alert,
  DialogActions,
  DialogContent,
  Link,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import IssueTypeForm from '../IssueTypeForm/IssueTypeForm';

const ManageIssueTypes = () => {
  const [issueTypes, setIssueTypes] = useState([]);
  const [editIssueType, setEditIssueType] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDelete, setConfirmDelete] = useState(null); // State for confirmation dialog
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssueTypes();
  }, []);

  const fetchIssueTypes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/issue_type/issue_types');
      setIssueTypes(response.data);
    } catch (error) {
      console.error('Error fetching issue types:', error);
      setSnackbar({ open: true, message: 'Failed to fetch issue types.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/issue_type/issue_types/${id}`);
      setSnackbar({ open: true, message: 'Issue type deleted successfully!', severity: 'success' });
      fetchIssueTypes();
    } catch (error) {
      console.error('Error deleting issue type:', error);
      setSnackbar({ open: true, message: 'Failed to delete issue type.', severity: 'error' });
    }
  };

  const handleDeleteConfirm = () => {
    if (confirmDelete) {
      handleDelete(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const commonLinkStyles = {
    color: '#A3A3A3',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    cursor: 'pointer',
  };

  return (
    <Box p={{ xs: '8px', sm: '16px' }} sx={{ fontFamily: 'Inter, sans-serif' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IoArrowBackCircleOutline
          style={{ fontSize: '2rem', color: '#0061A1', cursor: 'pointer' }}
          onClick={() => navigate(-1)}
        />
        <Box display="flex" alignItems="center" ml={2}>
          <Link onClick={() => navigate('/dashboard')} sx={commonLinkStyles}>
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
            / Manage Issue Types
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditIssueType({})}
          sx={{
            backgroundColor: '#0061A1',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            '&:hover': { backgroundColor: '#004d80' },
          }}
        >
          <IoIosAddCircleOutline style={{ marginRight: '8px', fontSize: '1.5rem' }} />
          Add New Issue Type
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
              <TableCell style={{ fontWeight: 'bold' }}>Department Name</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Issue</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issueTypes.map((type) => (
              <TableRow key={type.id} hover>
                <TableCell>{type.id}</TableCell>
                <TableCell>{type.department_name}</TableCell>
                <TableCell>{type.issue}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => setEditIssueType(type)}
                    color="primary"
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => setConfirmDelete(type.id)}
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
        <DialogContent>Are you sure you want to delete this issue type?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Issue Type Form Dialog */}
      <Dialog open={!!editIssueType} onClose={() => setEditIssueType(null)} maxWidth="sm" fullWidth>
        <IssueTypeForm
          issueType={editIssueType}
          onSave={fetchIssueTypes}
          onClose={() => setEditIssueType(null)}
        />
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageIssueTypes;