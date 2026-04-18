# 🛡️ ResQnet — AI-Powered Emergency Response Network

> **Google Solution Challenge 2026** | UN SDG 11: Sustainable Cities & Communities

ResQnet is an AI-powered emergency response platform that bridges the gap between crisis and response. Using **Google's Gemini 1.5 Flash AI**, it provides real-time crisis triage, multi-language support, and intelligent emergency coordination — making emergency response faster, smarter, and more accessible for vulnerable communities.

---

## 🎯 The Problem

Emergency response systems in developing nations face critical challenges:

| Challenge | Impact |
|-----------|--------|
| 🕐 **Delayed Response** | 68% of emergency calls fail to reach responders in time |
| 🌐 **Language Barriers** | 45% of emergency reports are delayed due to communication gaps |
| 📡 **Fragmented Systems** | 3.6B people lack access to adequate emergency response |
| ⏱️ **Coordination Gaps** | 14-minute average delay due to manual triage processes |

Traditional emergency systems rely on manual triage, phone calls, and paper logs — leaving the most vulnerable communities without timely help when every second counts.

---

## 💡 Our Solution

ResQnet transforms emergency response through AI-powered automation:

### Key Features

- **🧠 AI-Powered Crisis Triage** — Gemini 1.5 Flash analyzes every report in real-time, automatically categorizing crisis type, severity, and generating tactical response advice
- **🌐 Multi-Language Intelligence** — Report emergencies in any language; AI translates and processes reports, breaking communication barriers
- **🗺️ Live Incident Mapping** — Interactive map visualization with color-coded severity markers and real-time GPS tracking
- **📊 Impact Analytics** — Track response times, resolution rates, and incident patterns with data-driven dashboards
- **📸 Visual Evidence Capture** — Camera capture and image upload for AI-powered visual crisis assessment
- **🎙️ Voice SOS** — Speech-to-text emergency reporting for hands-free crisis situations
- **📡 Real-Time Coordination** — WebSocket-powered live updates with instant broadcast alerts
- **🔒 Secure Authentication** — Firebase Auth with Google Sign-In

---

## 🌍 SDG Alignment

### SDG 11: Sustainable Cities & Communities

ResQnet directly addresses three UN SDG 11 targets:

| Target | Description | How ResQnet Helps |
|--------|-------------|-------------------|
| **11.5** | Reduce deaths from disasters | AI-powered triage reduces response time by automating categorization and dispatching |
| **11.b** | Disaster risk management | Real-time analytics and mapping enable data-driven emergency coordination |
| **11.7** | Safe, inclusive public spaces | Multi-language support ensures all community members can report emergencies regardless of language |

---

## 🔧 Google Technologies Used

| Technology | Usage |
|------------|-------|
| **Gemini 1.5 Flash** | Core AI engine for crisis categorization, severity analysis, tactical advice generation, and multi-language translation |
| **Firebase Authentication** | Secure user authentication with Google Sign-In and email/password support |
| **Firebase Platform** | Real-time backend infrastructure, user management, and deployment |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                  │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐   │
│  │ SOS Form│  │ Map View │  │Analytics│  │ Command Hub  │   │
│  │ + Camera│  │ (Leaflet)│  │Dashboard│  │ (Staff Only) │   │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └──────┬───────┘   │
│       │            │             │               │            │
│       └────────────┴──────┬──────┴───────────────┘            │
│                           │                                    │
│              ┌────────────┴────────────┐                      │
│              │   Firebase Auth (SDK)   │                      │
│              └────────────┬────────────┘                      │
└───────────────────────────┼──────────────────────────────────┘
                            │ WebSocket (Socket.IO)
┌───────────────────────────┼──────────────────────────────────┐
│                    SERVER (Express + Node.js)                  │
│              ┌────────────┴────────────┐                      │
│              │    Socket.IO Handler    │                      │
│              └────────────┬────────────┘                      │
│                           │                                    │
│              ┌────────────┴────────────┐                      │
│              │   Gemini 1.5 Flash API  │                      │
│              │  (Crisis Analysis AI)   │                      │
│              └─────────────────────────┘                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- A Firebase project ([Create one here](https://console.firebase.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/resqnet.git
   cd resqnet
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Configure environment variables**

   Create `server/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   STAFF_EMAILS=staff@example.com,admin@example.com
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

5. **Start the server**
   ```bash
   cd server
   node server.js
   ```

6. **Start the client (in another terminal)**
   ```bash
   cd client
   npm run dev
   ```

7. **Open** `http://localhost:5173` in your browser

---

## 📱 User Roles

| Role | Access | How to Get |
|------|--------|------------|
| **Civilian** | Report emergencies, view emergency directory | Default for all users |
| **Commander** | Full incident dashboard, broadcast alerts, update incident status, analytics | Emails containing "staff" or configured in STAFF_EMAILS |

---

## 🗺️ Future Roadmap

- [ ] Firebase Cloud Messaging for push notifications
- [ ] Firestore database for persistent, scalable storage
- [ ] Multi-turn AI conversation for follow-up questions
- [ ] PWA support for offline emergency reporting
- [ ] AI-generated evacuation routes
- [ ] Community volunteer coordination system
- [ ] Integration with local emergency services APIs

---

## 👥 Team

*ResQnet — Google Solution Challenge 2026*

---

## 📄 License

This project is built for the Google Solution Challenge 2026.
