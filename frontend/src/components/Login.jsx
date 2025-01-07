import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [role, setRole] = useState('');
  const [bookStats, setBookStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
  });

  const navigate = useNavigate();

  // Fetch book statistics
  useEffect(() => {
    const fetchBookStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/books');
        const books = res.data;
        const totalBooks = books.length;
        const availableBooks = books.filter((book) => !book.isBorrowed).length;
        const borrowedBooks = totalBooks - availableBooks;

        setBookStats({
          totalBooks,
          availableBooks,
          borrowedBooks,
        });
      } catch (err) {
        console.error('Error fetching book stats:', err);
      }
    };

    fetchBookStats();
  }, []);

  const handleLogin = () => {
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'user') {
      navigate('/user');
    } else {
      alert('Please select a role to login.');
    }
  };

  return (
    <div className="login-container">
      <h1>Library Management System</h1>
      <div className="dashboard">
        <h2>Dashboard</h2>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-title">Total Books:</span>
            <span className="stat-value">{bookStats.totalBooks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-title">Available Books:</span>
            <span className="stat-value">{bookStats.availableBooks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-title">Borrowed Books:</span>
            <span className="stat-value">{bookStats.borrowedBooks}</span>
          </div>
        </div>
      </div>

      <div className="role-selection">
        <h3>Select Role to Login</h3>
        <div>
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              onChange={(e) => setRole(e.target.value)}
            />
            Admin
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="user"
              onChange={(e) => setRole(e.target.value)}
            />
            User
          </label>
        </div>
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;
