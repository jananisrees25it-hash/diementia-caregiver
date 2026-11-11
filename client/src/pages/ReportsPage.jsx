import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Info,
  Droplets,
  Pill,
  Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

export const ReportsPage = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const patientId = user?.role === 'caregiver' ? (user?.patientId || 'patient_demo_1') : (user?._id || user?.id || 'patient_demo_1');

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [scoreRes, remRes, patRes] = await Promise.all([
          apiRequest(`/scores?patientId=${patientId}`),
          apiRequest(`/reminders?patientId=${patientId}`),
          apiRequest(`/patients/${patientId}/summary`)
        ]);

        if (scoreRes.success) setScores(scoreRes.scores || []);
        if (remRes.success) setReminders(remRes.reminders || []);
        if (patRes.success) setPatient(patRes.patient || null);
      } catch (err) {
        console.error('Error loading reports analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [patientId]);

  // Aggregate metrics
  const completedReminders = reminders.filter(r => r.isCompleted);
  const missedReminders = reminders.filter(r => r.isMissed);
  const medicationReminders = reminders.filter(r => r.category === 'medication');
  const medicationDone = medicationReminders.filter(r => r.isCompleted).length;

  const medAdherence = medicationReminders.length > 0
    ? Math.round((medicationDone / medicationReminders.length) * 100)
    : 100;

  const totalScores = scores.map(s => s.score || 0);
  const avgScore = scores.length > 0
    ? Math.round(totalScores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const avgAccuracy = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + (b.accuracy || 0), 0) / scores.length)
    : 0;

  // Mock 7-day adherence for the weekly trend chart
  const weeklyDays = [
    { day: 'Mon', completed: 5, total: 6 },
    { day: 'Tue', completed: 6, total: 6 },
    { day: 'Wed', completed: 4, total: 6 },
    { day: 'Thu', completed: 6, total: 6 },
    { day: 'Fri', completed: 5, total: 6 },
    { day: 'Sat', completed: 6, total: 6 },
    { day: 'Sun', completed: completedReminders.length, total: reminders.length || 6 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Title & Print Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--blue-900)', marginBottom: '0.25rem' }}>
            Weekly Progress & Caregiver Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Comprehensive overview of daily routine adherence, hydration, and cognitive session history.
          </p>
        </div>

        <button 
          id="btn-print-report"
          className="btn btn-outline"
          onClick={() => window.print()}
          title="Print or Save PDF report"
        >
          <Printer size={18} /> Print / Save PDF Report
        </button>
      </div>

      {/* High-level Summary Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="card" style={{ borderLeft: '4px solid var(--green-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--green-700)', fontWeight: 600, fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} /> Routine Completion
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--green-600)', margin: '0.4rem 0' }}>
            {reminders.length > 0 ? Math.round((completedReminders.length / reminders.length) * 100) : 0}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {completedReminders.length} of {reminders.length} tasks completed today
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--purple-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--purple-700)', fontWeight: 600, fontSize: '0.9rem' }}>
            <Pill size={18} /> Medication Adherence
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--purple-600)', margin: '0.4rem 0' }}>
            {medAdherence}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {medicationDone} of {medicationReminders.length} doses taken
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--blue-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-700)', fontWeight: 600, fontSize: '0.9rem' }}>
            <Brain size={18} /> Avg Cognitive Score
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--blue-600)', margin: '0.4rem 0' }}>
            {avgScore} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>pts</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Across {scores.length} game sessions
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--amber-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--amber-700)', fontWeight: 600, fontSize: '0.9rem' }}>
            <Award size={18} /> Exercise Accuracy
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--amber-600)', margin: '0.4rem 0' }}>
            {avgAccuracy}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Recall & matching precision
          </div>
        </div>
      </section>

      {/* Visual Analytics Charts */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Chart 1: 7-Day Routine Adherence Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ fontSize: '1.25rem', color: 'var(--blue-900)' }}>
              <BarChart3 size={22} color="var(--blue-500)" /> 7-Day Daily Routine Adherence
            </h2>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Percentage of daily tasks, medications, and hydrations completed per day:
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '200px',
            paddingBottom: '2rem',
            borderBottom: '2px solid var(--border-color)',
            gap: '0.5rem'
          }}>
            {weeklyDays.map((d, idx) => {
              const pct = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
              const barHeight = Math.max(15, Math.round((pct / 100) * 160));

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pct >= 80 ? 'var(--green-700)' : 'var(--blue-700)' }}>
                    {pct}%
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '44px',
                      height: `${barHeight}px`,
                      borderRadius: '8px 8px 2px 2px',
                      background: pct >= 80 
                        ? 'linear-gradient(180deg, var(--green-500) 0%, var(--green-600) 100%)' 
                        : 'linear-gradient(180deg, var(--blue-500) 0%, var(--blue-600) 100%)',
                      transition: 'height 0.4s ease'
                    }}
                    title={`${d.day}: ${d.completed}/${d.total} tasks completed (${pct}%)`}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Cognitive Game Score Trend Line */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ fontSize: '1.25rem', color: 'var(--purple-900)' }}>
              <TrendingUp size={22} color="var(--purple-600)" /> Cognitive Session Scores Trend
            </h2>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Score progression across recent memory, pattern, number, and word games:
          </p>

          {/* SVG Line / Bar visualization */}
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '2rem', borderBottom: '2px solid var(--border-color)', gap: '0.75rem' }}>
            {scores.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', paddingTop: '3rem' }}>
                No game scores recorded yet.
              </div>
            ) : (
              scores.slice(-6).map((s, idx) => {
                const max = 1000;
                const height = Math.min(160, Math.max(30, Math.round((s.score / max) * 160)));
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple-700)' }}>
                      {s.score}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '38px',
                        height: `${height}px`,
                        borderRadius: '8px 8px 2px 2px',
                        background: 'linear-gradient(180deg, var(--purple-500) 0%, var(--purple-600) 100%)',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)'
                      }}
                      title={`${s.gameTitle}: ${s.score} pts (${s.accuracy}% accuracy)`}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60px' }}>
                      {s.gameType}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Detailed Status Breakdown: Completed vs Pending/Missed Routines */}
      <section className="card">
        <h2 style={{ fontSize: '1.4rem', color: 'var(--blue-900)', marginBottom: '1rem' }}>
          Scheduled Routine Status Log
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Completed */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--green-700)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} /> Completed Routines ({completedReminders.length})
            </h3>
            {completedReminders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No routines completed yet today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {completedReminders.map(rem => (
                  <div key={rem._id || rem.id} style={{
                    padding: '0.65rem 0.95rem',
                    backgroundColor: 'var(--green-50)',
                    border: '1px solid var(--green-200)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.92rem'
                  }}>
                    <span style={{ fontWeight: 600 }}>{rem.title}</span>
                    <span style={{ color: 'var(--green-800)', fontSize: '0.85rem' }}>⏰ {rem.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missed / Pending */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--coral-700)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <AlertTriangle size={18} /> Pending & Missed Routines ({reminders.length - completedReminders.length})
            </h3>
            {reminders.filter(r => !r.isCompleted).length === 0 ? (
              <p style={{ color: 'var(--green-600)', fontSize: '0.9rem', fontWeight: 600 }}>All tasks completed!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {reminders.filter(r => !r.isCompleted).map(rem => (
                  <div key={rem._id || rem.id} style={{
                    padding: '0.65rem 0.95rem',
                    backgroundColor: rem.isMissed ? 'var(--coral-50)' : 'var(--bg-card-subtle)',
                    border: `1px solid ${rem.isMissed ? 'var(--coral-300)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.92rem'
                  }}>
                    <span style={{ fontWeight: 600, color: rem.isMissed ? 'var(--coral-700)' : 'var(--text-main)' }}>
                      {rem.title} {rem.isMissed ? '(Missed Alert)' : ''}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>⏰ {rem.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Prominent Medical Disclaimer on Report */}
      <section style={{
        backgroundColor: '#fff',
        border: '2px solid var(--blue-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <Info size={26} color="var(--blue-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '1.1rem', color: 'var(--blue-900)', marginBottom: '0.35rem' }}>
            Clinical & Diagnostic Disclaimer for Caregivers & Observers
          </h4>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
            This summary report is generated purely for routine habit tracking and recreational cognitive engagement. Cognitive game scores, task adherence percentages, and completion times <strong>do not diagnose, stage, or measure any neurodegenerative disorder or medical condition</strong>. Please share these observations with qualified healthcare specialists for formal medical evaluations.
          </p>
        </div>
      </section>
    </div>
  );
};
