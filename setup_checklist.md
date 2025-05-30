# Firebase Next.js Setup Checklist

Follow these steps to set up your Firebase Next.js project from this template:

## 1. Firebase Setup
- [ ] Ensure Node.js v22 is installed
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login to Firebase: `firebase login`
- [ ] Enable web frameworks: `firebase experiments:enable webframeworks`
- [ ] Ask `user` to create new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
- [ ] Ask `user` to switch to Blaze plan to enable advanced features
- [ ] Ask `user` to register new web app in the Firebase project
- [ ] Ask `user` to enable Google Authentication in the Firebase Console

## 2. Project Configuration
- [ ] Update `.firebaserc` with the new Firebase project ID. Ask `user` to provide it.
- [ ] Create `.env.local` from the sample: `cd hosting && cp .env.local.sample .env.local`
- [ ] Ask `user` to provide web app config from Firebase console and update values in `.env.local`
- [ ] Install dependencies: `cd hosting && npm install`

## 2.1 Firestore
- [ ] Ask `user` to enable Firestore in Firebase Console with production setup
- [ ] Update the Rules to allow only authenticated traffic by running `firebase deploy --only firestore:rules`. Rules are defined in `firestore.rules` 

## 2.2 Functions
- [ ] Ask `user` to enable Functions in Firebase Console
- [ ] Install Functions dependencies: `cd functions && npm install`
- [ ] Set up secrets for Functions: `firebase functions:secrets:set DEMO_SECRET_KEY` using interactive terminal

## 3. Local Development using emulator
- [ ] Start emulators using interactive terminal `firebase emulators:start`
- [ ] Test the application at http://localhost:8099

## 4. Deployment
- [ ] Build Functions: `cd functions && npm run build`
- [ ] Deploy Functions: `firebase deploy --only functions`
- [ ] Build the application: `cd hosting && npm run build`
- [ ] Deploy to a preview channel: `firebase hosting:channel:deploy preview-1`
- [ ] Test the preview deployment
- [ ] Deploy to production: `firebase deploy --only hosting`
- [ ] Add your hosting domain to authorized domains in Firebase Authentication

## 5. Setup Subscription with LemonSqueezy to see Newsletter page
- [ ] Register new account with Lemon Squeezy if user doesn't have one
- [ ] Create new Product with Pricing: Subscription, Pricing model: Standard pricing. Set price and subscription period and click Save.
- [ ] Create `API key` in Settings/API
- [ ] Setup Webhooks in Settings/Webhooks
    - [ ] set `Signing secret`
    - [ ] select `subscription_created` and `subscription_expired` events
    - [ ] Callback URL will be set later when the firebase function `lemonSqueezyHandleWebhooks` is created
- [ ] Set Lemon Squeezy secrets in Firebase
    - [ ] Add `API key` created above to firebase secrets `firebase functions:secrets:set LEMON_SQUEEZY_API_KEY`
    - [ ] Add `Signing secret` created above to firebase secrets `firebase functions:secrets:set LEMON_SQUEEZY_SIGNING_SECRET`
    - [ ] Add store id (you can find it in Settings/Stores) to firebase secrets `firebase functions:secrets:set LEMON_SQUEEZY_STORE_ID`
    - [ ] Add product variant id (you can find it when clicking ... in Store/Products) to firebase secrets `firebase functions:secrets:set LEMON_SQUEEZY_VARIANT_ID`
- [ ] Deploy functions to firebase `firebase deploy --only functions`
- [ ] Set Webhooks Callback URL to the url of the `lemonSqueezyHandleWebhooks` function that can be found in firebase console

## 5. Local Development connecting to Firebase Cloud
- [ ] Start the development server using interactive terminal: `cd hosting && npm run dev`
- [ ] Test the application at http://localhost:3000
- [ ] Alternatively, use Firebase serve: `firebase serve --only hosting`

## 6. Production Considerations
- [ ] Implement proper admin claims using Firebase Cloud Functions
- [ ] Set up a custom domain (if needed)
- [ ] Configure Firebase security rules
