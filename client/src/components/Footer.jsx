import React from 'react';
import { HeartHandshake, ShieldCheck, PhoneCall, Info } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#cbd5e1',
      paddingTop: '3rem',
      paddingBottom: '2.5rem',
      borderTop: '1px solid #1e293b',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #8b5cf6 100%)',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <HeartHandshake size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                CognitiveCare <span style={{ color: '#38bdf8' }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#94a3b8', marginBottom: '1rem' }}>
              Supporting Every Memory, Empowering Every Caregiver. A compassionate, intelligent platform providing daily routine stability, memory reinforcement, and caregiver peace of mind.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.88rem', fontWeight: 600 }}>
              <ShieldCheck size={18} /> Built with Privacy-First Architecture
            </div>
          </div>

          {/* Quick Support & Emergency */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneCall size={18} color="#f43f5e" /> Emergency & Helpline
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              In any urgent medical emergency, call <strong>911</strong> (US) or local emergency services immediately.
            </p>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: '1px solid #334155',
              fontSize: '0.88rem'
            }}>
              <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '0.2rem' }}>
                24/7 Caregiver Support Hotline:
              </div>
              <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '1.05rem' }}>
                +1 (800) 272-3900 (Alzheimer's Assoc.)
              </div>
            </div>
          </div>

          {/* Medical & Legal Disclaimer */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} color="#38bdf8" /> Medical Disclaimer
            </h4>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #334155',
              fontSize: '0.84rem',
              lineHeight: '1.55',
              color: '#94a3b8'
            }}>
              <strong>Important Notice:</strong> CognitiveCare AI is a supportive cognitive exercise and daily routine assistant. It is strictly for engagement, habit reinforcement, and caregiver coordination. It is <em>not</em> a medical diagnostic instrument, therapy device, or substitute for physician consultation.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.85rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} AI-Powered Cognitive Support & Caregiver Assistance Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Accessibility Standards (WCAG 2.1)</span>
            <span>Terms of Care</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
