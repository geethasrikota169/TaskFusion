import React, { useState, useEffect } from 'react';
import { useAuth } from '../contextapi/AuthContext';
import axios from 'axios';
import './UserProfile.css';
import config from '../config';

export default function UserProfile() {
  const { isUserLoggedIn, userData, setUserData } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name,
        gender: userData.gender,
        dob: userData.dob,
        mobileno: userData.mobileno,
        location: userData.location
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.mobileno?.trim()) newErrors.mobileno = 'Mobile number is required';
    if (!formData.gender?.trim()) newErrors.gender = 'Gender is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    try {
      setLoading(true);
      const response = await axios.put(`${config.url}/user/update`, {
        ...formData,
        username: userData.username
      });
      
      setUserData(prev => ({ ...prev, ...formData }));
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isUserLoggedIn) {
    return <div className="profile-container">Please log in to view your profile</div>;
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      
      

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-details">
        {/* Non-editable fields */}
        <div className="profile-field">
          <span className="field-label">Username:</span>
          <span className="field-value">{userData.username}</span>
        </div>
        <div className="profile-field">
          <span className="field-label">Email:</span>
          <span className="field-value">{userData.email}</span>
        </div>

        {/* Editable fields with validation */}
        <div className="profile-field">
          <span className="field-label">Name:</span>
          {editMode ? (
            <>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`editable-field ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </>
          ) : (
            <span className="field-value">{userData.name}</span>
          )}
        </div>

        <div className="profile-field">
          <span className="field-label">Gender:</span>
          {editMode ? (
            <>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`editable-field ${errors.gender ? 'error' : ''}`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <span className="field-error">{errors.gender}</span>}
            </>
          ) : (
            <span className="field-value">{userData.gender}</span>
          )}
        </div>

        {/* Add similar fields for dob, mobileno, location with validation */}
        <div className="profile-field">
          <span className="field-label">Mobile Number:</span>
          {editMode ? (
            <>
              <input
                type="text"
                name="mobileno"
                value={formData.mobileno}
                onChange={handleInputChange}
                className={`editable-field ${errors.mobileno ? 'error' : ''}`}
              />
              {errors.mobileno && <span className="field-error">{errors.mobileno}</span>}
            </>
          ) : (
            <span className="field-value">{userData.mobileno}</span>
          )}
        </div>

        <div className="profile-field">
          <span className="field-label">Date of Birth:</span>
          {editMode ? (
            <>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="editable-field"
              />
              {errors.dob && <span className="field-error">{errors.dob}</span>}
            </>
          ) : (
            <span className="field-value">{userData.dob}</span>
          )}
        </div>


        <div className="profile-field">
          <span className="field-label">Location:</span>
          {editMode ? (
            <>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`editable-field ${errors.location ? 'error' : ''}`}
              />
              {errors.location && <span className="field-error">{errors.location}</span>}
            </>
          ) : (
            <span className="field-value">{userData.location}</span>
          )}
        </div>
      </div>
      <div className="profile-actions">
        {editMode ? (
          <>
            <button onClick={handleSave} disabled={loading} className="save-btn">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={() => {
                setEditMode(false);
                setErrors({});
              }} 
              className="cancel-btn"
            >
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setEditMode(true)} className="edit-btn">
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}