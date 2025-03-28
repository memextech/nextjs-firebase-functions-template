# Firebase Next.js Setup Checklist

Follow these steps to set up your Firebase Next.js project from this template:

## 1. Firebase Setup
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login to Firebase: `firebase login`
- [ ] Enable web frameworks: `firebase experiments:enable webframeworks`
- [ ] Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
- [ ] Switch to Blaze plan to enable advanced features
- [ ] Register a web app in your Firebase project
- [ ] Enable Google Authentication in Firebase Console

## 2. Project Configuration
- [ ] Update `.firebaserc` with your Firebase project ID
- [ ] Create `.env.local` from the sample: `cd hosting && cp .env.local.sample .env.local`
- [ ] Add your Firebase config values to `.env.local` (from Firebase Console)
- [ ] Install dependencies: `cd hosting && npm install`

## 2.1 Firestore
- [ ] Enable Firestore in Firebase Console with production setup
- [ ] Update the Rules to allow only authenticated traffic by running `firebase deploy --only firestore:rules`. Rules are defined in `firestore.rules` 
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 2.2 Functions
- [ ] Enable Functions in Firebase Console
- [ ] Install Functions dependencies: `cd functions && npm install`
- [ ] Set up secrets for Functions: `firebase functions:secrets:set DEMO_SECRET_KEY` using interactive terminal


## 3. Local Development
- [ ] Start the development server: `cd hosting && npm run dev`
- [ ] Test the application at http://localhost:3000
- [ ] Alternatively, use Firebase serve: `firebase serve --only hosting`

## 4. Deployment
- [ ] Build the application: `cd hosting && npm run build`
- [ ] Deploy to a preview channel: `firebase hosting:channel:deploy preview-1`
- [ ] Test the preview deployment
- [ ] Deploy to production: `firebase deploy --only hosting`
- [ ] Add your hosting domain to authorized domains in Firebase Authentication

## 5. Production Considerations
- [ ] Implement proper admin claims using Firebase Cloud Functions
- [ ] Set up a custom domain (if needed)
- [ ] Configure Firebase security rules
