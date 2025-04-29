import React from 'react';
import './About.css';
import { useNavigate } from 'react-router-dom';
import aboutHero from '../assets/task-hero.jpg';
import feature1 from '../assets/interface.avif';
import feature2 from '../assets/collab.jpg';
import feature3 from '../assets/smart.jpg';
import teamCollaboration from '../assets/teamimage.webp';

export default function About() {

  const navigate = useNavigate();

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero" style={{background: 'linear-gradient(to bottom, #6dd5fa,rgb(0, 112, 200))'}}>
        <div className="hero-content">
          <div className="hero-text">
            <h1>TaskFusion</h1>
            <p className="tagline">Revolutionizing the way teams work together</p>
            <p className="hero-description">
              Our task management system helps individuals and teams organize, prioritize, 
              and get work done more efficiently than ever before.
            </p>
          </div>
          <div className="hero-image">
            <img src={aboutHero} alt="Task Management Dashboard" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Our System</h2>
        <div className="features-grid">
          <div className="feature-card" style={{background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 100%)'}}>
            <img src={feature1} alt="Intuitive Interface" />
            <h3>Intuitive Interface</h3>
            <p>Beautiful design that's easy to use from day one</p>
          </div>
          
          <div className="feature-card" style={{background: 'linear-gradient(45deg, #a1c4fd 0%,rgb(162, 74, 255) 100%)'}}>
            <img src={feature2} alt="Real-time Collaboration" />
            <h3>Real-time Collaboration</h3>
            <p>Work together seamlessly with your team</p>
          </div>
          
          <div className="feature-card" style={{background: 'linear-gradient(45deg, #ffecd2 0%, #fcb69f 100%)'}}>
            <img src={feature3} alt="Smart Analytics" />
            <h3>Smart Analytics</h3>
            <p>Gain insights into your productivity patterns</p>
          </div>
        </div>
      </section>

      {/* Team Collaboration Section */}
      <section className="collab-section">
        <div className="collab-content">
          <div className="collab-text">
            <h2>Built for Modern Teams</h2>
            <p>
              TaskMaster Pro was designed with today's distributed teams in mind. 
              Whether you're across the office or across the world, our system keeps 
              everyone aligned and productive.
            </p>
            <ul className="benefits-list">
              <li>Cloud-based access from anywhere</li>
              <li>Integrations with your favorite tools</li>
              <li>Customizable workflows for any team</li>
              <li>Enterprise-grade security</li>
            </ul>
          </div>
          <div className="collab-image">
            <img src={teamCollaboration} alt="Team Collaboration" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
        <h2>Ready to transform your productivity?</h2>
        <button className="cta-button" onClick={() => navigate('/userregistration')}>
          Get Started
        </button>
      </section>
    </div>
  );
}