import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AuthStyles.css';
import { registerUser } from '../services/authService';

const roleOptions = ['client', 'procurement', 'vendor', 'finance', 'admin'];

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await registerUser(form);
      navigate('/login');
    } catch (authError) {
      if (authError.message === 'USERNAME_TAKEN') {
        setError('That username is already taken.');
        return;
      }

      if (authError.code === 'USERNAME_TAKEN') {
        setError('That username is already taken.');
        return;
      }

      if (authError.code === 'EMAIL_IN_USE') {
        setError('That email is already registered.');
        return;
      }

      if (authError.code === 'WEAK_PASSWORD') {
        setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
        return;
      }

      if (authError.code === 'INVALID_ROLE') {
        setError('Selected role is not allowed for self-signup.');
        return;
      }

      if (authError.code === 'auth/email-already-in-use') {
        setError('That email is already registered.');
        return;
      }

      if (authError.code === 'auth/weak-password') {
        setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
        return;
      }
      if (authError.code === 'permission-denied') {
        setError('Selected role is not allowed for self-signup.');
        return;
      }

      setError('Unable to create account right now. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Sign Up</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
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
          type="text"
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
