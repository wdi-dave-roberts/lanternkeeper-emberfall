# External Integrations

**Analysis Date:** 2026-04-11

## APIs & External Services

**None.**

The app is intentionally designed with zero external API integrations. All data and logic exist entirely on the user's device. No server calls, no tracking, no data collection.

## Data Storage

**Local Storage Only:**
- AsyncStorage (React Native local persistence)
  - No cloud backend
  - No database synchronization
  - No network access required

**Data Structure:**
```
@lanternkeeper_logs      # DailyLog entries (max 100)
@lanternkeeper_seeds     # IdeaSeed entries (max 200)
@lanternkeeper_lastCheckIn # Last check-in date (YYYY-MM-DD)
```

**Storage Implementation:**
- File: `src/storage/storage.ts`
- All persistence via AsyncStorage
- Data serialized as JSON
- No encryption (stored as-is on device filesystem)

## File Storage

**Local filesystem only.**

Assets stored in:
- `assets/images/` - App icons, splash screens, backgrounds

No cloud storage integration. No image upload/download endpoints.

## Caching

**None explicitly configured.**

React component state and memoization handled by React/React Native native capabilities.

## Authentication & Identity

**Not applicable.**

No user accounts, authentication, or identity system. The app works entirely for a single local user with no sign-in required.

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Console logging only via `console.log()`
- No error reporting service (Sentry, Rollbar, etc.)
- No analytics tracking

**Example error handling:**
- File: `src/storage/storage.ts` lines 46-49
- Errors logged locally only: `console.log('Error loading state:', error)`

## CI/CD & Deployment

**Hosting:**
- Not applicable for this app
- Built as standalone mobile/web apps
- Users install via App Store, Google Play, or web browser

**Build System:**
- Expo (handles all build orchestration)
- No CI pipeline configured
- Manual builds via local machine

**Distribution:**
- Expo Go app for development testing
- Expo Application Services (EAS) for production builds (not configured)

## Environment Configuration

**No environment variables required.**

The app contains no `.env` file and requires no external credentials or API keys.

**Build Configuration:**
- All configuration in `app.json`
- No secrets or tokens needed

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

The app receives no webhooks and makes no outbound HTTP calls.

## Data Privacy Model

**User Data:**
- All user data (logs, idea seeds, emotion history) stays on device
- No transmission to servers
- No analytics collection
- No tracking
- No third-party data sharing

**Why This Matters:**
- Aligns with app's core philosophy: "Understood, Inspired, Less Pressured"
- User's inner state is private by design
- No vendor lock-in
- No cloud dependency

## Third-Party Libraries (No Integrations)

The dependencies are all local frameworks and UI libraries:
- React Navigation - local routing, no external service
- expo-haptics - device vibration, no external service
- expo-linear-gradient - device rendering, no external service
- react-native-reanimated - device animation, no external service

None of these libraries make network calls by default.

## Future Integration Points (If Needed)

Should you ever add features like:
- **Cloud backup** → Would need cloud storage (Firebase, AWS S3, etc.)
- **Multiplayer/sharing** → Would need backend API
- **Analytics** → Would need events service (Amplitude, Mixpanel, etc.)
- **Push notifications** → Would need push service (Firebase Cloud Messaging)
- **Social features** → Would need authentication and API

For now: **all zero**. This is intentional.

---

*Integration audit: 2026-04-11*
