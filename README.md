<h1 align="center">
  🚨 Road-SOS
</h1>

<p align="center">
  <strong>Your Digital Lifeline in Critical Emergencies</strong><br>
  A unified mobile ecosystem that bridges the gap between emergency onset and response dispatch.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Contributors](#-contributors)

## 🎯 About the Project

In critical situations (road accidents, sudden medical crises), every second counts. Traditional methods of calling emergency services lack instant location sharing, automated contact notification, and quick access to critical medical history. 

**Road-SOS** is a comprehensive React Native application designed to solve this. With a single tap, it triggers an SOS event, starts live location tracking, dispatches formatted SMS to pre-saved emergency contacts, and logs the event history.

## ✨ Key Features

- **Single-Tap SOS Trigger:** Immediately alert relevant authorities (Police, Fire, Medical) with real-time GPS coordinates.
- **Automated SMS Dispatch:** Auto-generates and sends text messages to up to 5 stored emergency contacts with live tracking links.
- **Digital Medical Profile:** Stores crucial data (Blood Group, Allergies, Medical Notes) for instant access by first responders.
- **Live Location Tracking:** Continuous GPS polling to ensure responders are heading to your exact, real-time location.
- **Event Logging & History:** Maintains an audit trail of past emergencies via our Django backend.

## 🛠 Tech Stack

### Frontend (Mobile App)
- **Framework:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) (`userSlice`, `sosSlice`, `contactsSlice`)
- **Styling:** NativeWind (Tailwind CSS)
- **Native APIs:** Expo Location, Expo SMS, Expo Image Picker

### Backend (REST API)
- **Framework:** Python & [Django REST Framework](https://www.django-rest-framework.org/)
- **Database:** PostgreSQL (`psycopg2-binary`)
- **Authentication:** Firebase Auth (Mocked MVP via `X-Firebase-Uid`)

## 🏗 Architecture

Road-SOS employs a decoupled **Client-Server Architecture**:
1. **Client:** The Expo app manages the UI and interfaces with device hardware (GPS, SMS). 
2. **Server:** The Django REST API processes incoming SOS triggers, stores contact lists, and manages user medical profiles.
3. **Communication:** Data is exchanged via secure JSON payloads over HTTP/REST. 

## 🚀 Getting Started

### Prerequisites
- Node.js & npm/yarn
- Python 3.9+ & pip
- PostgreSQL
- Expo CLI (`npm install -g eas-cli`)

### Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

### Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows

# Install Python requirements
pip install -r requirements.txt

# Run migrations and start server
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```
> **Note:** Ensure your frontend API base URL matches your local IPv4 address (e.g., `http://192.168.x.x:8000/api`).

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET/PUT` | `/api/users/profile/` | Fetch/Update user's medical profile |
| `POST` | `/api/sos/trigger/` | Trigger active SOS & send coordinates |
| `GET/POST`| `/api/services/sos-event/` | Log or fetch historical SOS events |
| `GET/POST`| `/api/contacts/` | Manage emergency contacts (max 5) |

*For testing purposes, requests expect a header of `X-Firebase-Uid: dummy_user_123`.*

## 🤝 Contributors

This project is built and maintained by our incredible team:

- **[Pawan sai G](https://github.com/)** 
- **[Allen Jinto J](https://github.com/)** 
- **[Rogitha Ganapathy](https://github.com/)** 
- **[Nayathra P](https://github.com/)** 

---
<p align="center">
  <i>Developed with ❤️ for a safer tomorrow.</i>
</p>
