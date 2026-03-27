import '../styles/AuthStyles.css';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const roles = [
  { value: "vendor", label: "Vendor" },
  { value: "client", label: "Client" },
  { value: "procurement", label: "Procurement" },
  { value: "finance", label: "Finance" },
  { value: "admin", label: "Admin" },
];

function Signup() {
  const [role, setRole] = useState(roles[0].value);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const passwordValid = (pw) => {
    return (
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw) &&
      pw.length >= 8
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }
    if (!passwordValid(password)) {
      setError("Password must be at least 8 characters, include uppercase, lowercase, number, and special character.");
      return;
    }
    // Save user to localStorage (mock signup)
    localStorage.setItem("userRole", role);
    localStorage.setItem("username", username);
    // Redirect to login page after signup
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Role
          <select value={role} onChange={e => setRole(e.target.value)}>
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        <label>Username
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" className="sv-btn sv-btn-success sv-btn-highlight">Sign Up</button>
        <div style={{marginTop:8}}>
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
}

export default Signup;
