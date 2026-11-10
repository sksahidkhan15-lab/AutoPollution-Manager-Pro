# AutoPollution Manager Pro 🚗💨

> **Commercial Multi-Tenant SaaS Platform for Indian Pollution Testing Centres (PUC)**  
> Preserving the visual identity and workflow inspired by [Spro-Pollution](https://sksahidkhan15-lab.github.io/Spro-pollution/).

---

## 🌟 Executive Overview
AutoPollution Manager Pro is a production-grade multi-tenant software platform designed specifically for Motor Vehicle Emission Testing Centres across India. It empowers testing centre owners to manage customer records, eliminate paper registers, track certificate expirations, and grow renewal retention via **100% Free One-Click WhatsApp/SMS** and **Automated 8:00 AM IST Daily Cloud Reminders**.

---

## 🚀 Key Features

### 1. 100% Free One-Click WhatsApp & SMS (Available on ALL Plans)
- Free software feature in Basic, Standard, and Premium tiers.
- Formats message with strict bolding on **owner name**, **vehicle number**, and **expiry date**.
- Automatically attaches Centre Name, Official Helpline, Physical Address, Landmark, and Google Maps Navigation link.
- One-click launch in Android WhatsApp / WhatsApp Business or standard browser.

### 2. Server-Side Automated Reminders (8:00 AM IST)
- Powered by Firebase Cloud Functions & Cloud Scheduler.
- Dispatches reminders at **30 days**, **7 days**, and **3 days** prior to PUC certificate expiration.
- Runs on the server even when the centre owner's computer or smartphone is turned off.
- Idempotency guard prevents duplicate messages during network retries.

### 3. Meta WhatsApp Cloud API & Embedded Signup
- Official Meta Graph API v19.0 client architecture.
- Each testing centre connects its own verified WhatsApp Business Account (WABA).
- Real-time delivery status receipts (`sent`, `delivered`, `read`, `failed`).

### 4. Robust Vehicle Management
- Instant search by Vehicle Registration Number, Customer Name, or Mobile Number.
- Auto-uppercase conversion (e.g. `WB02AL4589`, `DL01AB1234`).
- Duplicate vehicle registration prevention within the centre.
- One-click CSV backup and export.

### 5. Super Admin Governance Portal
- Review pending centre registration applications.
- One-click Approve (assigns unique Centre ID) or Reject with reason.
- Manage centre subscription plans (Basic, Standard, Premium) and edit pricing.
- Platform-wide statistics (Total centres, active subscriptions, total vehicles).

### 6. Subscription & Indian Payment Gateway
- Configurable plans: Basic (₹199/mo), Standard (₹399/mo), Premium (₹599/mo).
- Razorpay UPI, Cards, NetBanking with cryptographic HMAC-SHA256 signature verification.
- Printable GST payment receipts and renewal management.

### 7. Regulatory & DPDP Compliance
- Explicit customer messaging consent tracking.
- TRAI / DLT anti-spam adherence.
- **Zero Data Deletion Policy**: Customer vehicle records are never deleted upon subscription expiry.

---

## 📁 Source Code Organization
- `frontend/`: Web Application & PWA (HTML5, CSS3, Vanilla JS)
- `backend/`: Node.js Express REST API, Scheduled Jobs, Webhook listeners
- `database/`: Firestore security rules & composite indexes
- `docs/`: Technical setup, deployment, WhatsApp, and payment guides
- `app/`: Native Android container with Jetpack Compose & WebAppBridge

---

## 🧪 Testing Checklist
- [x] Centre Registration in Pending Status
- [x] Super Admin Approval Queue & ID Generation
- [x] Multi-Tenant Isolated Data Access
- [x] Vehicle Registry (CRUD, Auto Uppercase, Duplicate Check)
- [x] Free One-Click WhatsApp & One-Click SMS
- [x] Meta WhatsApp Cloud API Service & Webhook Statuses
- [x] Daily 8:00 AM IST Scheduled Reminder Cohorts (30d, 7d, 3d)
- [x] Razorpay Order Generation & Cryptographic Verification
- [x] Android Native Container & Intent Bridge
