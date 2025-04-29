import { useState } from 'react';
import axios from 'axios';
import config from '../config';
import './UserRegistration.css';

export default function UserRegistration() {
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

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${config.url}/user/registration`, formData);
      if (response.status === 200) {
        setMessage(response.data);
        setError('');
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
      if(error.response) {
        setMessage('');
        setError(error.response.data);
      } else {
        setMessage('');
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div>
      <div className="signup-page">
        <div className="signup-card">
          <div className="signup-left">
            <h1 className="signup-title">User Registration</h1>
            
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="form-columns">
              <div className="left-column">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    placeholder="Full Name" 
                    className="form-input" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    id="email"
                    placeholder="Email Address" 
                    className="form-input" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    id="username"
                    placeholder="Username" 
                    className="form-input" 
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    id="password"
                    placeholder="Password" 
                    className="form-input" 
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="right-column">
                <div className="form-group">
                  <label>Gender</label>
                  <select 
                    id="gender"
                    className="form-input" 
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    id="dob"
                    className="form-input" 
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input 
                    type="tel" 
                    id="mobileno"
                    placeholder="Mobile Number" 
                    className="form-input" 
                    value={formData.mobileno}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    id="location"
                    placeholder="Location" 
                    className="form-input" 
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>


            <div className="form-footer">
              <button onClick={handleSubmit} className="signup-button">Register</button>
              <div className="login-message2">
                <p>Already have an account? <a href="/userlogin">Login</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}