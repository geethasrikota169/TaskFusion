import { useState } from 'react';
import './User.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config'
import { useAuth } from '../contextapi/AuthContext';

export default function UserLogin() 
{
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message,setMessage] = useState("")
  const [error,setError] = useState("")

  const navigate = useNavigate();
  const { setIsUserLoggedIn } = useAuth();

  const handleChange = (e) => 
  {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => 
  {
    e.preventDefault();
  
    try 
    {
      const response = await axios.post(`${config.url}/user/checkUserLogin`, formData);
  
      if(response.status === 200) 
      {
        setIsUserLoggedIn(true); 
        navigate("/userhome");
      }
      else
      {
        setMessage(response.data)
      }
    } 
    catch (error) 
    {
      if(error.response) 
      {
        setError(error.response.data.message || "An unexpected error occurred.");
      }
      else 
      {
        setError("An unexpected error occurred.");
      }
    }
  }
  

  return (
    <div>
      <h3 style={{ textAlign: "center",textDecoration: "underline"}}>User Login</h3>
      {
            message?
            <p style={{textAlign: "center",color:"green",fontWeight:"bolder"}}>{message}</p>:
            <p style={{textAlign: "center",color:"red",fontWeight:"bolder"}}>{error}</p>
      }
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input type="text" id="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" id="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="button">Login</button>
      </form>
    </div>
  );
}