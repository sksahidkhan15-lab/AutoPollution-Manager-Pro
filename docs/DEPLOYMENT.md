# Production Deployment Guide

## 1. Firebase Hosting & Cloud Functions Deployment
1. Log in to Firebase CLI:
   ```bash
   firebase login
   ```
2. Link your production Firebase project:
   ```bash
   firebase use --add YOUR_PROJECT_ID
   ```
3. Deploy Firestore rules and indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
4. Deploy Backend Cloud Functions (includes scheduled daily job):
   ```bash
   firebase deploy --only functions
   ```
5. Deploy Web Frontend to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

---

## 2. Environment Variables Configuration
Set the following secrets in Google Cloud Secret Manager or Firebase functions config:
```bash
firebase functions:config:set \
  meta.app_id="YOUR_META_APP_ID" \
  meta.app_secret="YOUR_META_APP_SECRET" \
  meta.webhook_token="YOUR_CUSTOM_VERIFY_TOKEN" \
  razorpay.key_id="rzp_live_XXXXXXXX" \
  razorpay.key_secret="YOUR_RAZORPAY_SECRET" \
  razorpay.webhook_secret="YOUR_RZP_WEBHOOK_SECRET"
```

---

## 3. Android APK & App Bundle Build
To build the signed release APK or Google Play App Bundle:
```bash
gradle :app:assembleRelease
gradle :app:bundleRelease
```
The outputs will be located in `app/build/outputs/apk/release/` and `app/build/outputs/bundle/release/`.
