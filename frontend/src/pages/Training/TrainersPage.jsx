import React, { useState, useEffect } from 'react';
import TableComponent from '../../components/TableComponent';
import './TrainersPage.css';
import { toast } from 'react-toastify';
import { FiPlusCircle, FiXCircle, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import Textfield from '../../components/Textfield';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const TrainersPage = () => {
  const [trainers, setTrainers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Form fields
  const [trainerType, setTrainerType] = useState('INTERNAL');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [organization, setOrganization] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [password, setPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Fetch trainers on mount
  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/trainers`);
      setTrainers(response.data);
    } catch (err) {
      console.error('Error fetching trainers:', err);
      setError('Failed to fetch trainers.');
    }
  };

  const resetForm = () => {
    setTrainerType('INTERNAL');
    setFullName('');
    setEmail('');
    setPhone('');
    setEmployeeId('');
    setOrganization('');
    setSpecialization('');
    setPassword('');
    setExpiryDate('');
    setEditingId(null);
  };

  const handleToggleForm = () => {
    if (isFormOpen) {
      resetForm();
      setIsFormOpen(false);
    } else {
      setIsFormOpen(true);
    }
  };

  const handleEdit = (trainer) => {
    setEditingId(trainer.id);
    setTrainerType(trainer.trainer_type);
    setFullName(trainer.full_name);
    setEmail(trainer.email);
    setPhone(trainer.phone || '');
    setEmployeeId(trainer.employee_id || '');
    setOrganization(trainer.organization || '');
    setSpecialization(trainer.specialization || '');
    setPassword('');
    setExpiryDate(trainer.expiry_date ? trainer.expiry_date.split('T')[0] : '');
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error('Full Name and Email are required.');
      return;
    }

    if (trainerType === 'INTERNAL' && !employeeId.trim()) {
      toast.error('Employee ID is required for Internal trainers.');
      return;
    }

    const payload = {
      trainer_type: trainerType,
      full_name: fullName,
      email,
      phone: phone || null,
      employee_id: trainerType === 'INTERNAL' ? employeeId : null,
      organization: trainerType === 'EXTERNAL' ? organization : null,
      specialization: specialization || null,
      password: trainerType === 'EXTERNAL' && password ? password : null,
      expiry_date: trainerType === 'EXTERNAL' && expiryDate ? expiryDate : null,
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/api/trainers/${editingId}`, payload);
        toast.success('Trainer updated successfully.');
      } else {
        await axios.post(`${API_BASE}/api/trainers`, payload);
        toast.success('Trainer added successfully.');
      }
      resetForm();
      setIsFormOpen(false);
      fetchTrainers();
    } catch (err) {
      console.error('Error saving trainer:', err);
      const msg = err.response?.data?.message || 'Failed to save trainer.';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await axios.delete(`${API_BASE}/api/trainers/${id}`);
        toast.success('Trainer deleted successfully.');
        fetchTrainers();
      } catch (err) {
        console.error('Error deleting trainer:', err);
        toast.error('Failed to delete trainer.');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/trainers/${id}/toggle-status`);
      toast.success('Trainer status updated.');
      fetchTrainers();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to toggle status.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const columns = [
    {
      id: 'full_name',
      label: 'Trainer Name',
      align: 'center',
    },
    {
      id: 'trainer_type',
      label: 'Type',
      align: 'center',
      render: (row) => (
        <span className={`badge ${row.trainer_type === 'INTERNAL' ? 'badge-internal' : 'badge-external'}`}>
          {row.trainer_type}
        </span>
      ),
    },
    {
      id: 'org_or_emp',
      label: 'Organization / Emp ID',
      align: 'center',
      render: (row) =>
        row.trainer_type === 'INTERNAL'
          ? row.employee_id || '—'
          : row.organization || '—',
    },
    {
      id: 'specialization',
      label: 'Specialization',
      align: 'center',
      render: (row) => row.specialization || '—',
    },
    {
      id: 'contact',
      label: 'Email & Phone',
      align: 'center',
      render: (row) => (
        <div>
          <div style={{ fontSize: '13px' }}>{row.email}</div>
          {row.phone && <div style={{ fontSize: '12px', color: '#666' }}>{row.phone}</div>}
        </div>
      ),
    },
    {
      id: 'expiry_date',
      label: 'Expiry Date',
      align: 'center',
      render: (row) =>
        row.trainer_type === 'EXTERNAL' ? formatDate(row.expiry_date) : '—',
    },
    {
      id: 'status_label',
      label: 'Status',
      align: 'center',
      render: (row) => {
        let badgeClass = 'badge-active';
        if (row.status_label === 'Expired') badgeClass = 'badge-expired';
        else if (row.status_label === 'Inactive') badgeClass = 'badge-inactive';
        return <span className={`badge ${badgeClass}`}>{row.status_label}</span>;
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="trainer-action-buttons">
          <FiEdit
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            size={20}
            className="action-icon"
            title="Edit"
          />
          {row.is_active ? (
            <FiToggleRight
              onClick={(e) => { e.stopPropagation(); handleToggleStatus(row.id); }}
              size={22}
              className="action-icon"
              style={{ color: '#2e7d32' }}
              title="Deactivate"
            />
          ) : (
            <FiToggleLeft
              onClick={(e) => { e.stopPropagation(); handleToggleStatus(row.id); }}
              size={22}
              className="action-icon"
              style={{ color: '#999' }}
              title="Activate"
            />
          )}
          <FiTrash2
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            size={20}
            className="action-icon"
            title="Delete"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="trainers-container">
      <div className="trainers-header">
        <h2 className="trainers-title">Trainers Management</h2>
        <div className="trainers-header-buttons">
          <button className="Add-trainer" onClick={handleToggleForm}>
            {isFormOpen ? <FiXCircle style={{ marginRight: '8px' }} size={20} /> : <FiPlusCircle style={{ marginRight: '8px' }} size={20} />}
            {isFormOpen ? 'Cancel' : '+ Add Trainer'}
          </button>
          <button className="Trainer-report" onClick={() => toast.info('Trainer report generation coming soon.')}>
            Trainer Report
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'red', marginLeft: '40px' }}>{error}</p>}

      {isFormOpen && (
        <div className="trainer-input-box">
          {/* Trainer Type Radio */}
          <div className="trainer-type-selector">
            <label>
              <input
                type="radio"
                name="trainerType"
                value="INTERNAL"
                checked={trainerType === 'INTERNAL'}
                onChange={() => setTrainerType('INTERNAL')}
              />
              Internal
            </label>
            <label>
              <input
                type="radio"
                name="trainerType"
                value="EXTERNAL"
                checked={trainerType === 'EXTERNAL'}
                onChange={() => setTrainerType('EXTERNAL')}
              />
              External
            </label>
          </div>

          {/* Common fields */}
          <div className="trainer-form-row">
            <Textfield label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} name="fullName" isRequired />
            <Textfield label="Email" value={email} onChange={(e) => setEmail(e.target.value)} name="email" isRequired />
            <Textfield label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} name="phone" />
            <Textfield label="Specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} name="specialization" />
          </div>

          {/* Internal-specific */}
          {trainerType === 'INTERNAL' && (
            <div className="trainer-form-row">
              <Textfield label="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} name="employeeId" isRequired />
            </div>
          )}

          {/* External-specific */}
          {trainerType === 'EXTERNAL' && (
            <div className="trainer-form-row">
              <Textfield label="Organization" value={organization} onChange={(e) => setOrganization(e.target.value)} name="organization" />
              <Textfield label="Temporary Password" value={password} onChange={(e) => setPassword(e.target.value)} name="password" type="password" />
              <Textfield label="Expiry Date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} name="expiryDate" type="date" />
            </div>
          )}

          <button className="trainer-save-btn" onClick={handleSave}>
            {editingId ? 'Update' : 'Add'}
          </button>
        </div>
      )}

      <div className="trainer-table-container">
        <TableComponent
          rows={trainers}
          columns={columns}
          rowClassName="table-row"
        />
      </div>
    </div>
  );
};

export default TrainersPage;
