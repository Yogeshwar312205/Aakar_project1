import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import TicketDetails from '../TicketDetails/TicketDetails.jsx';
import StatusUpdate from '../StatusUpdate/StatusUpdate.jsx';
import AssigneeUpdate from '../AssigneeUpdate/AssigneeUpdate.jsx';
import { FiExternalLink } from 'react-icons/fi';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: '#f1f1f1',
  borderBottom: `2px solid #d0d0d0`,
  color: '#333',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}));

const StatusChip = styled('div')(({ status }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '12px',
  color: '#fff',
  backgroundColor: status === 'open' ? '#4caf50' : status === 'close' ? '#f44336' : status === 'hold' ? '#ffeb3b' : status === 'pending' ? '#2196f3' : '#4caf50',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  textAlign: 'center',
  minWidth: '60px',
}));

const StyledTableRow = styled(TableRow)(({ theme, expanded }) => ({
  cursor: 'pointer',
  position: 'relative', // Ensure the icon is positioned correctly
  backgroundColor: expanded ? '#EEF7FF' : 'inherit',
  '&:hover': {
    backgroundColor: expanded ? '#EEF7FF' : '#f5f5f5',
  },
}));

const ExpandedRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#EEF7FF',
}));

const ExternalLinkIcon = styled(FiExternalLink)(({ theme }) => ({
  position: 'absolute',
  right: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  opacity: 0,
  transition: 'opacity 0.3s',
  fontSize: '20px',
  color: '#0061A1',
}));

const TicketTable = ({
  tickets = [],
  statusOptions = [],
  assigneeOptions = [],
  onUpdateStatus = () => {},
  onUpdateAssignee = () => {}
}) => {
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [historyData, setHistoryData] = useState({});

  const handleRowClick = async (ticketId) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
      setHistoryData({});
    } else {
      setExpandedTicketId(ticketId);
      try {
        const response = await axios.get(`http://localhost:3000/ticketAssigneeHistory/assignee-history/${ticketId}`);
        setHistoryData({
          [ticketId]: response.data
        });
      } catch (error) {
        console.error('Error fetching assignee history:', error);
      }
    }
  };

  return (
    <TableContainer component={Paper} style={{ margin: '20px', maxHeight: '600px' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell>Sr. No.</StyledTableCell>
            <StyledTableCell>Priority</StyledTableCell>
            <StyledTableCell>Description</StyledTableCell>
            <StyledTableCell>Date</StyledTableCell>
            <StyledTableCell>Time</StyledTableCell>
            <StyledTableCell>Type</StyledTableCell>
            <StyledTableCell>Department</StyledTableCell>
            <StyledTableCell>Status</StyledTableCell>
            <StyledTableCell>Assigned By/To</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickets.length > 0 ? (
            tickets.map((row, index) => (
              <React.Fragment key={row.id}>
                <StyledTableRow
                  expanded={expandedTicketId === row.id}
                  onClick={() => handleRowClick(row.id)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.priority}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{new Date(row.ticket_created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(row.ticket_created_at).toLocaleTimeString()}</TableCell>
                  <TableCell>{row.issue_type}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>
                    {expandedTicketId === row.id ? (
                      <StatusUpdate
                        ticketId={row.id}
                        currentStatus={row.status}
                        onUpdate={onUpdateStatus}
                      />
                    ) : (
                      <StatusChip status={row.status}>{row.status}</StatusChip>
                    )}
                  </TableCell>
                  <TableCell>
                    {expandedTicketId === row.id ? (
                      <AssigneeUpdate
                        currentAssignee={row.assignee || "None" }
                        assigneeOptions={assigneeOptions}
                        onUpdate={onUpdateAssignee}
                      />
                    ) : (
                      row.assignee==='' ? ("None") : (row.assignee)
                      
                    )}
                  </TableCell>
                  <ExternalLinkIcon style={{ opacity: expandedTicketId === row.id ? 1 : 0 }} />
                </StyledTableRow>

                {expandedTicketId === row.id && (
                  <ExpandedRow>
                    <TableCell colSpan={9}>
                      <TicketDetails
                        ticket={row}
                        historyData={historyData[row.id]}
                        statusOptions={statusOptions}
                        assigneeOptions={assigneeOptions}
                      />
                    </TableCell>
                  </ExpandedRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9}>
                <Typography variant="body2" align="center">
                  No tickets available.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TicketTable;
