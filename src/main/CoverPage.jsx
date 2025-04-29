import React from 'react';
import { useNavigate } from 'react-router-dom';
import laptopImage from '../assets/coverpage-img.png'; // Import the laptop image
import './CoverPage.css';

const CoverPage = () => {
  const navigate = useNavigate();

  return (
    <div className="cover-page">
      <img src={laptopImage} alt="Laptop with task management icons" className="laptop-image" />
      <div className="cover-box">
        <h1 className="app-name">TaskFusion</h1>
        <div className="button-container">
          <button className="login-button" onClick={() => navigate('/userlogin')}>
            Login
          </button>
          <button className="coverpage-signup-button" onClick={() => navigate('/userregistration')}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;