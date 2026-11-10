# Firebase Setup & Schema Architecture

## 1. Firebase Project Initialization
1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Select region `asia-south1` (Mumbai) for minimum latency across India.
3. Enable **Cloud Firestore** in Production mode.
4. Enable **Firebase Authentication** with Email/Password and Google Sign-In.

---

## 2. Multi-Tenant Firestore Schema
```
/centres/{centreId} (Document)
  ├── centreId: "WB-PUC-7801"
  ├── name: "Maa Tara Auto Emission Testing Centre"
  ├── ownerName: "Sahid Khan"
  ├── phone: "9876543210"
  ├── email: "sahid.puc@gmail.com"
  ├── address: "NH-6 Bombay Road, Near Toll Plaza"
  ├── state: "West Bengal"
  ├── status: "approved" | "pending" | "rejected" | "suspended"
  ├── plan: "standard" | "basic" | "premium"
  ├── subscriptionValidTill: Timestamp
  ├── waConnected: true
  ├── wabaId: "109283746501928"
  ├── phoneId: "108273645192837"
  │
  ├── /vehicles/{vehicleId} (Subcollection - Strict Tenant Isolation)
  │     ├── vno: "WB02AL4589"
  │     ├── owner: "Arun Kumar Mukherjee"
  │     ├── phone: "9830112233"
  │     ├── whatsapp: "9830112233"
  │     ├── vtype: "4W - Car"
  │     ├── fuelType: "Petrol"
  │     ├── pucNo: "WB02260012398"
  │     ├── expDate: "2026-12-15"
  │     ├── consentGiven: true
  │     └── remindersCount: 1
  │
  ├── /reminders/{reminderId} (Subcollection)
  │     ├── vehicleNo: "WB02AL4589"
  │     ├── milestone: "30_DAYS_PRIOR"
  │     ├── channel: "WhatsApp Cloud API"
  │     ├── status: "sent" | "failed" | "pending"
  │     └── timestamp: Timestamp
  │
  └── /settings/config (Subcollection)
        ├── waTemplate: "Dear *{owner}*..."
        └── smsTemplate: "Dear {owner}..."
```
