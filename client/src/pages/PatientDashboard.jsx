import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Droplets, 
  Pill, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Volume2, 
  PhoneCall, 
  Brain, 
  Clock, 
  Sparkles, 
  Filter, 
  ChevronRight,
  Sun,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { apiRequest } from '../utils/api';
import { 
  saveRemindersOffline, 
  getRemindersOffline, 
  queueOfflineAction 
} from '../utils/offlineStorage';
import { EmergencyModal } from '../components/EmergencyModal';
import { VoiceAssistant } from '../components/VoiceAssistant';

export const PatientDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const { speak, isOnline } = useAccessibility();

  const [reminders, setReminders] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [waterCups, setWaterCups] = useState(5);
  const [waterGoal, setWaterGoal] = useState(8);
  const [loading, setLoading] = useState(true);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const patientId = user?._id || user?.id || 'patient_demo_1';

  // Load reminders & daily data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        const [remRes, sumRes] = await Promise.all([
          apiRequest(`/reminders?patientId=${patientId}`),
          apiRequest(`/patients/${patientId}/summary`)
        ]);

        if (remRes.success) {
          setReminders(remRes.reminders || []);
          saveRemindersOffline(remRes.reminders || []);
        }

        if (sumRes.success && sumRes.summary) {
          setWaterCups(sumRes.summary.waterGlasses || 0);
          setWaterGoal(sumRes.summary.waterGoal || 8);
        }
      } else {
        // Load from local storage cache
        const offlineData = getRemindersOffline();
        setReminders(offlineData);
      }
    } catch (err) {
      console.warn('Network issue loading patient dashboard, using offline cache:', err);
      const offlineData = getRemindersOffline();
      setReminders(offlineData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [patientId, isOnline]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Toggle reminder completion
  const handleToggleReminder = async (rem) => {
    const newStatus = !rem.isCompleted;
    const updatedList = reminders.map(r => 
      (r._id === rem._id || r.id === rem.id) 
        ? { ...r, isCompleted: newStatus, completedAt: newStatus ? new Date() : null } 
        : r
    );
    setReminders(updatedList);
    saveRemindersOffline(updatedList);

    if (newStatus) {
      speak(`Wonderful! You finished ${rem.title}.`);
      try {
        confetti({ particleCount: 45, spread: 50, origin: { y: 0.7 } });
      } catch (e) {}
      showToast(`Great job! Completed: ${rem.title}`);
    } else {
      speak(`Reset ${rem.title} to pending.`);
    }

    if (isOnline) {
      try {
        await apiRequest(`/reminders/${rem._id || rem.id}/toggle`, { method: 'PATCH' });
      } catch (err) {
        queueOfflineAction({ id: rem._id || rem.id, isCompleted: newStatus });
      }
    } else {
      queueOfflineAction({ id: rem._id || rem.id, isCompleted: newStatus });
      showToast('Saved offline. Will sync automatically when online returns.');
    }
  };

  // Drink a glass of water
  const handleDrinkWater = async () => {
    const newCount = waterCups + 1;
    setWaterCups(newCount);
    speak(`Logged 1 fresh glass of water. Total today: ${newCount} cups. Great job staying hydrated!`);
    try {
      confetti({ particleCount: 35, spread: 45, origin: { y: 0.6 } });
    } catch (e) {}
    showToast(`Hydration recorded: ${newCount} of ${waterGoal} cups`);

    if (isOnline) {
      try {
        await apiRequest(`/patients/${patientId}/water`, {
          method: 'POST',
          body: JSON.stringify({ action: 'add' })
        });
      } catch (e) {
        console.warn('Failed to record water online:', e);
      }
    }
  };

  // Read all pending reminders out loud
  const handleReadRemindersAloud = () => {
    const pending = reminders.filter(r => !r.isCompleted);
    if (pending.length === 0) {
      speak("Wonderful! All your daily tasks and medications are completed for today!");
      return;
    }

    const textToSpeak = `Hello ${user?.name ? user.name.split(' ')[0] : 'friend'}! You have ${pending.length} pending items today. ` +
      pending.map(r => `At ${r.time}, ${r.title}. ${r.dosage ? `Dosage: ${r.dosage}.` : ''}`).join(' ');
    speak(textToSpeak);
  };

  // Filter reminders
  const filteredReminders = reminders.filter(r => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'medication') return r.category === 'medication';
    if (activeCategory === 'water') return r.category === 'water';
    if (activeCategory === 'appointment') return r.category === 'appointment';
    if (activeCategory === 'routine') return r.category === 'routine' || r.category === 'task';
    return true;
  });

  const completedCount = reminders.filter(r => r.isCompleted).length;
  const progressPercent = reminders.length > 0 ? Math.round((completedCount / reminders.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: 'var(--green-600)',
          color: '#fff',
          padding: '0.85rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 200,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.25s ease'
        }}>
          <CheckCircle2 size={20} /> {toastMessage}
        </div>
      )}

      {/* Patient Welcome Header Card */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '1.5px solid var(--blue-200)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'}
            alt={user?.name || 'Robert Vance'}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              objectFit: 'cover'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <Sun size={20} color="#f59e0b" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--blue-700)' }}>
                Good day, {user?.name ? user.name.split(' ')[0] : 'Robert'}!
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', color: 'var(--blue-900)', marginBottom: '0.25rem' }}>
              {user?.name || 'Robert Vance'} (Age {user?.age || 74})
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Primary Caregiver: <strong>{user?.emergencyContact?.name || 'Sarah Vance'}</strong></span>
              <span>•</span>
              <span className="badge badge-green">Routine Active</span>
            </div>
          </div>
        </div>

        {/* Large Emergency Contact Button */}
        <div>
          <button
            id="btn-patient-emergency"
            className="btn btn-emergency"
            onClick={() => setIsEmergencyModalOpen(true)}
            title="Tap for immediate emergency assistance"
          >
            <PhoneCall size={26} /> EMERGENCY HELP
          </button>
        </div>
      </section>

      {/* Voice Assistant & Audio Controls */}
      <VoiceAssistant
        onCommand={(cmd) => {
          if (cmd === 'read-reminders') handleReadRemindersAloud();
          if (cmd === 'drink-water') handleDrinkWater();
          if (cmd === 'open-games') onNavigate('games');
          if (cmd === 'open-emergency') setIsEmergencyModalOpen(true);
        }}
      />

      {/* Daily Progress & Hydration Grid */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Daily Checklist Progress Overview */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ fontSize: '1.25rem', color: 'var(--blue-900)' }}>
              <CheckCircle2 size={24} color="var(--green-500)" /> Today's Routine Progress
            </h2>
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleReadRemindersAloud}
              title="Listen to all pending tasks"
            >
              <Volume2 size={16} /> Read Out Loud
            </button>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700 }}>
              <span>{completedCount} of {reminders.length} Routines Completed</span>
              <span style={{ color: 'var(--green-600)' }}>{progressPercent}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${progressPercent}%`, 
                  background: 'linear-gradient(90deg, var(--green-500) 0%, var(--green-600) 100%)' 
                }} 
              />
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {progressPercent === 100 
              ? '🌟 Outstanding! You have completed all scheduled medications and routines for today!' 
              : `You have ${reminders.length - completedCount} upcoming reminders. Check them below!`}
          </p>
        </div>

        {/* Water Drinking Reminder Tracker */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ fontSize: '1.25rem', color: 'var(--blue-900)' }}>
              <Droplets size={24} color="var(--blue-500)" /> Water Drinking Tracker
            </h2>
            <span className="badge badge-blue">{waterCups} / {waterGoal} Cups</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            margin: '1rem 0'
          }}>
            {Array.from({ length: waterGoal }).map((_, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '1.8rem',
                  opacity: idx < waterCups ? 1 : 0.25,
                  filter: idx < waterCups ? 'none' : 'grayscale(1)',
                  transition: 'all 0.2s ease'
                }}
                title={`Cup ${idx + 1}`}
              >
                💧
              </span>
            ))}
          </div>

          <button
            id="btn-drink-water"
            className="btn btn-secondary btn-lg"
            style={{ width: '100%', fontWeight: 700 }}
            onClick={handleDrinkWater}
          >
            <Droplets size={22} /> + I Drank a Glass of Water
          </button>
        </div>
      </section>

      {/* Daily Routine and Medication Reminders Section */}
      <section className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--blue-900)' }}>
              Daily Tasks & Medication Checklist
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Tap any item when you have finished it. Large clear buttons make tracking simple.
            </p>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'medication', label: '💊 Medications' },
              { id: 'routine', label: '🚶 Routines' },
              { id: 'water', label: '💧 Water' },
              { id: 'appointment', label: '🗓️ Appointments' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`btn btn-sm ${activeCategory === tab.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reminders List */}
        {filteredReminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem' }}>No reminders found in this category.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredReminders.map(rem => {
              const isMed = rem.category === 'medication';
              const isAppt = rem.category === 'appointment';

              return (
                <div
                  key={rem._id || rem.id}
                  style={{
                    backgroundColor: rem.isCompleted ? 'var(--green-50)' : 'var(--bg-surface)',
                    border: `2px solid ${rem.isCompleted ? 'var(--green-300)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: '1 1 300px' }}>
                    <div style={{
                      backgroundColor: rem.isCompleted 
                        ? 'var(--green-100)' 
                        : isMed 
                        ? 'var(--purple-100)' 
                        : isAppt 
                        ? 'var(--amber-100)' 
                        : 'var(--blue-100)',
                      color: rem.isCompleted 
                        ? 'var(--green-700)' 
                        : isMed 
                        ? 'var(--purple-700)' 
                        : isAppt 
                        ? 'var(--amber-700)' 
                        : 'var(--blue-700)',
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isMed ? <Pill size={24} /> : isAppt ? <Calendar size={24} /> : <Clock size={24} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: rem.isCompleted ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: rem.isCompleted ? 'line-through' : 'none' }}>
                          {rem.title}
                        </span>
                        <span className="badge badge-blue" style={{ fontSize: '0.8rem' }}>
                          ⏰ {rem.time}
                        </span>
                        {rem.priority === 'high' && (
                          <span className="badge badge-coral" style={{ fontSize: '0.75rem' }}>Important</span>
                        )}
                      </div>

                      {rem.description && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                          {rem.description}
                        </p>
                      )}

                      {rem.dosage && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--purple-700)', fontWeight: 600 }}>
                          Dosage: {rem.dosage}
                        </div>
                      )}

                      {rem.location && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--amber-700)', fontWeight: 600 }}>
                          📍 Location: {rem.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Speak Audio & Checkbox Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      className="btn btn-outline btn-icon"
                      onClick={() => speak(`${rem.title}. Scheduled for ${rem.time}. ${rem.description || ''} ${rem.dosage || ''}`)}
                      title="Read this reminder aloud"
                    >
                      <Volume2 size={20} />
                    </button>

                    <button
                      id={`btn-toggle-rem-${rem._id || rem.id}`}
                      className={`btn ${rem.isCompleted ? 'btn-success' : 'btn-primary'}`}
                      style={{ minWidth: '150px' }}
                      onClick={() => handleToggleReminder(rem)}
                    >
                      {rem.isCompleted ? (
                        <>
                          <CheckCircle2 size={20} /> Done!
                        </>
                      ) : (
                        <>
                          <Circle size={20} /> Mark as Done
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cognitive Games Launch Hub */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, var(--purple-50) 0%, #ffffff 100%)',
        border: '1.5px solid var(--purple-200)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--purple-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={26} color="var(--purple-600)" /> Daily Cognitive Games & Brain Practice
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Gentle puzzles designed to stimulate recall, concentration, and pattern recognition.
            </p>
          </div>

          <button className="btn btn-purple" onClick={() => onNavigate('games')}>
            Open Game Studio <ChevronRight size={18} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {[
            { id: 'memory', title: 'Memory Cards', emoji: '🎴', desc: 'Flip and match card pairs' },
            { id: 'pattern', title: 'Pattern Sequence', emoji: '💡', desc: 'Repeat flashing colors' },
            { id: 'number', title: 'Number Crunch', emoji: '🔢', desc: 'Order numbers & simple math' },
            { id: 'word', title: 'Word Recall', emoji: '📖', desc: 'Unscramble peaceful words' }
          ].map(g => (
            <div
              key={g.id}
              className="card card-interactive"
              onClick={() => onNavigate('games', { gameId: g.id })}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--purple-100)',
                padding: '1.25rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>{g.emoji}</div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{g.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.85rem' }}>{g.desc}</p>
              <button className="btn btn-outline btn-sm" style={{ width: '100%' }}>Play Now</button>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Contact Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        patient={user}
      />
    </div>
  );
};
