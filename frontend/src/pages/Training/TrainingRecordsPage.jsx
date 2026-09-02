import React, { useState, useEffect } from 'react';
import TableComponent from '../../components/TableComponent';
import './TrainingRecordsPage.css';
import { toast } from 'react-toastify';
import { FiPlusCircle, FiXCircle, FiEye } from 'react-icons/fi';
import Textfield from '../../components/Textfield';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const TrainingRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState(null);

  // Attendees modal
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [modalAttendees, setModalAttendees] = useState([]);
  const [modalTitle, setModalTitle] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeIdsStr, setEmployeeIdsStr] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchRecords();
    fetchTrainers();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/training/records`);
      setRecords(response.data);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to fetch training records.');
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/trainers`);
      setTrainers(response.data.filter((t) => t.is_active));
    } catch (err) {
      console.error('Error fetching trainers:', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTrainerId('');
    setStartDate('');
    setEndDate('');
    setEmployeeIdsStr('');
  };

  const handleToggleForm = () => {
    if (isFormOpen) {
      resetForm();
      setIsFormOpen(false);
    } else {
      setIsFormOpen(true);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !trainerId || !startDate || !endDate) {
      toast.error('Title, Trainer, Start Date, and End Date are required.');
      return;
    }

    // Parse employee IDs from comma/newline separated string
    const employee_ids = employeeIdsStr
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      title,
      description: description || null,
      trainer_id: parseInt(trainerId),
      start_date: startDate,
      end_date: endDate,
      employee_ids,
    };

    try {
      await axios.post(`${API_BASE}/api/training/sessions`, payload);
      toast.success('Training session created successfully.');
      resetForm();
      setIsFormOpen(false);
      fetchRecords();
    } catch (err) {
      console.error('Error creating session:', err);
      const msg = err.response?.data?.message || 'Failed to create session.';
      toast.error(msg);
    }
  };

  const handleViewAttendees = async (programId, programTitle) => {
    try {
      const response = await axios.get(`${API_BASE}/api/training/sessions/${programId}/attendees`);
      setModalAttendees(response.data);
      setModalTitle(programTitle);
      setShowAttendeesModal(true);
    } catch (err) {
      console.error('Error fetching attendees:', err);
      toast.error('Failed to fetch attendees.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const classMap = {
      SCHEDULED: 'status-scheduled',
      IN_PROGRESS: 'status-in-progress',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled',
    };
    return (
      <span className={`status-badge ${classMap[status] || 'status-scheduled'}`}>
        {status ? status.replace('_', ' ') : 'SCHEDULED'}
      </span>
    );
  };

  const columns = [
    {
      id: 'title',
      label: 'Program Name',
      align: 'center',
    },
    {
      id: 'start_date',
      label: 'Start Date',
      align: 'center',
      render: (row) => formatDateTime(row.start_date),
    },
    {
      id: 'end_date',
      label: 'End Date',
      align: 'center',
      render: (row) => formatDateTime(row.end_date),
    },
    {
      id: 'trainer_name',
      label: 'Trainer Name',
      align: 'center',
    },
    {
      id: 'trainer_type',
      label: 'Trainer Type',
      align: 'center',
      render: (row) => (
        <span className={`badge ${row.trainer_type === 'INTERNAL' ? 'badge-internal' : 'badge-external'}`}>
          {row.trainer_type}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      render: (row) => getStatusBadge(row.status),
    },
    {
      id: 'attendee_count',
      label: 'Attendees',
      align: 'center',
      render: (row) => (
        <div className="records-action-buttons">
          <span style={{ fontWeight: 600, marginRight: '6px' }}>{row.attendee_count}</span>
          <FiEye
            onClick={(e) => {
              e.stopPropagation();
              handleViewAttendees(row.program_id, row.title);
            }}
            size={20}
            className="action-icon"
            title="View Attendees"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="records-container">
      <div className="records-header">
        <h2 className="records-title">Training Records</h2>
        <div className="records-header-buttons">
          <button className="Add-session" onClick={handleToggleForm}>
            {isFormOpen ? <FiXCircle style={{ marginRight: '8px' }} size={20} /> : <FiPlusCircle style={{ marginRight: '8px' }} size={20} />}
            {isFormOpen ? 'Cancel' : '+ New Session'}
          </button>
          <button className="Records-report" onClick={() => toast.info('Records report generation coming soon.')}>
            Records Report
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'red', marginLeft: '40px' }}>{error}</p>}

      {isFormOpen && (
        <div className="session-input-box">
          <div className="session-form-row">
            <Textfield label="Program Title" value={title} onChange={(e) => setTitle(e.target.value)} name="title" isRequired />
            <Textfield label="Description" value={description} onChange={(e) => setDescription(e.target.value)} name="description" />
          </div>

          <div className="session-form-row">
            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Trainer *</label>
              <select
                className="trainer-select"
                value={trainerId}
                onChange={(e) => setTrainerId(e.target.value)}
              >
                <option value="">Select Trainer</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.trainer_type})
                  </option>
                ))}
              </select>
            </div>
            <Textfield label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} name="startDate" type="datetime-local" isRequired />
            <Textfield label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} name="endDate" type="datetime-local" isRequired />
          </div>

          <div className="session-form-row">
            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
                Employee IDs (comma-separated)
              </label>
              <textarea
                className="employee-ids-input"
                value={employeeIdsStr}
                onChange={(e) => setEmployeeIdsStr(e.target.value)}
                placeholder="e.g. EMP001, EMP002, EMP003"
              />
            </div>
          </div>

          <button className="session-save-btn" onClick={handleSave}>
            Create Session
          </button>
        </div>
      )}

      <div className="records-table-container">
        <TableComponent
          rows={records}
          columns={columns}
          rowClassName="table-row"
        />
      </div>

      {/* Attendees Modal */}
      {showAttendeesModal && (
        <div className="attendees-modal-overlay" onClick={() => setShowAttendeesModal(false)}>
          <div className="attendees-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Attendees — {modalTitle}</h3>
            {modalAttendees.length === 0 ? (
              <p style={{ color: '#666' }}>No attendees enrolled for this session.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {modalAttendees.map((att, idx) => (
                    <tr key={att.attendee_id}>
                      <td>{idx + 1}</td>
                      <td>{att.employee_id}</td>
                      <td>{att.employeeName || '—'}</td>
                      <td>{att.departmentName || '—'}</td>
                      <td>
                        <span className={`status-badge ${
                          att.status === 'COMPLETED' ? 'status-completed' :
                          att.status === 'ATTENDED' ? 'status-in-progress' :
                          att.status === 'ABSENT' ? 'status-cancelled' :
                          'status-scheduled'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td>{att.feedback || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="attendees-close-btn" onClick={() => setShowAttendeesModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingRecordsPage;
