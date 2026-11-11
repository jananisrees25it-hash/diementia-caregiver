# 🧠 AI-Powered Cognitive Support & Caregiver Assistance

> **“Supporting Every Memory, Empowering Every Caregiver.”**

A complete, responsive, full-stack web application designed to support individuals experiencing memory difficulties and empower caregivers with real-time routine monitoring, adaptive cognitive training, and safety alerts.

---

## 🌟 Key Features

### 1. Calming, Accessible Design (WCAG 2.1 Compliant)
- **Calming Palette:** Soft sky blues (`#0284c7`, `#e0f2fe`), sage mint greens (`#10b981`, `#dcfce7`), and gentle lavender purples (`#8b5cf6`, `#ede9fe`).
- **Tactile Touch Targets:** Large buttons with tactile active states, readable Google Fonts (*Outfit* and *Plus Jakarta Sans*), and clear iconography.
- **Accessibility Controls:**
  - Font Size Scaling (Normal `A`, Large `A+`, Extra Large `A++`)
  - High-Contrast Mode Toggle
  - Voice Audio (Web Speech API Text-to-Speech)
  - Live Online / Offline Network Status Pill

### 2. Patient Dashboard
- **Patient Profile:** Displays patient name (*Robert Vance*), age (*74*), profile avatar, and primary caregiver contact details.
- **Prominent Emergency Help Button:** Large, pulse-animated emergency call button with one-tap dialing and instant caregiver alert beacon.
- **Voice & Audio Assistant:** Web Speech API voice command recognition and audio playback (*"Read Reminders"*, *"Drink Water"*, *"Play Games"*, *"Emergency"*).
- **Interactive Water Drinking Tracker:** Visual cup counter (1 to 8 cups) with celebration chime and progress bar.
- **Daily Tasks & Medication Checklist:** Category filtering (Medications, Routines, Water, Appointments) with one-tap completion toggle, confetti celebrations, and individual audio speech prompts.
- **Cognitive Games Hub:** One-click launch to brain exercises.

### 3. AI-Powered Cognitive Practice Suite
- **4 Dedicated Cognitive Games:**
  1. **Memory Card Match:** Flip and match symbol pairs (Easy: 4 pairs, Medium: 6 pairs, Hard: 8 pairs).
  2. **Pattern Color Sequence:** Simon-style color retention and sequence repetition.
  3. **Number Sequence Crunch:** Number ordering from lowest to highest, sequence completion, and arithmetic recall.
  4. **Word Recall & Association:** Everyday vocabulary unscramble with semantic meaning clues (*GARDEN*, *FAMILY*, *SUNSHINE*).
- **Rule-Based AI Adaptation Engine:** Analyzes completion time, error counts, and accuracy percentage to automatically adjust next game difficulty:
  - *High accuracy (<40s, >85% accuracy)* ➔ Advances difficulty to next level.
  - *Struggling (>90s or <60% accuracy)* ➔ Gently decreases difficulty with reassuring guidance.
- **Encouraging Audio Feedback:** Positive voice affirmations (*"Great job!"*, *"Let's try again!"*).
- **Prominent Medical Disclaimer:** Clearly states the suite is an engagement tool, not a medical diagnostic or treatment instrument.

### 4. Caregiver Dashboard
- **Patient Overview:** Real-time visibility into patient routine adherence, medications taken, and hydration levels.
- **Missed Routine & Medication Alerts:** High-visibility alert banner displayed immediately whenever a scheduled reminder is delayed or missed.
- **Reminders Management (Full CRUD):**
  - Search by title, dosage, or instructions.
  - Filter by category (*Medication, Routine, Water, Appointment, Task*) and status (*Completed, Pending, Missed*).
  - Schedule new reminders with custom time, recurrence, dosage, and priority.
  - Edit or delete reminders with confirmation modals.
- **Caregiver Observation & Clinical Notes:** Log behavior, mood, doctor advice, and clinical observations with category badges and timestamps.
- **Cognitive Session History Table:** Detailed performance log of all games played, including difficulty, score, completion time, accuracy, and AI recommendations.

### 5. Accessibility, Offline Support & Auto-Sync
- **Offline Mode:** Routines and checklists are cached locally in `localStorage` so patients can view routines and mark tasks even without internet connectivity.
- **Automatic Synchronization:** As soon as internet connectivity returns, queued offline actions are synchronized with the backend via `/api/reminders/sync`.
- **Offline Banner:** Visual notification notifying users when running in local offline mode.

### 6. Reports & Analytics
- **7-Day Routine Adherence Bar Chart:** Visual tracking of completed routines across the week.
- **Cognitive Session Scores Trend Line:** Progression of game scores over time.
- **Completed vs. Missed Breakdown:** Clear categorical overview for physician consultations.
- **Print / PDF Export:** One-click print styling for physical record-keeping.

---

## 🏗️ Technology Stack

- **Frontend:** React 19, Vite, Vanilla CSS Design System, Lucide React Icons, Canvas Confetti.
- **Backend:** Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS, Dotenv.
- **Database:** MongoDB with Mongoose + **Zero-Config Auto-Persistence FileStore Fallback** (`server/data/store.json`).
  > *Note: If a local MongoDB instance is not active, the backend automatically boots in FileStore persistence mode so all features, authentication, and data changes work seamlessly without setup friction.*

---

## 📁 Project Directory Structure

```
antigravity/
├── package.json              # Root scripts to run both servers concurrently
├── run-all.js                # Node process runner for dev environment
├── .env.example              # Example environment configurations
├── README.md                 # Project documentation
│
├── server/                   # Backend API (Express.js)
│   ├── package.json
│   ├── server.js             # Main server entry point & route registration
│   ├── .env                  # Server environment variables
│   ├── .env.example
│   ├── config/
│   │   └── db.js             # MongoDB connection & hybrid persistence manager
│   ├── models/               # Mongoose Schemas
│   │   ├── User.js           # Patient & Caregiver user model
│   │   ├── Reminder.js       # Routine & medication reminders
│   │   ├── GameScore.js      # Cognitive scores & AI adjustments
│   │   ├── CaregiverNote.js  # Clinical observations & notes
│   │   └── DailyActivity.js  # Water and routine tracking
│   ├── routes/               # REST API Routes
│   │   ├── authRoutes.js     # Auth, register, login, 1-click demo login
│   │   ├── reminderRoutes.js # Reminders CRUD & offline sync
│   │   ├── scoreRoutes.js    # Game score recording & AI evaluation
│   │   ├── noteRoutes.js     # Caregiver notes CRUD
│   │   └── patientRoutes.js  # Patient summary, water tracker, emergency alert
│   ├── middleware/
│   │   └── auth.js           # JWT authentication & role authorization guards
│   ├── services/
│   │   └── dataService.js    # Data layer abstraction (Mongo & JSON store)
│   └── data/
│       ├── seedData.js       # Preloaded demonstration data
│       └── store.json        # Auto-persistence storage file
│
└── client/                   # Frontend SPA (React + Vite)
    ├── package.json
    ├── vite.config.js        # Vite configuration with API proxy to port 5000
    ├── index.html            # HTML entry point with Google Fonts & SEO tags
    └── src/
        ├── main.jsx          # React DOM entry point
        ├── App.jsx           # Master layout & route controller
        ├── index.css         # Custom Accessible CSS Design System
        ├── context/
        │   ├── AuthContext.jsx          # Authentication state & demo logins
        │   └── AccessibilityContext.jsx # TTS, font scaling, offline sync
        ├── components/
        │   ├── Navbar.jsx               # Navigation with accessibility toolbar
        │   ├── Footer.jsx               # Medical disclaimer & emergency contacts
        │   ├── OfflineBanner.jsx        # Offline state & sync indicator
        │   ├── EmergencyModal.jsx       # Emergency contact & dispatch beacon
        │   └── VoiceAssistant.jsx       # Voice recognition & command chips
        ├── pages/
        │   ├── HomePage.jsx             # Landing page with demo logins
        │   ├── LoginPage.jsx            # User sign in with demo autofill
        │   ├── RegisterPage.jsx         # Registration (Patient & Caregiver)
        │   ├── PatientDashboard.jsx     # Patient routine & hydration dashboard
        │   ├── CaregiverDashboard.jsx   # Caregiver monitoring & reminder CRUD
        │   ├── CognitiveGamesPage.jsx   # Cognitive games hub & score history
        │   └── ReportsPage.jsx          # Progress analytics & 7-day charts
        ├── games/
        │   ├── MemoryMatchGame.jsx      # Card flip match exercise
        │   ├── PatternSequenceGame.jsx  # Color pattern sequence exercise
        │   ├── NumberCrunchGame.jsx     # Number ordering & arithmetic
        │   └── WordRecallGame.jsx       # Semantic word recall & scramble
        └── utils/
            ├── api.js                   # API client with JWT injection
            ├── aiEngine.js              # Rule-based cognitive adaptation logic
            ├── tts.js                   # Web Speech API speech synthesis
            └── offlineStorage.js        # Local caching and sync queue
```

---

## 🚀 Step-by-Step Setup Instructions in Visual Studio Code

### Prerequisites
- **Node.js** (v18.0.0 or higher) installed on your system.
- *(Optional)* **MongoDB** (v6.0 or higher) running locally on port 27017 or a MongoDB Atlas URI. *(Not strictly required, as the application includes an automatic zero-config file-backed storage fallback!)*

### Step 1: Open the Project in VS Code
1. Launch **Visual Studio Code**.
2. Select **File ➔ Open Folder...** and select this directory (`antigravity`).

### Step 2: Install Dependencies
Open a terminal in VS Code (`Ctrl + ~` or `Terminal ➔ New Terminal`) and run:

```bash
# Option A: Run single setup command from root
npm run install:all

# Option B: Or install individually
cd server && npm install
cd ../client && npm install
cd ..
```

### Step 3: Configure Environment Variables
The `.env` files are already pre-configured for instant development:
- **Root:** `.env.example`
- **Server:** `server/.env` (configured for port `5000` and secret `JWT_SECRET`)

To connect to a custom MongoDB database, simply edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cognitive_care
JWT_SECRET=cognitive_support_caregiver_secure_token_secret_key_2025
NODE_ENV=development
```

### Step 4: Start the Full-Stack Application
In the root terminal, run:

```bash
# Starts both the Backend API (Port 5000) and Vite Frontend (Port 5173) concurrently:
node run-all.js
```

Or run them in two separate terminal tabs:
- **Terminal 1 (Backend):**
  ```bash
  cd server
  npm start
  ```
  *(Server runs on: `http://localhost:5000`)*

- **Terminal 2 (Frontend):**
  ```bash
  cd client
  npm run dev
  ```
  *(Vite Client runs on: `http://localhost:5173`)*

---

## 👥 Demonstration Accounts & Credentials

For fast evaluation, testing, and live presentation, pre-seeded accounts are provided with **1-click quick login buttons**:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Robert Vance | `patient@demo.com` | `patient123` | Age 74, mild memory difficulties, daily routine seeded. |
| **Caregiver** | Sarah Vance | `caregiver@demo.com` | `caregiver123` | Daughter & Primary Caregiver, linked to Robert. |

*(You can also register brand new Patient or Caregiver accounts anytime using the Register page!)*

---

## 🧪 Step-by-Step Feature Testing Guide

### 1. Test Home Page
- Navigate to `http://localhost:5173/`.
- Verify the hero section, calming color palette, features cards, and 4-step workflow.
- Test the accessibility toolbar in the top navigation:
  - Click `A` / `A+` / `A++` to scale text size.
  - Click the **Eye icon** to toggle High Contrast mode.
  - Click the **Speaker icon** to toggle Voice Assistance.

### 2. Test Patient Routine Dashboard
- On the Home page, click **“👴 Enter as Patient (Robert, Age 74)”**.
- **Hydration Tracker:** Click **“+ I Drank a Glass of Water”** ➔ verify that the cup counter increments, celebration chime plays, and a glass illuminates.
- **Checklist:** Click **“Mark as Done”** on any reminder (e.g. *Afternoon Blood Pressure Check*) ➔ verify completion celebration, confetti, and status update.
- **Audio Prompt:** Click the **Speaker button** beside any task ➔ listens to clear speech read-aloud of the reminder and instructions.
- **Voice Assistant:** Click **“Speak a Command”** or tap **“Read Reminders”** / **“Drink Water”** chips to test audio voice controls.
- **Emergency Help:** Click the big red **“EMERGENCY HELP”** button ➔ verify the modal opens with Sarah Vance's contact, one-tap calling, and click **“Send Urgent Alert Beacon”**.

### 3. Test AI Cognitive Games
- Click **“Cognitive Games”** in the navigation bar.
- Launch **Memory Card Match**: Flip cards to find matching symbol pairs. Watch the timer and try completing the round.
- Upon completion, observe the **AI Cognitive Adaptation feedback** stating how performance and accuracy adjusted the recommended next difficulty level.
- Test **Pattern Color Sequence**, **Number Crunch**, and **Word Recall** to verify full functionality across all 4 game categories.

### 4. Test Caregiver Dashboard
- Click **Logout** in the navigation, then click **“👩‍⚕️ Enter as Caregiver (Sarah Vance)”**.
- Observe the **Daily Summary Cards** showing live adherence rate, pending tasks, and missed reminders.
- **Create Reminder:** Click **“+ Schedule New Reminder”**, enter a title (*e.g. Vitamin D3*), time (*01:00 PM*), category (*Medication*), dosage (*1 tablet*), and click **Schedule Reminder**. Verify it appears in the list immediately.
- **Edit/Delete Reminder:** Test editing or deleting a reminder with the confirmation modal.
- **Flag Missed:** Click **“Flag Missed”** on an item to see how the high-visibility **Missed Reminder Alert Banner** triggers for the caregiver.
- **Caregiver Notes:** Click **“+ Add Care Note”**, write an observation note, and verify it saves to the patient record.

### 5. Test Reports & Analytics
- Click **“Reports & Trends”** in the navigation bar.
- Inspect the **7-Day Routine Adherence Bar Chart** and **Cognitive Session Scores Trend Chart**.
- Review the **Scheduled Routine Status Log** (Completed vs. Missed).
- Click **“Print / Save PDF Report”** to test the printer layout.
- Review the **Clinical & Diagnostic Disclaimer** at the bottom of the report.

### 6. Test Offline Support
- In your browser's Developer Tools (F12) ➔ Network tab ➔ toggle **Offline**.
- Notice the **Offline Mode Banner** appear immediately at the top of the application.
- Navigate to the Patient Dashboard: all reminders are viewable offline and tasks can still be marked completed.
- Toggle Network back to **Online**: observe the banner display **"Synchronizing offline updates..."** and smoothly sync with the backend.

---

## 🔒 Security & Privacy Architecture
- Passwords hashed using industry-standard `bcryptjs` salt rounds.
- Stateless authentication using signed JSON Web Tokens (`jwt`).
- Role-based authorization middleware restricting caregiver portal endpoints to authorized caregiver accounts.
- Local storage encryption for cached offline sensitive tokens.

---

## 📜 Medical Disclaimer
*CognitiveCare AI is a cognitive engagement and daily routine support prototype designed to assist with memory organization, habit consistency, and caregiver collaboration. It does not measure, diagnose, prevent, or treat Alzheimer's disease, dementia, or any neurological disorder. It is not a medical device.*
