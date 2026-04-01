import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AuthStyles.css';

const rolePathMap = {
  admin: '/admin',
  client: '/client',
  procurement: '/procurement',
  vendor: '/vendor',
  finance: '/finance',
};

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('sv_users') || '[]');
    const user = users.find(
      (item) => item.username === form.username.trim() && item.password === form.password
    );

    if (!user) {
      setError('Invalid username or password.');
      return;
    }

    const rolePath = rolePathMap[user.role] || '/client';
    localStorage.setItem('sv_session', JSON.stringify({ username: user.username, role: user.role }));
    navigate(rolePath);
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Login</h2>
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
