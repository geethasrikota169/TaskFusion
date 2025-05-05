import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import './ManagerSettings.css'; 

export default function ViewManagers() {
    const [managers, setManagers] = useState([]);
    const [error, setError] = useState("");

    const displayManagers = async () => {
        try {
            const response = await axios.get(`${config.url}/admin/viewallmanagers`);
            setManagers(response.data);
        } catch (err) {
            setError("Failed to fetch managers data ... " + err.message);
        }
    };

    useEffect(() => {
        displayManagers();
    }, []);

    const deleteManager = async (nid) => {
        try {
            const response = await axios.delete(`${config.url}/admin/deletemanager/${nid}`);
            alert(response.data);
            displayManagers();
        } catch (err) {
            setError("Unexpected Error Occurred... " + err.message);
        }
    };

    return (
        <div className="view-managers-container">
            <h3 className="view-managers-title">
                <u>View All Managers</u>
            </h3>

            {error ? (
                <p className="error-message">{error}</p>
            ) : managers.length === 0 ? (
                <p className="no-data-message">No Managers Data Found</p>
            ) : (
                <table className="managers-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>DOB</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Mobile No</th>
                            <th>location</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managers.map((manager) => (
                            <tr key={manager.id}>
                                <td>{manager.id}</td>
                                <td>{manager.name}</td>
                                <td>{manager.gender}</td>
                                <td>{manager.dob}</td>
                                <td>{manager.email}</td>
                                <td>{manager.username}</td>
                                <td>{manager.mobileno}</td>
                                <td>{manager.location}</td>
                                <td>
                                    <Button
                                        variant="outlined"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => deleteManager(manager.id)}
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