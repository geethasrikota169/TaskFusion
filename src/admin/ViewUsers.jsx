import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import './ViewUsers.css';

export default function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const displayUsers = async () => {
    try {
      const response = await axios.get(`${config.url}/admin/viewallusers`);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users data ... ' + err.message);
    }
  };

  useEffect(() => {
    displayUsers();
  }, []);

  const deleteUser = async (uid) => {
    try {
      const response = await axios.delete(`${config.url}/admin/deleteuser?uid=${uid}`);
      alert(response.data);
      displayUsers();
    } catch (err) {
      setError('Unexpected Error Occurred... ' + err.message);
    }
  };

  return (
    <div className="view-users-container">
      <h3 className="view-users-title">
        <u>View All Users</u>
      </h3>

      {error ? (
        <p className="error-message">{error}</p>
      ) : users.length === 0 ? (
        <p className="no-data-message">No User Data Found</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Email</th>
              <th>Username</th>
              <th>Mobile No</th>
              <th>Location</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.gender}</td>
                <td>{user.dob}</td>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>{user.mobileno}</td>
                <td>{user.location}</td>
                <td>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
