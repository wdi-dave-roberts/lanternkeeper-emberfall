# Technology Stack

**Analysis Date:** 2026-04-11

## Languages

**Primary:**
- TypeScript 5.9.2 - All application code and configuration

**Secondary:**
- JavaScript - Package scripts and build tooling

## Runtime

**Environment:**
- Node.js - Build and development environment
- Expo - Runtime for iOS, Android, and web

**Package Manager:**
- npm - Dependency management
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Expo ~54.0.31 - Cross-platform runtime and build system
- React Native 0.81.5 - UI framework
- React 19.1.0 - Component library and hooks

**Navigation:**
- Expo Router ~6.0.21 - File-based routing system
- React Navigation 7.1.8 - Navigation infrastructure
  - Bottom tabs navigation via `@react-navigation/bottom-tabs` ^7.4.0
  - Navigation elements via `@react-navigation/elements` ^2.6.3

**UI & Animation:**
- expo-linear-gradient ~15.0.8 - Gradient rendering
- react-native-reanimated ~4.1.1 - Gesture-driven animation library
- react-native-gesture-handler ~2.28.0 - Touch gesture detection
- expo-haptics ~15.0.8 - Haptic feedback (vibration)

**Icons & Assets:**
- @expo/vector-icons ^15.0.3 - Icon library
- expo-symbols ~1.0.8 - Apple SF Symbols support
- expo-image ~3.0.11 - Optimized image component
- expo-font ~14.0.10 - Custom font loading

**Safe Area & Accessibility:**
- react-native-safe-area-context ~5.6.0 - Safe area handling for notches
- react-native-screens ~4.16.0 - Native screen management

**Platform Support:**
- react-native-web ~0.21.0 - Web support for React Native components

## Key Dependencies

**Critical:**
- @react-native-async-storage/async-storage ^2.2.0 - Local persistent storage for logs and idea seeds
- react-native-worklets 0.5.1 - Low-level animation worklets

**Infrastructure:**
- expo-status-bar ~3.0.9 - Status bar management
- expo-system-ui ~6.0.9 - System UI customization
- expo-splash-screen ~31.0.13 - Splash screen configuration
- expo-linking ~8.0.11 - Deep linking support
- expo-web-browser ~15.0.10 - Web browser integration
- expo-constants ~18.0.13 - Expo app constants access
- react-dom 19.1.0 - DOM rendering for web platform

## Configuration

**TypeScript:**
- Config: `tsconfig.json`
- Extends: `expo/tsconfig.base`
- Strict mode: enabled
- Path aliases: `@/*` resolves to project root

**Linting:**
- ESLint 9.25.0
- Config: `eslint.config.js`
- Preset: `eslint-config-expo` ~10.0.0 (Expo linting rules)

**App Configuration:**
- File: `app.json`
- Orientation: portrait
- New Architecture: enabled (`newArchEnabled: true`)
- React Compiler: enabled (`reactCompiler: true`)
- Typed Routes: enabled (`typedRoutes: true`)

**Build Targets:**
- iOS (supports tablet)
- Android (edge-to-edge mode, adaptive icon)
- Web (static output)

## Platform Requirements

**Development:**
- Node.js (version via npm/package manager)
- TypeScript 5.9.2+
- Expo CLI (included via `expo` package)

**Production:**
- iOS: iOS 12+ (configured in `app.json`)
- Android: API level varies by Expo version
- Web: Modern browsers with React support

## Development Scripts

**Available in `package.json`:**
```
npm start              # Start Expo development server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run in web browser
npm run lint          # Run ESLint
npm run reset-project # Reset project to clean state
```

## Data Storage

**Local Only:**
- No cloud synchronization
- No backend API integration
- Device-local persistence via AsyncStorage

## Notable Tech Choices

**Why No Backend:**
- Designed for local data only (user privacy first)
- Logs stored in `@lanternkeeper_logs` AsyncStorage key
- Idea seeds stored in `@lanternkeeper_seeds` AsyncStorage key
- Max 100 log entries, 200 idea seeds retained per device

**Why React Native + Expo:**
- Single codebase for iOS, Android, web
- Fast development iteration
- No native code required
- Built-in Expo services for builds and updates

**Why Reanimated + Gesture Handler:**
- Smooth 60 FPS animations for interactive elements
- Native gesture recognition without network calls
- Fog/leaf clearing animations driven by touch

---

*Stack analysis: 2026-04-11*
