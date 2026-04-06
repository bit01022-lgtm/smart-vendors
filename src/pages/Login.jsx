import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AuthStyles.css';
import { loginUser } from '../services/authService';

const rolePathMap = {
  admin: '/admin',
  client: '/client',
  procurement: '/procurement',
  vendor: '/vendor',
  finance: '/finance',
};

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const profile = await loginUser({
        identifier: form.identifier,
        password: form.password,
      });
      const rolePath = rolePathMap[profile.role] || '/client';

      navigate(rolePath);
    } catch (authError) {
      if (authError.message === 'EMAIL_REQUIRED') {
        setError('Please login using your email address.');
        return;
      }

      if (authError.code === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password.');
        return;
      }

      if (authError.code === 'UNAUTHORIZED' || authError.code === 'INVALID_TOKEN') {
        setError('Your session has expired. Please login again.');
        return;
      }

      if (authError.code === 'auth/operation-not-allowed') {
        setError('Email/password sign-in is currently disabled. Please contact support.');
        return;
      }

      if (authError.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
        return;
      }

      if (authError.code === 'auth/invalid-login-credentials') {
        setError('Invalid email or password.');
        return;
      }

      if (authError.code === 'auth/user-not-found') {
        setError('No account exists with that email.');
        return;
      }

      if (authError.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
        return;
      }

      if (authError.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait and try again.');
        return;
      }

      if (authError.code === 'auth/network-request-failed') {
        setError('Network issue detected. Check your connection and try again.');
        return;
      }

      if (authError.code === 'auth/invalid-api-key') {
        setError('Authentication configuration is invalid. Please contact support.');
        return;
      }

      if (authError.code === 'permission-denied') {
        setError('Access denied while loading profile. Please contact support.');
        return;
      }

      if (authError.message === 'PROFILE_NOT_FOUND') {
        setError('Account profile is missing. Please contact support.');
        return;
      }

      console.error('Login error:', authError);
      setError('Unable to login right now. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Login</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="identifier">Email</label>
        <input
          id="identifier"
          className="auth-input"
          name="identifier"
          type="text"
          autoComplete="username"
          value={form.identifier}
          onChange={handleChange}
          required
        />

        <label className="auth-label" htmlFor="password">Password</label>
        <input
          id="password"
          className="auth-input"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="auth-button" type="submit">Login</button>
      </form>

      <p className="auth-helper">
        No account yet? <Link to="/signup">Create one</Link>
      </p>
    </div>
  );
}

export default Login;
