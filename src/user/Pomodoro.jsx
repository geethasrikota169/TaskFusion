import React, { useState, useEffect } from 'react';
import './Pomodoro.css';

const Pomodoro = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(interval);
          alert('Time is up! Take a break.');
          setIsActive(false);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <div className="pomodoro-page">
      <div className="pomodoro-container">
        <p className='pomo-title'>Pomodoro Timer</p>
        <div className="timer-circle">
          <div className="timer-display">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        <div className="timer-controls">
          <button onClick={toggleTimer}>
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button onClick={resetTimer}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;