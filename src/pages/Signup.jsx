import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="mx-auto mt-16 w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/60">
      <h2 className="mb-4 text-center text-2xl font-semibold text-slate-900">Sign Up</h2>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-slate-700" htmlFor="username">Username</label>
        <input
          id="username"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
        <input
          id="email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
        <input
          id="password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          name="password"
          type="text"
          value={form.password}
          onChange={handleChange}
          required
        />
        <label className="text-sm font-medium text-slate-700" htmlFor="role">Role</label>
        <select
          id="role"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
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

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          type="submit"
        >
          Create Account
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Already registered? <Link className="font-semibold text-blue-600 hover:underline" to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup;
