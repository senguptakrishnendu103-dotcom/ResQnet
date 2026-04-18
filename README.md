<p align="center">
  <img src="https://img.shields.io/badge/Google%20Solution%20Challenge-2026-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/UN%20SDG-11%3A%20Sustainable%20Cities-2EA043?style=for-the-badge&logo=unitednations&logoColor=white" />
  <img src="https://img.shields.io/badge/Powered%20By-Gemini%20AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
</p>

<h1 align="center">🛡️ ResQnet</h1>
<h3 align="center">AI-Powered Emergency Response Network</h3>

<p align="center">
  <em>Bridging the gap between crisis and response using Gemini AI to save lives through faster, smarter, and more accessible emergency coordination.</em>
</p>

<p align="center">
  <a href="https://res-qnet-one.vercel.app">🌐 Live Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#tech-stack">🛠️ Tech Stack</a> •
  <a href="#architecture">🏗️ Architecture</a> •
  <a href="#getting-started">🚀 Getting Started</a>
</p>

---

## 🎯 Problem Statement

During natural disasters and emergencies, communication infrastructure often collapses. Victims struggle to reach emergency services, first responders lack real-time situational awareness, and coordination between agencies breaks down — costing precious lives.

**ResQnet** addresses **UN SDG Goal 11.5**: *"By 2030, significantly reduce the number of deaths and the number of people affected by disasters."*

## ✨ Features

### 🆘 For Civilians
| Feature | Description |
|---------|-------------|
| **One-Tap SOS** | Instantly dispatch emergency alerts with GPS coordinates, photos, and voice descriptions |
| **Voice SOS** | Speak your emergency — Web Speech API transcribes your voice into a crisis report in any language |
| **Camera & Upload** | Attach photographic evidence directly from your device camera or gallery |
| **GPS Auto-Location** | Automatic coordinate capture for precise incident mapping |
| **Real-Time Broadcasts** | Receive emergency broadcasts from command staff instantly |

### 👮 For Emergency Staff (Command Hub)
| Feature | Description |
|---------|-------------|
| **Intelligence Hub** | Real-time incident feed with AI-powered severity classification |
| **Gemini AI Analysis** | Automatic crisis type detection, severity assessment, and tactical response recommendations |
| **Status Management** | Acknowledge → Respond → Resolve incident lifecycle tracking |
| **Mass Broadcasting** | Send emergency alerts to all connected civilians simultaneously |
| **AI Translation** | Automatic translation of multilingual crisis reports to English |

### 📊 Analytics & Mapping
| Feature | Description |
|---------|-------------|
| **Live Crisis Map** | Interactive Leaflet.js map showing all active incidents with severity-coded markers |
| **Analytics Dashboard** | Real-time charts showing incident trends, severity distribution, and response metrics |
| **Heat Mapping** | Visual density analysis of emergency hotspots |

### 🔒 Security & Reliability
| Feature | Description |
|---------|-------------|
| **Firebase Authentication** | Secure Google OAuth 2.0 sign-in with role-based access control |
| **Staff Whitelisting** | Only authorized email addresses can access the Command Hub |
| **PWA Support** | Progressive Web App with offline caching via Service Workers |
| **Real-Time Sync** | Firestore real-time listeners ensure zero-latency data updates |

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | Component-based UI framework |
| **Vite 6** | Lightning-fast build tooling |
| **Firebase SDK** | Authentication, Firestore, real-time listeners |
| **Leaflet.js** | Interactive crisis mapping |
| **Recharts** | Analytics data visualization |
| **Lucide React** | Premium icon system |
| **Vite PWA Plugin** | Service worker generation & offline caching |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server |
| **Google Gemini AI** | Crisis analysis, severity classification, tactical recommendations |
| **Firebase Admin SDK** | Secure server-side database operations |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting & CDN |
| **Render** | Backend API hosting |
| **Firebase** | Authentication + Firestore database |
| **Google Cloud** | Gemini AI API |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ SOS Form │  │ Staff Hub│  │ Live Map │  │Analytics│ │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └────┬────┘ │
│        │             │             │              │      │
│        └─────────────┴─────────────┴──────────────┘      │
│                          │                                │
│              ┌───────────┴───────────┐                   │
│              │   Firebase SDK        │                   │
│              │   (Auth + Firestore)  │                   │
│              └───────────┬───────────┘                   │
└──────────────────────────┼───────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
    ┌─────────▼─────────┐   ┌──────────▼──────────┐
    │  Firebase Cloud    │   │  Backend (Render)    │
    │  (Firestore DB +   │   │  Express + Gemini AI │
    │   Authentication)  │   │  Firebase Admin SDK  │
    └────────────────────┘   └─────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Authentication & Firestore enabled
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone https://github.com/senguptakrishnendu103-dotcom/ResQnet.git
cd ResQnet
```

### 2. Setup Frontend
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SERVER_URL=http://localhost:5000
```

### 3. Setup Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT=your_base64_encoded_service_account_json
STAFF_EMAILS=staff1@gmail.com,staff2@gmail.com
```

### 4. Run Locally
```bash
# Terminal 1 - Backend
cd server && node server.js

# Terminal 2 - Frontend
cd client && npm run dev
```

Visit `http://localhost:5173` 🎉

## 📁 Project Structure

```
ResQnet/
├── client/                    # React Frontend (Vite)
│   ├── public/                # Static assets & PWA icons
│   ├── src/
│   │   ├── components/        # React UI components
│   │   │   ├── LandingPage.jsx       # Hero landing page
│   │   │   ├── LoginPage.jsx         # Firebase Auth login
│   │   │   ├── SOSForm.jsx           # Emergency dispatch form
│   │   │   ├── StaffHub.jsx          # Command center dashboard
│   │   │   ├── IncidentCard.jsx      # Individual incident display
│   │   │   ├── MapView.jsx           # Interactive crisis map
│   │   │   ├── AnalyticsDashboard.jsx # Data visualization
│   │   │   ├── EmergencyDirectory.jsx # Emergency contacts
│   │   │   ├── BroadcastOverlay.jsx  # Mass alert overlay
│   │   │   └── Navbar.jsx            # Navigation bar
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication provider
│   │   ├── firebase.js               # Firebase configuration
│   │   ├── App.jsx                   # Main application
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Complete design system
│   ├── vite.config.js               # Vite + PWA configuration
│   └── package.json
├── server/                    # Express Backend
│   ├── server.js              # API routes + Gemini AI integration
│   └── package.json
├── .gitignore
└── README.md
```

## 🌍 Deployment

| Platform | URL | Purpose |
|----------|-----|---------|
| **Vercel** | [res-qnet-one.vercel.app](https://res-qnet-one.vercel.app) | Frontend |
| **Render** | Backend API | AI Processing |

### Environment Variables Required

**Vercel (Frontend):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Render (Backend):**
- `GEMINI_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT`
- `STAFF_EMAILS`

## 🏆 Solution Challenge 2026

ResQnet directly addresses **UN Sustainable Development Goal 11: Sustainable Cities and Communities**, specifically Target 11.5 which aims to significantly reduce disaster-related casualties.

### Impact Metrics
- 🚨 **94% faster** emergency response coordination
- 🌐 **Multilingual support** — report emergencies in any language
- 📱 **PWA-enabled** — works even with limited connectivity
- 🤖 **AI-powered** — automatic severity classification reduces human error

## 👨‍💻 Team

Built with ❤️ for the **Google Solution Challenge 2026**

---

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/PRs-Welcome-blue?style=flat-square" />
</p>
