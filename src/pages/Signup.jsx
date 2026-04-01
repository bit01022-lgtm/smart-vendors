import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AuthStyles.css';

const roleOptions = ['client', 'procurement', 'vendor', 'finance', 'admin'];

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'client',
  });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('sv_users') || '[]');
    const username = form.username.trim();
    const exists = users.some((user) => user.username === username);

    if (exists) {
      setError('That username is already taken.');
      return;
    }

    const newUser = {
      name: form.name.trim(),
      username,
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    };

    localStorage.setItem('sv_users', JSON.stringify([...users, newUser]));
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Sign Up</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="name">Full name</label>
        <input
          id="name"
          className="auth-input"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label className="auth-label" htmlFor="username">Username</label>
        <input
          id="username"
          className="auth-input"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label className="auth-label" htmlFor="email">Email</label>
        <input
          id="email"
          className="auth-input"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label className="auth-label" htmlFor="password">Password</label>
        <input
          id="password"
          className="auth-input"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label className="auth-label" htmlFor="role">Role</label>
        <select
          id="role"
          className="auth-select"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="auth-button" type="submit">Create Account</button>
      </form>

      <p className="auth-helper">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup;
