# grocery-app2 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-23

## Active Technologies
- TypeScript 5.7 (app/test code) and Node.js 22.x for setup/verification scripts + Expo 52, React Native 0.76, React 18, Firebase JS SDK 11, react-native-paper 5, Vitest 2, plus `firebase-admin` for online setup/provision scripts (002-run-app-e2e)
- Online Firebase Firestore + Firebase Auth (multi-project targets, default non-production target) (002-run-app-e2e)

- TypeScript on Expo-managed React Native stack (Android + Web targets) + Expo React Native, react-native-paper (MD3), Firebase Auth, Firestore (001-baseline-spec-bootstrap)

## Project Structure

```text
app/src/
app/tests/
```

## Commands

cd app && npm test && npm run lint

## Code Style

TypeScript on Expo-managed React Native stack (Android + Web targets): Follow standard conventions

## Recent Changes
- 002-run-app-e2e: Added TypeScript 5.7 (app/test code) and Node.js 22.x for setup/verification scripts + Expo 52, React Native 0.76, React 18, Firebase JS SDK 11, react-native-paper 5, Vitest 2, plus `firebase-admin` for online setup/provision scripts

- 001-baseline-spec-bootstrap: Added TypeScript on Expo-managed React Native stack (Android + Web targets) + Expo React Native, react-native-paper (MD3), Firebase Auth, Firestore

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
