import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  HeartHandshake, 
  Brain, 
  Activity, 
  FileText, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Eye, 
  Wifi, 
  WifiOff, 
  User, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ currentTab, onNavigate }) => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { 
    fontSize, 
    setFontSize, 
    highContrast, 
    setHighContrast, 
    ttsEnabled, 
    setTtsEnabled, 
    isOnline,
    speak 
  } = useAccessibility();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  const navTo = (tab) => {
    if (onNavigate) onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.85rem',
        paddingBottom: '0.85rem',
        gap: '1rem'
      }}>
        {/* Brand Logo & Title */}
        <div 
          onClick={() => navTo('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
          id="nav-brand-logo"
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--blue-500) 0%, var(--purple-500) 100%)',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
          }}>
            <HeartHandshake size={26} />
          </div>
          <div>
            <div style={{ 
              fontWeight: 800, 
              fontSize: '1.25rem', 
              color: 'var(--text-main)', 
              lineHeight: 1.1,
              letterSpacing: '-0.02em' 
            }}>
              CognitiveCare <span style={{ color: 'var(--blue-500)' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Cognitive Support & Caregiver Platform
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          <button 
            id="nav-link-home"
            className={`btn btn-sm ${currentTab === 'home' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => navTo('home')}
            style={{ border: 'none', fontWeight: currentTab === 'home' ? 700 : 500 }}
          >
            Home
          </button>

          {isAuthenticated && user?.role === 'patient' && (
            <button 
              id="nav-link-patient-dash"
              className={`btn btn-sm ${currentTab === 'patient-dash' ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => navTo('patient-dash')}
              style={{ border: 'none', fontWeight: currentTab === 'patient-dash' ? 700 : 500 }}
            >
              <Activity size={18} /> Patient Routine
            </button>
          )}

          {isAuthenticated && user?.role === 'caregiver' && (
            <button 
              id="nav-link-caregiver-dash"
              className={`btn btn-sm ${currentTab === 'caregiver-dash' ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => navTo('caregiver-dash')}
              style={{ border: 'none', fontWeight: currentTab === 'caregiver-dash' ? 700 : 500 }}
            >
              <Activity size={18} /> Caregiver Portal
            </button>
          )}

          <button 
            id="nav-link-games"
            className={`btn btn-sm ${currentTab === 'games' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => navTo('games')}
            style={{ border: 'none', fontWeight: currentTab === 'games' ? 700 : 500 }}
          >
            <Brain size={18} /> Cognitive Games
          </button>

          <button 
            id="nav-link-reports"
            className={`btn btn-sm ${currentTab === 'reports' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => navTo('reports')}
            style={{ border: 'none', fontWeight: currentTab === 'reports' ? 700 : 500 }}
          >
            <FileText size={18} /> Reports & Trends
          </button>
        </nav>

        {/* Right Accessibility & User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Online / Offline status */}
          <div 
            title={isOnline ? 'Online - Live backend active' : 'Offline - Local storage mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: isOnline ? 'var(--green-50)' : 'var(--coral-50)',
              color: isOnline ? 'var(--green-700)' : 'var(--coral-700)',
              border: `1px solid ${isOnline ? 'var(--green-200)' : 'var(--coral-200)'}`
            }}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span style={{ display: 'none' }} className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Text Size Switcher */}
          <button 
            id="accessibility-font-toggle"
            className="btn btn-outline btn-sm"
            onClick={cycleFontSize}
            title={`Adjust text size (Current: ${fontSize})`}
            style={{ padding: '0.4rem 0.75rem', fontWeight: 700 }}
          >
            A{fontSize === 'large' ? '+' : fontSize === 'xlarge' ? '++' : ''}
          </button>

          {/* High Contrast Toggle */}
          <button 
            id="accessibility-contrast-toggle"
            className={`btn btn-sm ${highContrast ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setHighContrast(!highContrast)}
            title="High Contrast Mode"
            style={{ padding: '0.4rem 0.65rem' }}
          >
            <Eye size={18} />
          </button>

          {/* Audio TTS Toggle */}
          <button 
            id="accessibility-tts-toggle"
            className={`btn btn-sm ${ttsEnabled ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
              if (!ttsEnabled) speak('Voice assistance activated');
            }}
            title={ttsEnabled ? 'Voice assistance enabled' : 'Voice assistance muted'}
            style={{ padding: '0.4rem 0.65rem' }}
          >
            {ttsEnabled ? <Volume2 size={18} color="var(--blue-600)" /> : <VolumeX size={18} />}
          </button>

          {/* User Status / Login */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  backgroundColor: user?.role === 'caregiver' ? 'var(--purple-50)' : 'var(--blue-50)',
                  border: `1px solid ${user?.role === 'caregiver' ? 'var(--purple-200)' : 'var(--blue-200)'}`,
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <img 
                  src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'} 
                  alt={user.name} 
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <span className={`badge ${user.role === 'caregiver' ? 'badge-purple' : 'badge-blue'}`} style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem' }}>
                  {user.role}
                </span>
              </div>

              <button 
                id="btn-logout"
                className="btn btn-outline btn-sm"
                onClick={() => { logout(); navTo('home'); }}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button 
                id="btn-nav-login"
                className="btn btn-primary btn-sm"
                onClick={() => navTo('login')}
              >
                Login
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button 
            className="btn btn-outline btn-sm mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ padding: '0.4rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-color)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button className="btn btn-outline" onClick={() => navTo('home')}>Home</button>
          {isAuthenticated && user?.role === 'patient' && (
            <button className="btn btn-secondary" onClick={() => navTo('patient-dash')}>
              <Activity size={18} /> Patient Routine Dashboard
            </button>
          )}
          {isAuthenticated && user?.role === 'caregiver' && (
            <button className="btn btn-purple" onClick={() => navTo('caregiver-dash')}>
              <Activity size={18} /> Caregiver Portal
            </button>
          )}
          <button className="btn btn-outline" onClick={() => navTo('games')}>
            <Brain size={18} /> Cognitive Games
          </button>
          <button className="btn btn-outline" onClick={() => navTo('reports')}>
            <FileText size={18} /> Reports & Trends
          </button>
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navTo('login')}>Login</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navTo('register')}>Register</button>
            </div>
          )}
        </div>
      )}

      {/* Style for responsive navbar elements */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .status-text { display: inline !important; }
        }
      `}</style>
    </header>
  );
};
