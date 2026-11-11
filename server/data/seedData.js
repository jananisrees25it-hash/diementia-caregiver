const bcrypt = require('bcryptjs');

const getInitialData = () => {
  const patientPasswordHash = bcrypt.hashSync('patient123', 10);
  const caregiverPasswordHash = bcrypt.hashSync('caregiver123', 10);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const users = [
    {
      _id: 'patient_demo_1',
      id: 'patient_demo_1',
      name: 'Robert Vance',
      email: 'patient@demo.com',
      password: patientPasswordHash,
      role: 'patient',
      age: 74,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      emergencyContact: {
        name: 'Sarah Vance',
        relation: 'Daughter & Primary Caregiver',
        phone: '+1 (555) 234-5678',
        alternatePhone: '+1 (555) 876-5432'
      },
      caregiverId: 'caregiver_demo_1',
      patientId: null,
      medicalNotes: 'Mild cognitive forgetfulness; benefits from gentle recurring reminders, routine structure, and daily cognitive games.',
      hydrationGoal: 8,
      hydrationCurrent: 5,
      createdAt: new Date()
    },
    {
      _id: 'caregiver_demo_1',
      id: 'caregiver_demo_1',
      name: 'Sarah Vance',
      email: 'caregiver@demo.com',
      password: caregiverPasswordHash,
      role: 'caregiver',
      age: 42,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      emergencyContact: {
        name: 'Sarah Vance',
        relation: 'Self',
        phone: '+1 (555) 234-5678',
        alternatePhone: '+1 (555) 876-5432'
      },
      caregiverId: null,
      patientId: 'patient_demo_1',
      medicalNotes: '',
      hydrationGoal: 8,
      hydrationCurrent: 0,
      createdAt: new Date()
    }
  ];

  const reminders = [
    {
      _id: 'rem_1',
      id: 'rem_1',
      patientId: 'patient_demo_1',
      title: 'Morning Donepezil (5mg)',
      description: 'Take 1 tablet with warm breakfast and a glass of water.',
      category: 'medication',
      time: '08:00 AM',
      date: todayStr,
      priority: 'high',
      recurrence: 'daily',
      dosage: '5mg (1 tablet)',
      location: 'Home Kitchen',
      isCompleted: true,
      completedAt: new Date(new Date().setHours(8, 15, 0, 0)),
      isMissed: false,
      createdBy: 'caregiver_demo_1',
      createdAt: new Date()
    },
    {
      _id: 'rem_2',
      id: 'rem_2',
      patientId: 'patient_demo_1',
      title: 'Drink 2 Glasses of Fresh Water',
      description: 'Mid-morning hydration to keep mind fresh and energized.',
      category: 'water',
      time: '10:00 AM',
      date: todayStr,
      priority: 'medium',
      recurrence: 'daily',
      dosage: '500ml',
      location: 'Living Room',
      isCompleted: true,
      completedAt: new Date(new Date().setHours(10, 5, 0, 0)),
      isMissed: false,
      createdBy: 'caregiver_demo_1',
      createdAt: new Date()
    },
    {
      _id: 'rem_3',
      id: 'rem_3',
      patientId: 'patient_demo_1',
      title: 'Gentle Garden Walk & Sunlight',
      description: '15-minute peaceful stroll in the garden or patio.',
      category: 'routine',
      time: '11:00 AM',
      date: todayStr,
      priority: 'low',
      recurrence: 'daily',
      dosage: '',
      location: 'Backyard Garden',
      isCompleted: true,
      completedAt: new Date(new Date().setHours(11, 20, 0, 0)),
      isMissed: false,
      createdBy: 'caregiver_demo_1',
      createdAt: new Date()
    },
    {
      _id: 'rem_4',
      id: 'rem_4',
      patientId: 'patient_demo_1',
      title: 'Afternoon Blood Pressure Check',
      description: 'Use the arm cuff on the bedside table and log reading.',
      category: 'task',
      time: '02:30 PM',
      date: todayStr,
      priority: 'medium',
      recurrence: 'daily',
      dosage: '',
      location: 'Bedroom desk',
      isCompleted: false,
      completedAt: null,
      isMissed: false,
      createdBy: 'caregiver_demo_1',
      createdAt: new Date()
    },
    {
      _id: 'rem_5',
      id: 'rem_5',
      patientId: 'patient_demo_1',
      title: 'Afternoon Memory Exercise Game',
      description: 'Play 1 or 2 brain games to exercise visual memory.',
      category: 'task',
      time: '04:00 PM',
      date: todayStr,
      priority: 'medium',
      recurrence: 'daily',
      dosage: '',
      location: 'Tablet / PC',
      isCompleted: false,
      completedAt: null,
      isMissed: false,
      createdBy: 'caregiver_demo_1',
      createdAt: new Date()
    },
    {
      _id: 'rem_6',
      id: 'rem_6',
      patientId: 'patient_demo_1',
      title: 'Evening Lisinopril (10mg)',
      description: 'Take 1 tablet after dinner with fresh water.',
      category: 'medication',
      time: '07:30 PM',
      date: todayStr,
      priority: 'high',
      recurrence: 'daily',
      dosage: '10mg (1 tablet)',
      location: 'Dining room',
      isCompleted: false,
      completedAt: null,
      isMissed: false,
      createdBy: 'caregiver_demo_1',
      createdAt: new Date()
    },
    {
      _id: 'rem_7',
      id: 'rem_7',
      patientId: 'patient_demo_1',
      title: 'Neurologist Dr. Bennett Consultation',
      description: 'Quarterly routine memory and wellness review.',
      category: 'appointment',
      time: '10:30 AM',
      date: tomorrowStr,
      priority: 'high',
      recurrence: 'once',
      dosage: '',
      location: 'St. Jude Neurology Center, Suite 404',
      isCompleted: false,
      completedAt: null,
      isMissed: false,
      createdBy: 'caregiver_demo_1',
      createdAt: new Date()
    }
  ];

  const gameScores = [
    {
      _id: 'score_1',
      id: 'score_1',
      patientId: 'patient_demo_1',
      gameType: 'memory',
      gameTitle: 'Memory Card Flip Match',
      difficulty: 'easy',
      score: 950,
      correctAnswers: 8,
      incorrectAnswers: 1,
      accuracy: 89,
      completionTimeSeconds: 34,
      streak: 5,
      aiRecommendation: 'High recall speed! AI recommends advancing next round to Medium difficulty for cognitive engagement.',
      playedAt: twoDaysAgo
    },
    {
      _id: 'score_2',
      id: 'score_2',
      patientId: 'patient_demo_1',
      gameType: 'pattern',
      gameTitle: 'Pattern Color Sequence',
      difficulty: 'easy',
      score: 870,
      correctAnswers: 6,
      incorrectAnswers: 1,
      accuracy: 86,
      completionTimeSeconds: 40,
      streak: 4,
      aiRecommendation: 'Solid pattern recognition. Suggested keeping consistent pace.',
      playedAt: yesterday
    },
    {
      _id: 'score_3',
      id: 'score_3',
      patientId: 'patient_demo_1',
      gameType: 'number',
      gameTitle: 'Number Sequence Crunch',
      difficulty: 'easy',
      score: 910,
      correctAnswers: 5,
      incorrectAnswers: 0,
      accuracy: 100,
      completionTimeSeconds: 26,
      streak: 6,
      aiRecommendation: 'Flawless calculation! AI automatically adjusted difficulty level to Medium.',
      playedAt: yesterday
    },
    {
      _id: 'score_4',
      id: 'score_4',
      patientId: 'patient_demo_1',
      gameType: 'word',
      gameTitle: 'Word Recall & Association',
      difficulty: 'easy',
      score: 940,
      correctAnswers: 5,
      incorrectAnswers: 1,
      accuracy: 83,
      completionTimeSeconds: 31,
      streak: 4,
      aiRecommendation: 'Strong lexical retrieval. Keep playing daily for verbal fluency reinforcement.',
      playedAt: new Date(new Date().setHours(14, 0, 0, 0))
    }
  ];

  const caregiverNotes = [
    {
      _id: 'note_1',
      id: 'note_1',
      caregiverId: 'caregiver_demo_1',
      patientId: 'patient_demo_1',
      title: 'Dr. Bennett Visit Notes & Game Guidance',
      content: 'Doctor confirmed cognitive scores are stable. Recommended playing games for 10-15 minutes in the morning when alert. Do not stress over errors, positive mood is priority.',
      category: 'Doctor Advice',
      priority: 'important',
      createdAt: yesterday,
      updatedAt: yesterday
    },
    {
      _id: 'note_2',
      id: 'note_2',
      caregiverId: 'caregiver_demo_1',
      patientId: 'patient_demo_1',
      title: 'Morning Routine & Mood Observation',
      content: 'Robert was smiling and energized after breakfast. Took morning Donepezil on time without hesitation. Drank 2 full cups of water independently.',
      category: 'Observation',
      priority: 'normal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'note_3',
      id: 'note_3',
      caregiverId: 'caregiver_demo_1',
      patientId: 'patient_demo_1',
      title: 'Hydration Target Reminder',
      content: 'Remember to gently encourage a glass of water every 2 hours, especially during warmer afternoons.',
      category: 'General',
      priority: 'normal',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const dailyActivities = [
    {
      _id: 'act_today',
      id: 'act_today',
      patientId: 'patient_demo_1',
      date: todayStr,
      waterGlasses: 5,
      waterGoal: 8,
      tasksCompleted: 3,
      tasksTotal: 6,
      medicationsTaken: 1,
      medicationsTotal: 2,
      gamesPlayed: 1,
      lastActive: new Date()
    }
  ];

  return { users, reminders, gameScores, caregiverNotes, dailyActivities };
};

module.exports = { getInitialData };
