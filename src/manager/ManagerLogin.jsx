import { useState } from 'react';
import '../admin/AdminLogin.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import { useAuth } from '../contextapi/AuthContext';
import loginImage from '../assets/loginpic2-removebg.png';

export default function ManagerLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setIsManagerLoggedIn, setUserData } = useAuth(); // Now includes setUserData

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${config.url}/manager/checkmanagerlogin`, formData);

      if (response.status === 200) {
        // Store complete manager data in context
        setUserData({
          id: response.data.id,
          username: response.data.username,
          name: response.data.name,
          email: response.data.email,
          gender: response.data.gender,
          dob: response.data.dob,
          mobileno: response.data.mobileno,
          location: response.data.location
        });

        setIsManagerLoggedIn(true);
        navigate("/managerhome");
      } else {
        setError(response.data || "Login failed. Please check credentials.");
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <h1 className="login-title">Manager Login</h1>

          {error && (
            <div className="error-message" style={{
              color: 'red',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#ffeeee',
              borderRadius: '5px'
            }}>
              {error}
            </div>
          )}

          <input
            type="text"
            id="username"
            placeholder="Username"
            className="email-input"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            id="password"
            placeholder="Password"
            className="password-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <a href="/forgot-password" className="forgot-password">Forgot password?</a>
          <button onClick={handleSubmit} className="login3-button">Login</button>
          <div className="signup-message">
            <p>Need manager access? <a href="/contact">Contact admin</a></p>
          </div>
        </div>
        <div className="login-right">
          <img src={loginImage} alt="Management Dashboard" className="login-image" />
          <div className="login-message">
            <p>Streamline your operations - Oversee workflows, track performance, and optimize team productivity!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
