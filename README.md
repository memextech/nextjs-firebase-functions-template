# Firebase Next.js Template with Functions

A ready-to-use template for building Next.js applications with Firebase Authentication, Hosting, and Cloud Functions.

## Features

- Next.js 15+ with App Router
- Firebase Authentication with Google Sign-in
- Firebase Hosting configuration
- Firebase Cloud Functions with TypeScript
- Secure secrets management for Functions
- Admin-protected routes (configurable)
- TypeScript support
- Tailwind CSS for styling

## Getting Started

Follow the steps in `setup_checklist.md` to get your project up and running.

## Project Structure

- `/hosting` - Next.js application
  - `/app` - App components, context, and utilities
  - `.env.local.sample` - Template for Firebase configuration

## Development Commands

- Local development: `cd hosting && npm run dev`
- Local Firebase server: `firebase serve --only hosting,functions`
- Build for production: `cd hosting && npm run build`
- Deploy to preview: `firebase hosting:channel:deploy preview-1`
- Deploy UI to production: `firebase deploy --only hosting`
- Deploy Functions to production: `firebase deploy --only functions`

## Authentication

This template uses Firebase Authentication with Google Sign-in. The admin protection is bypassed in development mode but can be enabled for production.

## Firebase Functions

This template includes a sample Firebase Function (`getProduct`) that demonstrates:
- Authentication verification
- Using secure secrets
- Accessing Firestore data
- Error handling

### Setting Up Secrets for Functions

1. Add your secrets locally for development:
   ```
   firebase functions:secrets:set DEMO_SECRET_KEY
   ```

2. Access the secret in your function:
   ```typescript
   import {defineSecret} from "firebase-functions/params";
   
   const mySecret = defineSecret("DEMO_SECRET_KEY");
   
   export const myFunction = functions.https.onCall(
     {secrets: [mySecret]},
     async (request) => {
       const secretValue = mySecret.value();
       // Use the secret value
     }
   );
   ```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting/test-preview-deploy)
- [Firebase Functions Guide](https://firebase.google.com/docs/functions)
- [Firebase Secrets Management](https://firebase.google.com/docs/functions/config-env)


