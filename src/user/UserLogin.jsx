import { useState } from 'react';
import './UserLogin.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import { useAuth } from '../contextapi/AuthContext';
import loginImage from '../assets/loginpic2-removebg.png';

export default function UserLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setIsUserLoggedIn } = useAuth();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(`${config.url}/user/checkUserLogin`, formData);
  
      if(response.status === 200) {
        setIsUserLoggedIn(true); 
        navigate("/userhome");
      } else {
        setError(response.data || "Login failed. Please check credentials.");
      }
    } catch (error) {
      if(error.response) {
        setError(error.response.data.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <h1 className="login-title">User Login</h1>
          
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
          <button onClick={handleSubmit} className="login2-button">Login</button>
          <div className="signup-message">
            <p>Don't have an account? <a href="/userregistration">Sign up</a></p>
          </div>
        </div>
        <div className="login-right">
          <img src={loginImage} alt="Task Management" className="login-image" />
          <div className="login-message">
            <p>Check Your Tasks Progress - Stay consistent, celebrate small wins and keep moving forward toward your goals!</p>
          </div>
        </div>
      </div>
    </div>
  );
}