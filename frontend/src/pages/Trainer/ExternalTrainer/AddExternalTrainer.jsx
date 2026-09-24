import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiLock, FiCheckSquare } from 'react-icons/fi';
import { GiSkills } from 'react-icons/gi';

const AddExternalTrainer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  
  // Get current user's department from Redux
  const user = useSelector((state) => state?.auth?.user);
  const userDepartmentId = user?.departmentId;

  const [formData, setFormData] = useState({
    customEmployeeId: '',
    employeeName: '',
    employeeEmail: '',
    employeePhone: '',
    companyName: '',
    accessStartDate: '',
    accessEndDate: '',
    password: '', // New field
    skills: []    // New field: array of skill IDs
  });

  const [errors, setErrors] = useState({});

  // Fetch skills for the admin's department
  useEffect(() => {
    const fetchSkills = async () => {
      if (!userDepartmentId) {
        console.warn('No department ID found for user');
        return;
      }

      setLoadingSkills(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/skills/${userDepartmentId}`,
          { withCredentials: true }
        );
        setAvailableSkills(response.data || []);
      } catch (error) {
        console.error('Failed to fetch skills:', error);
        toast.error('Failed to load skills');
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [userDepartmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId];
      
      return { ...prev, skills };
    });
    
    // Clear skill error if at least one is selected
    if (errors.skills) {
      setErrors(prev => ({ ...prev, skills: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customEmployeeId.trim()) {
      newErrors.customEmployeeId = 'Trainer ID is required';
    }

    if (!formData.employeeName.trim()) {
      newErrors.employeeName = 'Trainer name is required';
    }

    if (!formData.employeeEmail.trim()) {
      newErrors.employeeEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.employeeEmail)) {
      newErrors.employeeEmail = 'Invalid email format';
    }

    if (!formData.accessStartDate) {
      newErrors.accessStartDate = 'Start date is required';
    }

    if (!formData.accessEndDate) {
      newErrors.accessEndDate = 'End date is required';
    }

    if (formData.accessStartDate && formData.accessEndDate) {
      const startDate = new Date(formData.accessStartDate);
      const endDate = new Date(formData.accessEndDate);
      
      if (endDate <= startDate) {
        newErrors.accessEndDate = 'End date must be after start date';
      }
    }

    // Validate skills selection
    if (!formData.skills || formData.skills.length === 0) {
      newErrors.skills = 'At least one skill must be selected';
    }

    // Validate password if provided (optional but should be strong if provided)
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/externalTrainer/addExternalTrainer`,
        formData,
        { withCredentials: true }
      );

      toast.success('External trainer added successfully! Login credentials sent via email.');
      navigate('/training/external-trainer');
    } catch (error) {
      console.error('Failed to add trainer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add external trainer';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      navigate('/training/external-trainer');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/training/external-trainer')}
            className="flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-800 transition"
          >
            <FiArrowLeft /> Back to External Trainers
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Add External Trainer</h1>
          <p className="text-gray-600 mt-1">Create a new external trainer account with time-based access</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trainer ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trainer ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="customEmployeeId"
                  value={formData.customEmployeeId}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border ${
                    errors.customEmployeeId ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., EXT001"
                />
              </div>
              {errors.customEmployeeId && (
                <p className="mt-1 text-sm text-red-500">{errors.customEmployeeId}</p>
              )}
            </div>

            {/* Trainer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trainer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border ${
                    errors.employeeName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter trainer's full name"
                />
              </div>
              {errors.employeeName && (
                <p className="mt-1 text-sm text-red-500">{errors.employeeName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="employeeEmail"
                  value={formData.employeeEmail}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border ${
                    errors.employeeEmail ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="trainer@example.com"
                />
              </div>
              {errors.employeeEmail && (
                <p className="mt-1 text-sm text-red-500">{errors.employeeEmail}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Login credentials will be sent to this email
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="employeePhone"
                  value={formData.employeePhone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number (optional)"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company/Organization
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBriefcase className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name (optional)"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Leave blank to auto-generate"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to auto-generate a secure password. If provided, must be at least 8 characters with uppercase, lowercase, and number.
              </p>
            </div>

            {/* Skills Selection */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                <GiSkills size={18} /> Skills <span className="text-red-500">*</span>
              </h3>
              
              {loadingSkills ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading skills...</p>
                </div>
              ) : availableSkills.length === 0 ? (
                <div className="text-center py-4 text-gray-600">
                  <p>No skills available for your department.</p>
                  <p className="text-xs mt-1">Please contact admin to add skills first.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableSkills.map((skill) => (
                    <label
                      key={skill.skillId}
                      className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-green-100 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill.skillId)}
                        onChange={() => handleSkillToggle(skill.skillId)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{skill.skillName}</span>
                      {skill.skillDescription && (
                        <span className="ml-auto text-xs text-gray-500">{skill.skillDescription}</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
              
              {errors.skills && (
                <p className="mt-2 text-sm text-red-500">{errors.skills}</p>
              )}
              
              {formData.skills.length > 0 && (
                <div className="mt-3 p-2 bg-white rounded border border-green-300">
                  <p className="text-xs font-medium text-green-800">
                    Selected: {formData.skills.length} skill(s)
                  </p>
                </div>
              )}
            </div>

            {/* Access Period */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <FiCalendar /> Access Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="accessStartDate"
                    value={formData.accessStartDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.accessStartDate ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.accessStartDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.accessStartDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="accessEndDate"
                    value={formData.accessEndDate}
                    onChange={handleChange}
                    min={formData.accessStartDate}
                    className={`w-full px-3 py-2 border ${
                      errors.accessEndDate ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.accessEndDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.accessEndDate}</p>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-blue-700">
                The trainer will be able to login only during this period
              </p>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">📌 Important Notes:</h3>
              <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                <li>Login credentials will be {formData.password ? 'sent' : 'auto-generated and sent'} to the trainer's email</li>
                <li>The trainer will have access <strong>only to the Training Status section</strong></li>
                <li>Access will be automatically restricted to the specified date range</li>
                <li>The trainer can only provide training for the selected skills</li>
                <li>You can resend credentials, extend access dates, or modify skills later if needed</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Adding Trainer...' : 'Add External Trainer'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExternalTrainer;
