import React, { useState } from 'react';
import { Card, TextField, Button, MenuItem, Select, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/system';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { LuSend } from 'react-icons/lu'; // Import LuSend icon
import axios from 'axios'; // Import Axios

const TicketMessageContainer = styled(Card)(({ theme }) => ({
  width: '1200px',
  height: '229px',
  backgroundColor: 'white',
  position: 'relative',
  top: '10px',
  left: '26px',
  opacity: '1',
  borderRadius: '8px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const ActionsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '16px',
});

const TrashIcon = styled(IconButton)({
  position: 'absolute',
  top: '7px',
  right: '16px',
  marginTop: '4px',
});

const SendButton = styled(Button)(({ theme }) => ({
  width: '40px', // Adjust width for square button
  height: '40px', // Adjust height for square button
  minWidth: '40px', // Prevent button from stretching
  borderRadius: '8px', // Optional: rounded corners
  backgroundColor: '#0061A1', // Set background color
  color: 'white',
  padding: 0, // Remove default padding
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: '#004d75', // Darker shade for hover effect
  },
  '& svg': {
    fontSize: '24px', // Adjust icon size to fit button
  },
}));

const FileInput = styled('input')({
  display: 'none', // Hide file input
});

const TicketMessage = ({ ticketId, employeeId, handleMessages }) => {
  const [message, setMessage] = useState('');
  const [responseRequired, setResponseRequired] = useState('require_response_log');
  const [attachments, setAttachments] = useState([]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('ticket_id', ticketId);
    formData.append('created_by', employeeId);
    formData.append('message', message);
    formData.append('type', responseRequired);

    attachments.forEach((file) => {
      formData.append('attachments', file); // Use 'attachments' consistently
    });

    try {
      const response = await axios.post('http://localhost:3000/logs/logs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const logId = response.data.id;

      console.log('Log created successfully:', logId);
      handleMessages(response.data);

      if (logId) {
        alert('Log created successfully: ' + logId);
      } else {
        alert('Log created successfully, but no log ID returned.');
      }

      // Reset form fields
      setMessage('');
      setAttachments([]);

    } catch (error) {
      console.error('Error creating log:', error);
      alert('Error creating log');
    }
  };



  const handleFileChange = (e) => {
    setAttachments([...attachments, ...Array.from(e.target.files)]);
  };

  return (
    <TicketMessageContainer>
      <TrashIcon>
        <DeleteOutlineIcon />
      </TrashIcon>

      <Typography
        variant="h6"
        style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', marginBottom: '8px' }}
      >
        Message
      </Typography>

      <TextField
        variant="outlined"
        multiline
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        fullWidth
      />

      <ActionsContainer>
        <Button
          variant="outlined"
          startIcon={<AttachFileIcon />}
          style={{ color: '#1976d2' }}
          component="label"
        >
          ATTACH FILES
          <FileInput
            type="file"
            multiple
            onChange={handleFileChange}
          />
        </Button>

        {attachments && (
          <Typography>
            {attachments.map((file, index) => (
              <span key={index}>{file.name}{index < attachments.length - 1 ? ', ' : ''}</span>
            ))}
          </Typography>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Select
            value={responseRequired}
            onChange={(e) => setResponseRequired(e.target.value)}
            variant="outlined"
            size="small"
          >
            <MenuItem value="require_response_log">Require response</MenuItem>
            <MenuItem value="closing_log">Closing Log</MenuItem>
          </Select>

          <SendButton
            variant="contained"
            onClick={handleSendMessage}
          >
            <LuSend /> {/* Icon will fill the button */}
          </SendButton>
        </div>
      </ActionsContainer>
    </TicketMessageContainer>
  );
};

export default TicketMessage;
