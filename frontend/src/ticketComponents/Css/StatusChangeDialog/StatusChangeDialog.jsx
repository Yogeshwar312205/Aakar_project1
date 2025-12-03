import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
} from '@mui/material';

const StatusChangeDialog = ({ open, onClose, onChangeStatus, currentStatus, newStatusOptions }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [reason, setReason] = useState('');
  const [sendEmailToOwner, setSendEmailToOwner] = useState(false);
  const [sendEmailToManager, setSendEmailToManager] = useState(false);

  const handleChangeStatus = () => {
    const statusChangeData = {
      status: selectedStatus,
      reason,
      sendEmailToOwner,
      sendEmailToManager,
    };
    onChangeStatus(statusChangeData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>You are attempting to change the status!</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="error">
            {currentStatus}
          </Typography>
          <Typography variant="h6">→</Typography>
          <TextField
            select
            label="New Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            SelectProps={{ native: true }}
            variant="outlined"
            fullWidth
          >
            {newStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </TextField>
        </Box>

        <TextField
          label="Reason for changing the status"
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={sendEmailToOwner}
                onChange={(e) => setSendEmailToOwner(e.target.checked)}
              />
            }
            label="Send email to owner"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={sendEmailToManager}
                onChange={(e) => setSendEmailToManager(e.target.checked)}
              />
            }
            label="Send email to manager"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleChangeStatus} variant="contained" color="primary">
          Change status
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusChangeDialog;
