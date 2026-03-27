import '../styles/AuthStyles.css';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const roles = [
  { value: "admin", label: "Admin" },
  { value: "procurement", label: "Procurement" },
  { value: "vendor", label: "Vendor" },
  { value: "finance", label: "Finance" },
  { value: "client", label: "Client" },
];

function Login() {
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
    // Save role and username in localStorage (mock auth)
    localStorage.setItem("userRole", role);
    localStorage.setItem("username", username);
    // Redirect to dashboard
    switch (role) {
      case "admin":
        navigate("/admin"); break;
      case "procurement":
        navigate("/procurement"); break;
      case "vendor":
        navigate("/vendor"); break;
      case "finance":
        navigate("/finance"); break;
      case "client":
        navigate("/client"); break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
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
        <button type="submit" className="sv-btn sv-btn-success sv-btn-highlight">Login</button>
        <div style={{marginTop:8}}>
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
