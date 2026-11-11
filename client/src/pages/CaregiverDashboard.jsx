import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Calendar, 
  Clock, 
  Pill, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  FileText, 
  Brain, 
  X, 
  Award,
  Bell,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { apiRequest } from '../utils/api';

export const CaregiverDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const { speak } = useAccessibility();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('patient_demo_1');
  const [patientData, setPatientData] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [scores, setScores] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    category: 'medication',
    time: '09:00 AM',
    date: 'Daily',
    priority: 'medium',
    recurrence: 'daily',
    dosage: '',
    location: ''
  });

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'Observation',
    priority: 'normal'
  });

  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    type: null, // 'reminder' | 'note'
    id: null,
    title: ''
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Load Patient list & selected patient summary
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [patientsRes, summaryRes] = await Promise.all([
        apiRequest('/patients'),
        apiRequest(`/patients/${selectedPatientId}/summary`)
      ]);

      if (patientsRes.success) {
        setPatients(patientsRes.patients || []);
      }

      if (summaryRes.success) {
        setPatientData(summaryRes.patient);
        setReminders(summaryRes.reminders || []);
        setScores(summaryRes.recentScores || []);
        setNotes(summaryRes.recentNotes || []);
      }
    } catch (err) {
      console.error('Error loading caregiver dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedPatientId]);

  // Open Reminder Modal for Add or Edit
  const openReminderModal = (rem = null) => {
    if (rem) {
      setEditingReminder(rem);
      setReminderForm({
        title: rem.title || '',
        description: rem.description || '',
        category: rem.category || 'medication',
        time: rem.time || '09:00 AM',
        date: rem.date || 'Daily',
        priority: rem.priority || 'medium',
        recurrence: rem.recurrence || 'daily',
        dosage: rem.dosage || '',
        location: rem.location || ''
      });
    } else {
      setEditingReminder(null);
      setReminderForm({
        title: '',
        description: '',
        category: 'medication',
        time: '09:00 AM',
        date: 'Daily',
        priority: 'medium',
        recurrence: 'daily',
        dosage: '',
        location: ''
      });
    }
    setIsReminderModalOpen(true);
  };

  // Save Reminder
  const handleSaveReminder = async (e) => {
    e.preventDefault();
    try {
      if (editingReminder) {
        const res = await apiRequest(`/reminders/${editingReminder._id || editingReminder.id}`, {
          method: 'PUT',
          body: JSON.stringify(reminderForm)
        });
        if (res.success) {
          showToast('Reminder updated successfully!');
        }
      } else {
        const res = await apiRequest('/reminders', {
          method: 'POST',
          body: JSON.stringify({
            ...reminderForm,
            patientId: selectedPatientId
          })
        });
        if (res.success) {
          showToast('New reminder created successfully!');
        }
      }
      setIsReminderModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert(`Error saving reminder: ${err.message}`);
    }
  };

  // Toggle Reminder Completed / Missed
  const handleToggleReminderStatus = async (rem, forceMissed = false) => {
    try {
      if (forceMissed) {
        await apiRequest(`/reminders/${rem._id || rem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ isMissed: !rem.isMissed, isCompleted: false })
        });
        showToast(!rem.isMissed ? 'Reminder marked as MISSED alert!' : 'Missed alert cleared.');
      } else {
        await apiRequest(`/reminders/${rem._id || rem.id}/toggle`, {
          method: 'PATCH'
        });
        showToast('Reminder status toggled!');
      }
      loadDashboardData();
    } catch (err) {
      alert(`Error updating reminder: ${err.message}`);
    }
  };

  // Delete Reminder Confirmation
  const confirmDelete = async () => {
    const { type, id } = deleteConfirmModal;
    try {
      if (type === 'reminder') {
        await apiRequest(`/reminders/${id}`, { method: 'DELETE' });
        showToast('Reminder removed successfully.');
      } else if (type === 'note') {
        await apiRequest(`/notes/${id}`, { method: 'DELETE' });
        showToast('Caregiver note removed.');
      }
      setDeleteConfirmModal({ isOpen: false, type: null, id: null, title: '' });
      loadDashboardData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Open Note Modal
  const openNoteModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({
        title: note.title || '',
        content: note.content || '',
        category: note.category || 'Observation',
        priority: note.priority || 'normal'
      });
    } else {
      setEditingNote(null);
      setNoteForm({
        title: '',
        content: '',
        category: 'Observation',
        priority: 'normal'
      });
    }
    setIsNoteModalOpen(true);
  };

  // Save Note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await apiRequest(`/notes/${editingNote._id || editingNote.id}`, {
          method: 'PUT',
          body: JSON.stringify(noteForm)
        });
        showToast('Caregiver note updated successfully!');
      } else {
        await apiRequest('/notes', {
          method: 'POST',
          body: JSON.stringify({
            ...noteForm,
            patientId: selectedPatientId
          })
        });
        showToast('New caregiver note logged!');
      }
      setIsNoteModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert(`Error saving note: ${err.message}`);
    }
  };

  // Filter reminders
  const filteredReminders = reminders.filter(r => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (statusFilter === 'completed' && !r.isCompleted) return false;
    if (statusFilter === 'pending' && r.isCompleted) return false;
    if (statusFilter === 'missed' && !r.isMissed) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title && r.title.toLowerCase().includes(q);
      const matchDesc = r.description && r.description.toLowerCase().includes(q);
      const matchDosage = r.dosage && r.dosage.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDosage) return false;
    }
    return true;
  });

  const completedCount = reminders.filter(r => r.isCompleted).length;
  const missedCount = reminders.filter(r => r.isMissed).length;
  const pendingCount = reminders.length - completedCount;
  const completionRate = reminders.length > 0 ? Math.round((completedCount / reminders.length) * 100) : 0;

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

      {/* Caregiver Portal Header */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, var(--purple-50) 0%, #ffffff 100%)',
        border: '1.5px solid var(--purple-200)',
        padding: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'var(--purple-500)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}>
            <Users size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="badge badge-purple">Caregiver Monitoring Portal</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Logged in as {user?.name || 'Sarah Vance'}</span>
            </div>
            <h1 style={{ fontSize: '1.9rem', color: 'var(--purple-900)', marginBottom: '0.2rem' }}>
              Patient: {patientData?.name || 'Robert Vance'} (Age {patientData?.age || 74})
            </h1>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              Emergency Phone: <strong>{patientData?.emergencyContact?.phone || '+1 (555) 234-5678'}</strong> • Medical Notes: {patientData?.medicalNotes || 'Mild cognitive support'}
            </div>
          </div>
        </div>

        {/* Patient Switcher if multiple */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="btn btn-purple btn-sm"
            onClick={() => openReminderModal()}
          >
            <Plus size={18} /> Schedule New Reminder
          </button>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => openNoteModal()}
          >
            <FileText size={18} /> Add Care Note
          </button>
        </div>
      </section>

      {/* Missed Routine Alert Notification Banner */}
      {missedCount > 0 && (
        <div style={{
          backgroundColor: 'var(--coral-50)',
          border: '2px solid var(--coral-500)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: 'var(--coral-700)'
        }}>
          <div style={{
            backgroundColor: 'var(--coral-500)',
            color: '#fff',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--coral-700)', marginBottom: '0.2rem' }}>
              Alert: {missedCount} Scheduled Routine(s) Missed or Delayed!
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', margin: 0 }}>
              The patient has not marked completion for one or more scheduled items. Please verify medication intake or check in with the patient.
            </p>
          </div>
          <button 
            className="btn btn-danger btn-sm"
            onClick={() => setStatusFilter('missed')}
          >
            View Missed Reminders
          </button>
        </div>
      )}

      {/* Daily Summary Statistics */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="card" style={{ borderLeft: '4px solid var(--green-500)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed Routines</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--green-600)', margin: '0.35rem 0' }}>
            {completedCount} <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ {reminders.length}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--green-700)', fontWeight: 600 }}>
            {completionRate}% Adherence Rate
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--blue-500)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Items Today</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--blue-600)', margin: '0.35rem 0' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Upcoming tasks in schedule
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--coral-500)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Missed Items</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: missedCount > 0 ? 'var(--coral-600)' : 'var(--text-main)', margin: '0.35rem 0' }}>
            {missedCount}
          </div>
          <div style={{ fontSize: '0.85rem', color: missedCount > 0 ? 'var(--coral-700)' : 'var(--green-700)', fontWeight: 600 }}>
            {missedCount > 0 ? 'Requires attention' : 'All up to date'}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--purple-500)' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cognitive Sessions</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--purple-600)', margin: '0.35rem 0' }}>
            {scores.length}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--purple-700)', fontWeight: 600 }}>
            Memory games recorded
          </div>
        </div>
      </section>

      {/* Reminders Management Section */}
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
            <h2 style={{ fontSize: '1.4rem', color: 'var(--blue-900)' }}>
              Reminders & Routine Schedule
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Create, edit, search, and manage patient medications, water prompts, and routines.
            </p>
          </div>

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => openReminderModal()}
          >
            <Plus size={18} /> Add Reminder
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          backgroundColor: 'var(--bg-card-subtle)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem', height: '42px' }}
              placeholder="Search reminder title, dosage, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              className="form-select"
              style={{ height: '42px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="medication">💊 Medication</option>
              <option value="water">💧 Water</option>
              <option value="routine">🚶 Routine</option>
              <option value="appointment">🗓️ Appointment</option>
              <option value="task">📋 Task</option>
            </select>
          </div>

          <div style={{ flex: '0 1 160px' }}>
            <select
              className="form-select"
              style={{ height: '42px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed Only</option>
              <option value="pending">Pending Only</option>
              <option value="missed">Missed Only</option>
            </select>
          </div>
        </div>

        {/* Reminders Table / Cards */}
        {filteredReminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No reminders match the current search or filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredReminders.map(rem => (
              <div
                key={rem._id || rem.id}
                style={{
                  backgroundColor: rem.isMissed ? 'var(--coral-50)' : rem.isCompleted ? 'var(--green-50)' : 'var(--bg-surface)',
                  border: `1.5px solid ${rem.isMissed ? 'var(--coral-300)' : rem.isCompleted ? 'var(--green-200)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 300px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: rem.isCompleted ? 'var(--green-100)' : 'var(--blue-100)',
                    color: rem.isCompleted ? 'var(--green-700)' : 'var(--blue-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {rem.category === 'medication' ? <Pill size={22} /> : rem.category === 'appointment' ? <Calendar size={22} /> : <Clock size={22} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                        {rem.title}
                      </span>
                      <span className="badge badge-blue">⏰ {rem.time}</span>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-card-subtle)' }}>
                        {rem.category}
                      </span>
                      {rem.isMissed && <span className="badge badge-coral">Missed</span>}
                      {rem.isCompleted && <span className="badge badge-green">Completed</span>}
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {rem.description && <span>{rem.description} • </span>}
                      {rem.dosage && <span>Dosage: <strong>{rem.dosage}</strong> • </span>}
                      <span>Recurrence: {rem.recurrence}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className={`btn btn-sm ${rem.isCompleted ? 'btn-success' : 'btn-outline'}`}
                    onClick={() => handleToggleReminderStatus(rem, false)}
                    title="Toggle completed"
                  >
                    {rem.isCompleted ? <CheckCircle2 size={16} /> : 'Mark Done'}
                  </button>

                  <button
                    className={`btn btn-sm ${rem.isMissed ? 'btn-danger' : 'btn-outline'}`}
                    onClick={() => handleToggleReminderStatus(rem, true)}
                    title="Toggle missed status"
                  >
                    <AlertTriangle size={16} /> {rem.isMissed ? 'Missed!' : 'Flag Missed'}
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => openReminderModal(rem)}
                    title="Edit reminder"
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--coral-600)', borderColor: 'var(--coral-200)' }}
                    onClick={() => setDeleteConfirmModal({
                      isOpen: true,
                      type: 'reminder',
                      id: rem._id || rem.id,
                      title: rem.title
                    })}
                    title="Delete reminder"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Caregiver Notes Section */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--purple-900)' }}>
              Caregiver Observation & Doctor Notes
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Record behavior observations, doctor recommendations, and daily caregiver reflections.
            </p>
          </div>

          <button className="btn btn-purple btn-sm" onClick={() => openNoteModal()}>
            <Plus size={18} /> New Note
          </button>
        </div>

        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No caregiver notes recorded yet. Tap "+ New Note" to write one.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {notes.map(note => (
              <div
                key={note._id || note.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className={`badge ${
                      note.category === 'Doctor Advice' ? 'badge-blue' :
                      note.category === 'Observation' ? 'badge-green' :
                      note.category === 'Emergency' ? 'badge-coral' : 'badge-purple'
                    }`}>
                      {note.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    {note.title}
                  </h3>

                  <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                    {note.content}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openNoteModal(note)}>
                    <Edit3 size={15} /> Edit
                  </button>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ color: 'var(--coral-600)' }}
                    onClick={() => setDeleteConfirmModal({
                      isOpen: true,
                      type: 'note',
                      id: note._id || note.id,
                      title: note.title
                    })}
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cognitive Game Scores & AI Recommendations History */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--blue-900)' }}>
              Recent Cognitive Game Sessions & AI Adaptations
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Track scores, completion times, accuracy rates, and AI rule-based difficulty adjustments.
            </p>
          </div>

          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('reports')}>
            View Full Analytics & Charts ➔
          </button>
        </div>

        {scores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No cognitive game sessions played yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Game Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Difficulty</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Score</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Accuracy</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                  <th style={{ padding: '0.75rem 1rem' }}>AI Adaptive Feedback</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.map(s => (
                  <tr key={s._id || s.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{s.gameTitle}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
                        {s.difficulty}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--blue-600)' }}>
                      {s.score}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--green-600)' }}>
                      {s.accuracy}%
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{s.completionTimeSeconds}s</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '240px' }}>
                      {s.aiRecommendation || 'Good practice completed.'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      {new Date(s.playedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reminder Create/Edit Modal */}
      {isReminderModalOpen && (
        <div className="modal-overlay" onClick={() => setIsReminderModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: '1.4rem' }}>
                {editingReminder ? 'Edit Routine Reminder' : 'Schedule New Routine Reminder'}
              </h2>
              <button onClick={() => setIsReminderModalOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveReminder}>
              <div className="form-group">
                <label className="form-label" htmlFor="rem-form-title">Reminder Title</label>
                <input
                  id="rem-form-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Donepezil (5mg) or Afternoon Water"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="rem-form-category">Category</label>
                  <select
                    id="rem-form-category"
                    className="form-select"
                    value={reminderForm.category}
                    onChange={(e) => setReminderForm({ ...reminderForm, category: e.target.value })}
                  >
                    <option value="medication">Medication</option>
                    <option value="water">Water</option>
                    <option value="routine">Routine</option>
                    <option value="appointment">Appointment</option>
                    <option value="task">Daily Task</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rem-form-time">Time</label>
                  <input
                    id="rem-form-time"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 08:30 AM"
                    value={reminderForm.time}
                    onChange={(e) => setReminderForm({ ...reminderForm, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="rem-form-recurrence">Recurrence</label>
                  <select
                    id="rem-form-recurrence"
                    className="form-select"
                    value={reminderForm.recurrence}
                    onChange={(e) => setReminderForm({ ...reminderForm, recurrence: e.target.value })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="once">Once</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rem-form-priority">Priority</label>
                  <select
                    id="rem-form-priority"
                    className="form-select"
                    value={reminderForm.priority}
                    onChange={(e) => setReminderForm({ ...reminderForm, priority: e.target.value })}
                  >
                    <option value="high">High (Urgent)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {reminderForm.category === 'medication' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="rem-form-dosage">Dosage Instructions</label>
                  <input
                    id="rem-form-dosage"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1 tablet with breakfast"
                    value={reminderForm.dosage}
                    onChange={(e) => setReminderForm({ ...reminderForm, dosage: e.target.value })}
                  />
                </div>
              )}

              {reminderForm.category === 'appointment' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="rem-form-location">Appointment Location</label>
                  <input
                    id="rem-form-location"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Memorial Neurology Clinic, Suite 302"
                    value={reminderForm.location}
                    onChange={(e) => setReminderForm({ ...reminderForm, location: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="rem-form-desc">Detailed Description / Patient Audio Prompt</label>
                <textarea
                  id="rem-form-desc"
                  className="form-textarea"
                  rows="2"
                  placeholder="Helpful guidance read out loud to the patient"
                  value={reminderForm.description}
                  onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsReminderModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingReminder ? 'Save Changes' : 'Schedule Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Caregiver Note Modal */}
      {isNoteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNoteModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: '1.4rem' }}>
                {editingNote ? 'Edit Care Note' : 'Log Caregiver Observation'}
              </h2>
              <button onClick={() => setIsNoteModalOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveNote}>
              <div className="form-group">
                <label className="form-label" htmlFor="note-form-title">Note Title</label>
                <input
                  id="note-form-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Morning Mood & Alertness"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="note-form-cat">Category</label>
                  <select
                    id="note-form-cat"
                    className="form-select"
                    value={noteForm.category}
                    onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                  >
                    <option value="Observation">Observation</option>
                    <option value="Doctor Advice">Doctor Advice</option>
                    <option value="Medication">Medication Note</option>
                    <option value="General">General Note</option>
                    <option value="Emergency">Emergency Log</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="note-form-priority">Importance</label>
                  <select
                    id="note-form-priority"
                    className="form-select"
                    value={noteForm.priority}
                    onChange={(e) => setNoteForm({ ...noteForm, priority: e.target.value })}
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="note-form-content">Observations & Details</label>
                <textarea
                  id="note-form-content"
                  className="form-textarea"
                  rows="4"
                  placeholder="Write clear observations about memory, meals, medications, or doctor visits..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsNoteModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-purple">
                  {editingNote ? 'Update Note' : 'Save Care Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmModal({ isOpen: false, type: null, id: null, title: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--coral-50)',
              color: 'var(--coral-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Trash2 size={28} />
            </div>

            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--coral-700)' }}>
              Confirm Deletion
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Are you sure you want to delete <strong>"{deleteConfirmModal.title}"</strong>? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: null, id: null, title: '' })}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
