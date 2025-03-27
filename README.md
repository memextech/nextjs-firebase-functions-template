# Firebase Next.js Template

A ready-to-use template for building Next.js applications with Firebase Authentication and Hosting.

## Features

- Next.js 15+ with App Router
- Firebase Authentication with Google Sign-in
- Firebase Hosting configuration
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
- Local Firebase server: `firebase serve --only hosting`
- Build for production: `cd hosting && npm run build`
- Deploy to preview: `firebase hosting:channel:deploy preview-1`
- Deploy UI to production: `firebase deploy --only hosting`
- Deploy Functions to production: `firebase deploy --only functions`

## Authentication

This template uses Firebase Authentication with Google Sign-in. The admin protection is bypassed in development mode but can be enabled for production.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting/test-preview-deploy)


