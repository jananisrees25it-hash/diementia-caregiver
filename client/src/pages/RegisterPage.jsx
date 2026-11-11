import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, HeartHandshake, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState(role === 'patient' ? 72 : 40);
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await register({
      name,
      email,
      password,
      role,
      age: Number(age),
      emergencyContact: {
        name: emergencyName || 'Family Caregiver',
        relation: role === 'patient' ? 'Primary Caregiver' : 'Patient Family',
        phone: emergencyPhone || '+1 (555) 234-5678',
        alternatePhone: ''
      },
      medicalNotes
    });
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'caregiver') {
        onNavigate('caregiver-dash');
      } else {
        onNavigate('patient-dash');
      }
    } else {
      setError(res.message || 'Registration failed. Please check form inputs.');
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--green-500) 0%, var(--blue-500) 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <HeartHandshake size={32} />
          </div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--blue-900)', marginBottom: '0.35rem' }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Join the cognitive support & caregiver network
          </p>
        </div>

        {/* Role Selection */}
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
              setAge(72);
            }}
          >
            👴 I am a Patient
          </button>
          <button
            type="button"
            className={`btn btn-sm ${role === 'caregiver' ? 'btn-purple' : 'btn-outline'}`}
            style={{ flex: 1, border: 'none' }}
            onClick={() => {
              setRole('caregiver');
              setAge(42);
            }}
          >
            👩‍⚕️ I am a Caregiver
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
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder={role === 'patient' ? 'e.g. Robert Vance' : 'e.g. Sarah Vance'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password (minimum 6 characters)</label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-age">Age</label>
              <input
                id="reg-age"
                type="number"
                className="form-input"
                min="18"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-emergency-phone">
                {role === 'patient' ? 'Caregiver Phone' : 'Contact Phone'}
              </label>
              <input
                id="reg-emergency-phone"
                type="tel"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
              />
            </div>
          </div>

          {role === 'patient' && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-notes">Health / Routine Notes (Optional)</label>
              <textarea
                id="reg-notes"
                className="form-textarea"
                rows="2"
                placeholder="e.g. Gentle morning reminders, memory exercises, routine tracking"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
              />
            </div>
          )}

          <button
            id="btn-submit-register"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem', marginBottom: '1rem' }}
            disabled={loading}
          >
            <UserPlus size={20} /> {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            style={{ color: 'var(--blue-600)', fontWeight: 700 }}
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
