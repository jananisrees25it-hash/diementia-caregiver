import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OfflineBanner } from './components/OfflineBanner';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { CaregiverDashboard } from './pages/CaregiverDashboard';
import { CognitiveGamesPage } from './pages/CognitiveGamesPage';
import { ReportsPage } from './pages/ReportsPage';

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');
  const [navigationParams, setNavigationParams] = useState({});

  // Sync hash routing if desired
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setCurrentTab(hash);
    };

    window.addEventListener('hashchange', handleHash);
    if (window.location.hash) {
      handleHash();
    }
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (tab, params = {}) => {
    setCurrentTab(tab);
    setNavigationParams(params);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <OfflineBanner />
      <Navbar currentTab={currentTab} onNavigate={navigateTo} />

      <main className="main-content">
        <div className="container">
          {currentTab === 'home' && (
            <HomePage onNavigate={navigateTo} />
          )}

          {currentTab === 'login' && (
            <LoginPage initialRole={navigationParams.role || 'patient'} onNavigate={navigateTo} />
          )}

          {currentTab === 'register' && (
            <RegisterPage onNavigate={navigateTo} />
          )}

          {currentTab === 'patient-dash' && (
            <PatientDashboard onNavigate={navigateTo} />
          )}

          {currentTab === 'caregiver-dash' && (
            <CaregiverDashboard onNavigate={navigateTo} />
          )}

          {currentTab === 'games' && (
            <CognitiveGamesPage initialGameId={navigationParams.gameId || null} onNavigate={navigateTo} />
          )}

          {currentTab === 'reports' && (
            <ReportsPage onNavigate={navigateTo} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <AppContent />
      </AccessibilityProvider>
    </AuthProvider>
  );
}
