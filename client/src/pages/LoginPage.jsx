import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, HeartHandshake, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage = ({ initialRole = 'patient', onNavigate }) => {
  const { login, demoLogin } = useAuth();
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your email and password');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'caregiver') {
        onNavigate('caregiver-dash');
      } else {
        onNavigate('patient-dash');
      }
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleDemoSignIn = async (demoRole) => {
    setLoading(true);
    const res = await demoLogin(demoRole);
    setLoading(false);

    if (res.success) {
      if (demoRole === 'caregiver') {
        onNavigate('caregiver-dash');
      } else {
        onNavigate('patient-dash');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--blue-500) 0%, var(--purple-500) 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <HeartHandshake size={32} />
          </div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--blue-900)', marginBottom: '0.35rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Sign in to access your personalized cognitive care dashboard
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-card-subtle)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          gap: '0.35rem'
        }}>
          <button
            type="button"
            className={`btn btn-sm ${role === 'patient' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, border: 'none' }}
            onClick={() => {
              setRole('patient');
              setEmail('patient@demo.com');
              setPassword('patient123');
            }}
          >
            👴 Patient
          </button>
          <button
            type="button"
            className={`btn btn-sm ${role === 'caregiver' ? 'btn-purple' : 'btn-outline'}`}
            style={{ flex: 1, border: 'none' }}
            onClick={() => {
              setRole('caregiver');
              setEmail('caregiver@demo.com');
              setPassword('caregiver123');
            }}
          >
            👩‍⚕️ Caregiver
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--coral-50)',
            color: 'var(--coral-700)',
            border: '1px solid var(--coral-200)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.92rem'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            <LogIn size={20} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Fast Fill & Login */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            ⚡ Quick Demo Logins (No password typing needed):
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => handleDemoSignIn('patient')}
            >
              Demo Patient
            </button>
            <button
              type="button"
              className="btn btn-purple btn-sm"
              style={{ flex: 1 }}
              onClick={() => handleDemoSignIn('caregiver')}
            >
              Demo Caregiver
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            style={{ color: 'var(--blue-600)', fontWeight: 700 }}
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
};
