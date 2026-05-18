# Tesla Battery Temp — Setup Guide

Follow these three steps once and the page will work forever (or until your Tesla access token expires).

---

## Step 1 — Firebase: Firestore rules

In the [Firebase Console](https://console.firebase.google.com):

1. Open your project → **Firestore Database → Rules**
2. Replace the rules with the following and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tesla-config/settings {
      allow read, write: if true;
    }
  }
}
```

> **Why these rules?** The document only stores your token and region.
> Because the page has no login, these rules keep it simple.
> For extra security you can lock it down further with Firebase Auth,
> but for a personal Tesla page this is fine.

---

## Step 2 — Paste your Firebase config into `index.html`

1. Firebase Console → **Project Settings** (⚙ gear icon) → scroll to **Your apps**
2. Copy the `firebaseConfig` object
3. Open `index.html` and replace the placeholder block near the top of the `<script>` section:

```js
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",         // ← replace
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

---

## Step 3 — Deploy to Netlify

### Option A: Drag-and-drop (easiest)
1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Deploy manually**
2. Drag the folder containing `index.html` onto the deploy zone
3. Netlify gives you a URL like `https://your-site.netlify.app`

### Option B: Connect to GitHub
1. Push `index.html` to a GitHub repo
2. Netlify → **Add new site → Import an existing project** → pick your repo
3. Build settings: leave blank (it's a static file); deploy

---

## Step 4 — Add your Netlify URL to the Tesla Developer Portal

Tesla's Fleet API requires your page's origin to be registered.

1. Go to [developer.tesla.com](https://developer.tesla.com) → your app → **Edit**
2. Under **Allowed Origins** (or similar), add your Netlify URL exactly as shown:
   ```
   https://your-site.netlify.app
   ```
3. Save changes

> Without this step, the browser will see a CORS error when it tries to call the Tesla API.

---

## Step 5 — Get a Tesla access token

Tesla tokens for third-party apps are typically obtained via their OAuth flow.
The easiest way for personal use:

1. In your Tesla Developer app settings, generate a token with the scope:
   - `vehicle_device_data`
2. Copy the **Bearer token**
3. Open your Netlify URL, paste the token into the setup screen, and hit **Save & Connect**

The token is saved to Firestore — you won't need to paste it again unless it expires (~8 hours for third-party tokens). When it does, just tap **Change Token / Region** on the page.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Battery temperature isn't available" | Wake the car via the Tesla app first, then refresh |
| CORS error in browser console | Add your Netlify URL to Tesla Developer → Allowed Origins |
| 401 error | Token expired — tap **Change Token** and paste a fresh one |
| Firestore permission denied | Check Step 1 — make sure rules are published |
| Blank page / nothing loads | Check that Firebase config values in `index.html` are correct |
