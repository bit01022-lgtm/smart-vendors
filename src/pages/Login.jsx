import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="mx-auto mt-16 w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/60">
      <h2 className="mb-4 text-center text-2xl font-semibold text-slate-900">Login</h2>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-slate-700" htmlFor="identifier">Email</label>
        <input
          id="identifier"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          name="identifier"
          type="text"
          autoComplete="username"
          value={form.identifier}
          onChange={handleChange}
          required
        />

        <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
        <input
          id="password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          type="submit"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        No account yet? <Link className="font-semibold text-blue-600 hover:underline" to="/signup">Create one</Link>
      </p>
    </div>
  );
}

export default Login;
