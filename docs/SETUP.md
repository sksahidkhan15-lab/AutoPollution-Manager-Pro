# AutoPollution Manager Pro - Complete Setup Guide

## Overview
AutoPollution Manager Pro is a commercial multi-tenant SaaS platform built for Indian Motor Vehicle Pollution Testing Centres (PUC). It allows individual testing centres to manage vehicle emission test records, track certificate expirations, and send reminders via **100% Free One-Click WhatsApp/SMS** as well as **Automated Scheduled Background Reminders (8:00 AM IST)** via Meta WhatsApp Cloud API.

---

## 1. Local Environment Requirements
- **Node.js**: v18 or v20 LTS
- **Firebase CLI**: `npm install -g firebase-tools`
- **Android Studio / Android SDK**: API 34+ for Android container build
- **Browser**: Any modern browser (Chrome, Edge, Firefox, Safari)

---

## 2. Directory Structure
```
autopollution-manager-pro/
├── frontend/               # Complete web app & PWA
│   ├── index.html          # Public landing & pricing
│   ├── login.html          # Multi-tenant centre & admin login
│   ├── register.html       # Centre registration (pending status)
│   ├── dashboard.html      # 7-card metrics dashboard
│   ├── vehicles.html       # Vehicle registry, search & filter
│   ├── add-vehicle.html    # Add/edit vehicle with auto uppercase
│   ├── reminders.html      # Due reminders & history log
│   ├── subscription.html   # Plan comparison & Razorpay billing
│   ├── settings.html       # Centre profile & Meta Cloud API config
│   ├── admin.html          # Super Admin governance portal
│   ├── terms.html          # CMVR & TRAI compliance terms
│   ├── privacy.html        # DPDP & customer consent policy
│   ├── css/style.css       # Professional green & white theme
│   ├── js/                 # Modular client storage & logic
│   └── manifest.json       # Android PWA manifest
├── backend/                # Server-side API & Cloud Functions
│   ├── functions/index.js  # Express REST API & scheduled jobs
│   ├── api/                # Modular endpoints (auth, vehicles, payments)
│   ├── services/           # WhatsApp Cloud API, DLT SMS, Razorpay
│   ├── webhooks/           # WhatsApp delivery & Razorpay captured
│   └── scheduled-jobs/     # 8:00 AM IST daily cron engine
├── database/               # Firestore security rules & indexes
├── docs/                   # Setup, deployment, security guides
└── app/                    # Native Android application wrapper
```

---

## 3. Running Backend Locally
```bash
cd backend
npm install
node functions/index.js
```
The server will start on `http://localhost:8080`.

---

## 4. Running Web Frontend
Serve the `frontend/` directory with any static server or Firebase Hosting emulator:
```bash
npx serve frontend -p 3000
```
Open `http://localhost:3000` in your browser.

---

## 5. Demo Accounts
- **Approved Centre Demo**:
  - Login: `9876543210` or `sahid.puc@gmail.com`
  - Password: `123456`
  - Access: Full Vehicle Management, One-Click WhatsApp/SMS, Settings
- **Pending Approval Centre Demo**:
  - Login: `9811223344`
  - Password: `123456`
  - Demonstrates: Guard against unauthorized access until approved
- **Super Administrator**:
  - Login: `admin@autopollution.com`
  - Password: `Admin@123`
  - Access: Approval Queue, Plan Changer, Pricing Editor, All Centre Analytics
