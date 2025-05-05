import { useState } from 'react';
import axios from 'axios';
import config from '../config';
import './ManagerSettings.css';

export default function AddManager() {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '',
    email: '',
    username: '',
    password: '',
    mobileno: '',
    location: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${config.url}/admin/addmanager`, formData);
      if (response.status === 200) {
        setMessage(response.data);
        setError(''); // Clear error message on success
        setFormData({
          name: '',
          gender: '',
          dob: '',
          email: '',
          username: '',
          password: '',
          mobileno: '',
          location: ''
        });
      }
    } catch (error) {
      setMessage(''); // Clear success message on error
      if (error.response) {
        setError(error.response.data);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="add-manager-container">
      <h3 className="add-manager-title">Add Manager</h3>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="am-error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="add-manager-form">
        <div className="am-form-group">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input type="text" id="name" value={formData.name} onChange={handleChange} className="form-input" required />
        </div>
        <div className="am-form-group">
          <label htmlFor="gender" className="form-label">Gender</label>
          <select id="gender" value={formData.gender} onChange={handleChange} className="form-input" required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="am-form-group">
          <label htmlFor="dob" className="form-label">Date of Birth</label>
          <input type="date" id="dob" value={formData.dob} onChange={handleChange} className="form-input" required />
        </div>
        <div className="am-form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" id="email" value={formData.email} onChange={handleChange} className="form-input" required />
        </div>
        <div className="am-form-group">
          <label htmlFor="username" className="form-label">Username</label>
          <input type="text" id="username" value={formData.username} onChange={handleChange} className="form-input" required />
        </div>
        <div className="am-form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" id="password" value={formData.password} onChange={handleChange} className="form-input" required />
        </div>
        <div className="am-form-group">
          <label htmlFor="mobileno" className="form-label">Mobile No</label>
          <input type="number" id="mobileno" value={formData.mobileno} onChange={handleChange} className="form-input" required />
        </div>
        <div className="am-form-group">
          <label htmlFor="location" className="form-label">Location</label>
          <input type="text" id="location" value={formData.location} onChange={handleChange} className="form-input" required />
        </div>
        <button type="submit" className="submit-button">Add</button>
      </form>
    </div>
  );
}