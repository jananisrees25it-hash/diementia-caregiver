import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HeartHandshake, 
  Brain, 
  Bell, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  PhoneCall, 
  Droplets,
  Calendar,
  Activity
} from 'lucide-react';

export const HomePage = ({ onNavigate }) => {
  const { demoLogin, isAuthenticated, user } = useAuth();

  const handleQuickDemo = async (role) => {
    const res = await demoLogin(role);
    if (res.success) {
      if (role === 'patient') {
        onNavigate('patient-dash');
      } else {
        onNavigate('caregiver-dash');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, var(--blue-50) 0%, rgba(240, 249, 255, 0.4) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '3.5rem 1.5rem',
        border: '1px solid var(--blue-100)',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#ffffff',
            padding: '0.45rem 1.1rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--blue-200)',
            color: 'var(--blue-700)',
            fontWeight: 700,
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.12)'
          }}>
            <Sparkles size={16} /> Empowering Cognitive Wellness & Family Peace of Mind
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            color: 'var(--blue-900)',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em'
          }}>
            AI-Powered Cognitive Support & Caregiver Assistance
          </h1>

          <p style={{
            fontSize: 'clamp(1.15rem, 2.5vw, 1.4rem)',
            color: 'var(--blue-700)',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            “Supporting Every Memory, Empowering Every Caregiver.”
          </p>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            maxWidth: '680px',
            margin: '0 auto 2.25rem auto'
          }}>
            A calming, accessible platform built with large tactile buttons and voice support for people experiencing memory difficulties, paired with real-time routine monitoring and analytics for devoted caregivers.
          </p>

          {/* Primary Action Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {isAuthenticated ? (
              <button 
                id="btn-hero-goto-dashboard"
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate(user?.role === 'caregiver' ? 'caregiver-dash' : 'patient-dash')}
              >
                Go to Your {user?.role === 'caregiver' ? 'Caregiver Portal' : 'Routine Dashboard'} <ArrowRight size={20} />
              </button>
            ) : (
              <>
                <button 
                  id="btn-hero-patient-login"
                  className="btn btn-primary btn-lg"
                  onClick={() => onNavigate('login', { role: 'patient' })}
                >
                  Patient Login
                </button>
                <button 
                  id="btn-hero-caregiver-login"
                  className="btn btn-purple btn-lg"
                  onClick={() => onNavigate('login', { role: 'caregiver' })}
                >
                  Caregiver Login
                </button>
                <button 
                  id="btn-hero-get-started"
                  className="btn btn-outline btn-lg"
                  onClick={() => onNavigate('register')}
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>

          {/* 1-Click Demonstration Fast Login Card */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '2px dashed var(--blue-300)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-md)',
            maxWidth: '560px',
            width: '100%'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--blue-800)' }}>
              ⚡ 1-Click Demonstration Accounts (Evaluation & Presentation):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', width: '100%' }}>
              <button
                id="btn-quick-patient-demo"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo('patient')}
                style={{ flex: '1 1 200px' }}
              >
                👴 Enter as Patient (Robert, Age 74)
              </button>
              <button
                id="btn-quick-caregiver-demo"
                className="btn btn-purple btn-sm"
                onClick={() => handleQuickDemo('caregiver')}
                style={{ flex: '1 1 200px' }}
              >
                👩‍⚕️ Enter as Caregiver (Sarah Vance)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          <h2 style={{ fontSize: '2.1rem', color: 'var(--text-main)', marginBottom: '0.65rem' }}>
            Comprehensive Care in One Gentle Platform
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Designed specifically with high-contrast accessibility, elderly comfort, and medical privacy in mind.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Smart Reminders */}
          <div className="card">
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'var(--blue-100)',
              color: 'var(--blue-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Bell size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--blue-900)' }}>
              Smart Daily Reminders
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.55' }}>
              Clear audio & visual alerts for medications, fresh water hydration, morning walks, and medical appointments with simple one-tap completion.
            </p>
          </div>

          {/* Cognitive Games */}
          <div className="card">
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'var(--purple-100)',
              color: 'var(--purple-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Brain size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--purple-900)' }}>
              Adaptive Cognitive Games
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.55' }}>
              Memory matching, pattern retention, number sequencing, and word recall. Rule-based AI automatically tailors difficulty for supportive engagement.
            </p>
          </div>

          {/* Caregiver Monitoring */}
          <div className="card">
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'var(--green-100)',
              color: 'var(--green-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Users size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--green-900)' }}>
              Caregiver Monitoring
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.55' }}>
              Real-time daily activity tracking, missed medication alert badges, caregiver observation notes, and full reminder scheduling control.
            </p>
          </div>

          {/* Progress Tracking */}
          <div className="card">
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'var(--amber-100)',
              color: 'var(--amber-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Activity size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--amber-900)' }}>
              Progress Trends & Analytics
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.55' }}>
              Visual weekly charts, memory exercise score trends, and hydration adherence reports to share with family or physicians.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            How CognitiveCare Works
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            A synchronized four-step care loop uniting the patient, caregiver, and supportive AI.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.75rem'
        }}>
          {[
            {
              step: '1',
              title: 'Schedule Routines',
              desc: 'Caregivers set medication times, hydration goals, and doctor appointments with custom notes.'
            },
            {
              step: '2',
              title: 'Gentle Reminders',
              desc: 'Patients receive high-contrast visual cues and spoken audio instructions at the scheduled times.'
            },
            {
              step: '3',
              title: 'Adaptive Play',
              desc: 'Patients play daily memory games. The AI tracks accuracy and adjusts difficulty automatically.'
            },
            {
              step: '4',
              title: 'Stay Connected',
              desc: 'Caregivers receive real-time updates and emergency alerts if assistance is ever required.'
            }
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--blue-500)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}>
                {item.step}
              </div>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--blue-900)' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Assistance Preview Card */}
      <section style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        border: '2px solid #fecdd3',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#be123c', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
            <PhoneCall size={16} /> Instant Safety Net
          </div>
          <h3 style={{ fontSize: '1.65rem', color: '#9f1239', marginBottom: '0.5rem' }}>
            Always One Tap Away from Family & Caregivers
          </h3>
          <p style={{ color: '#881337', fontSize: '1rem', lineHeight: '1.55' }}>
            The patient dashboard features an oversized, voice-guided Emergency Contact button that dials family caregivers instantly and broadcasts an urgent location beacon.
          </p>
        </div>

        <button 
          id="btn-preview-emergency-support"
          className="btn btn-emergency"
          onClick={() => onNavigate('patient-dash')}
        >
          <PhoneCall size={22} /> View Patient Safety Bar
        </button>
      </section>
    </div>
  );
};
