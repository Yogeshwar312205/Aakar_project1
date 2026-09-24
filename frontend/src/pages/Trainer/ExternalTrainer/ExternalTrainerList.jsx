import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiMail, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ExternalTrainerList = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get permission from Redux instead of API call
  const canManageExternalTrainers = useSelector(
    (state) => state?.auth?.user?.canManageExternalTrainers
  );
  const userType = useSelector(
    (state) => state?.auth?.user?.userType
  );

  const hasPermission = (canManageExternalTrainers === 1 || canManageExternalTrainers === true) && 
                        (userType === 'internal' || !userType);

  useEffect(() => {
    if (hasPermission) {
      fetchTrainers();
    } else {
      setLoading(false);
    }
  }, [hasPermission]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/externalTrainer/getAllExternalTrainers`,
        { withCredentials: true }
      );
      setTrainers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch external trainers');
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, trainerName) => {
    if (window.confirm(`Are you sure you want to delete ${trainerName}? This action cannot be undone.`)) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/externalTrainer/deleteExternalTrainer/${id}`,
          { withCredentials: true }
        );
        toast.success('External trainer deleted successfully');
        fetchTrainers();
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error(error.response?.data?.message || 'Failed to delete external trainer');
      }
    }
  };

  const handleResendCredentials = async (id, trainerName) => {
    if (window.confirm(`Resend login credentials to ${trainerName}?`)) {
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/externalTrainer/resendCredentials/${id}`,
          {},
          { withCredentials: true }
        );
        toast.success('Login credentials sent successfully');
      } catch (error) {
        console.error('Resend credentials failed:', error);
        toast.error(error.response?.data?.message || 'Failed to send credentials');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: 'bg-green-100 text-green-800 border-green-300',
      Expired: 'bg-red-100 text-red-800 border-red-300',
      'Not Started': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-300'
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading external trainers...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You do not have permission to manage external trainers. Please contact your administrator.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FiArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading external trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">External Trainers</h1>
            <p className="text-gray-600 mt-1">Manage external trainers with time-based access control</p>
          </div>
          <button
            onClick={() => navigate('/training/external-trainer/add')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <FiPlus size={20} /> Add External Trainer
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Trainers</p>
            <p className="text-2xl font-bold text-gray-800">{trainers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {trainers.filter((t) => t.accessStatus === 'Active').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Expired</p>
            <p className="text-2xl font-bold text-red-600">
              {trainers.filter((t) => t.accessStatus === 'Expired').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Not Started</p>
            <p className="text-2xl font-bold text-yellow-600">
              {trainers.filter((t) => t.accessStatus === 'Not Started').length}
            </p>
          </div>
        </div>

        {/* Trainers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {trainers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No External Trainers Yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first external trainer</p>
              <button
                onClick={() => navigate('/training/external-trainer/add')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <FiPlus /> Add External Trainer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trainer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Access Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trainers.map((trainer) => (
                    <tr key={trainer.employeeId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trainer.customEmployeeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trainer.employeeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {trainer.employeeEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {trainer.employeePhone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>
                          <div>{new Date(trainer.accessStartDate).toLocaleDateString()}</div>
                          <div className="text-gray-400">to</div>
                          <div>{new Date(trainer.accessEndDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(trainer.accessStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/training/external-trainer/edit/${trainer.employeeId}`)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleResendCredentials(trainer.employeeId, trainer.employeeName)}
                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition"
                            title="Resend Credentials"
                          >
                            <FiMail size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(trainer.employeeId, trainer.employeeName)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExternalTrainerList;
