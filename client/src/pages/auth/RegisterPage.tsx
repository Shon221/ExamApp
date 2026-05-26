import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import './AuthPages.css';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sessionUser = await register({ email, password, fullName, role });
    setLoading(false);
    if (sessionUser) {
      navigate(sessionUser.role === UserRole.Teacher ? '/teacher' : '/student');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Register</h1>
        <p className="auth-subtitle">Create a new account</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value={UserRole.Student}>Student</option>
              <option value={UserRole.Teacher}>Teacher</option>
            </select>
          </label>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
