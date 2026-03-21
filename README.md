# Pact

A social habit-tracking app where friends make commitments together and hold each other accountable through photo verification.

## Overview

Pact lets users create shared habits ("pacts") with friends. Each pact has a schedule (daily or weekly), and participants verify completion by submitting photos that are analyzed by AI. Streaks are group-based: everyone in the pact must complete the task for the streak to continue. The app features dark/light theming, animated interactions, and a GitHub-style activity contribution graph.

**Tech stack:** React Native, Expo SDK 54, Expo Router, TypeScript

## Features

### Pacts

- **Create pacts** with a title, icon (20 Ionicons to choose from), frequency, and invited friends
- **Two frequency modes:**
  - **Daily** — must be completed every day by the deadline
  - **Weekly** — must be completed a set number of times per week (1x to 6x)
- **Group accountability** — all participants share the same streak; if one person misses, everyone's streak resets
- **Deadlines** — each pact has a configurable daily deadline (e.g., 09:00, 22:00, 23:59)

### Streaks

- **Daily streaks** count consecutive days where all participants completed the task
- **Weekly streaks** count consecutive weeks where all participants met the weekly target (e.g., 5x/week)
- **Per-pact calendar grid** shows the current month with completed days highlighted
- **Aggregate activity graph** — a GitHub contribution graph-style heatmap showing overall activity across all pacts. 4 intensity levels based on how many pacts were completed each day
- **Progress ring** shows weekly completion rate per pact
- **Longest streak** tracked separately per pact

### Camera & AI Verification

The verification flow works without pre-selecting a pact — AI detects which pact the photo matches:

1. **Open camera** — tap the shutter button or pick from photo library
2. **Preview** — review the photo with options to retake, crop, or verify
3. **AI analysis** — animated scanning overlay with status text cycling
4. **Result:**
   - **Match found** — confetti animation, verified pact card with streak count, "Send to Pact" button. Option to change the detected pact if AI got it wrong
   - **No match** — error state with "Try Again" button

### Notifications

Four notification types:

| Type | Description | Example |
|------|-------------|---------|
| Nudge | A friend reminds you to complete your pact | "Sarah nudged you: Don't break the streak!" |
| Deadline warning | A pact deadline is approaching | "Meditation deadline is in 2 hours!" |
| Streak milestone | Group hit a streak milestone | "22-day reading streak!" or "4-week Healthy Meals streak!" |
| New submission | A friend submitted their verification | "Jake just submitted his morning run!" |

Weekly pacts get deadline warnings based on remaining days in the week and progress toward the weekly target.

### Nudging

- On the home screen, pact cards show which friends haven't submitted today
- Tap a friend's avatar to nudge them individually, or use "Nudge All"
- Shake animation + haptic feedback on nudge
- On the pact detail screen, each participant row has a nudge button if they haven't submitted

### Theming

- **Dark mode** (default) — near-black backgrounds with bright accent colors
- **Light mode** — light green-tinted backgrounds with muted accent colors for better contrast
- **System mode** — follows device preference
- Toggle via the sun/moon button on the home screen header
- Theme preference persists across app restarts (AsyncStorage)
- All accent colors are adapted per theme using `adaptColor()` — bright colors in dark mode, muted/darkened in light mode

### Profile

- User avatar, display name, and username
- Stats: total pacts, combined streak days, total verifications
- Appearance toggle (light/dark)
- Friends list with avatars
- Notifications link

## App Structure

### Screens

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Home | Pact cards, activity feed, deadline warnings |
| `/new-pact` | Create Pact | Form with icon picker, frequency, friend selector |
| `/streaks` | Streaks | Activity graph + per-pact streak cards |
| `/camera` | Verify | Camera capture, AI analysis, verification result |
| `/pact/[id]` | Pact Detail | Participants, calendar, submissions, stats |
| `/profile` | Profile | User info, stats, settings |
| `/notifications` | Notifications | Notification list with read/unread state |

### Navigation

- **Bottom tab bar** — 4 tabs: Pacts, New, Streaks, Verify
  - Camera/Verify tab has a distinct inverted-color button (light on dark, dark on light)
  - Tab bar uses BlurView backdrop with haptic feedback
- **Stack navigation** — pact detail, profile, and notifications push onto the stack
- **Modals** — photo lightbox, pact picker (bottom sheet)

### Component Architecture

```
src/components/
├── camera/          # Camera flow (ShutterButton, PhotoPreview, AIAnalyzing, VerificationResult, PactMatchCard)
├── create/          # Pact creation (IconSelector, FrequencyPicker, FriendSelector)
├── pacts/           # Pact display (PactCard, ActivityFeed, ActivityWidget, DeadlineWarning, ParticipantRow, NudgeButton, PactDetailHeader)
├── shared/          # Layout (Header, TabBar, EmptyState)
├── streaks/         # Streak viz (StreakCard, StreakCounter, CalendarGrid, ActivityGraph)
└── ui/              # Primitives (Avatar, AvatarGroup, Badge, Button, Card, Chip, IconBadge, Logo, ProgressRing)
```

### Data Layer

All data is local mock data in `src/data/mock.ts`:

- **6 users** (1 current + 5 friends)
- **5 pacts** (4 daily, 1 weekly)
- **24 submissions** with photo URLs
- **15 streak records** across pact/user combinations
- **6 notifications** across 4 types

Helper functions: `getUserById`, `getPactById`, `getSubmissionsForPact`, `getStreakForUserPact`, `getParticipants`, `getPendingParticipants`, `getCompletionRate`, `getAggregateActivity`, `getRecentActivity`, `getUnreadNotificationCount`

### Design System

Defined in `src/constants/theme.ts`:

- **Colors** — dark and light palettes with semantic naming (background x3, text x4, border x2, overlay x4, accent x6, status x3, streak x2)
- **App palette** — `#4ECDC4`, `#FF6B6B`, `#FFE66D`, `#95E1D3`, `#F38181`, `#7EDCD6`, `#292F36`
- **Spacing** — 8-point scale (2, 4, 8, 12, 16, 20, 24, 32, 48)
- **Typography** — 10 named styles from hero (34px) to tabLabel (10px)
- **Border radius** — 8, 12, 16, 20, 24, 9999
- **Shadows** — 4 presets (sm, md, lg, glow)
- **`withAlpha(color, alpha)`** — hex to rgba utility
- **`adaptColor(color, isDark)`** — maps bright accents to muted variants for light mode

## Running the App

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `expo` ~54 | Expo SDK |
| `expo-router` ~6 | File-based navigation |
| `react-native` 0.81 | Core framework |
| `expo-blur` | BlurView for tab bar |
| `expo-haptics` | Haptic feedback on interactions |
| `expo-image-picker` | Photo library access |
| `expo-linear-gradient` | Gradient overlays |
| `react-native-svg` | Progress rings, logo |
| `react-native-reanimated` | Animations |
| `@react-native-async-storage/async-storage` | Theme persistence |
| `@expo/vector-icons` | Ionicons icon set |

## PWA Support

The web version is installable as a Progressive Web App. All PWA files are web-only and do not affect native iOS/Android builds.

- `public/manifest.json` — app manifest (standalone display, theme colors, icons)
- `public/sw.js` — service worker caching static assets (API calls pass through untouched)
- `public/icon-{192,512}x{192,512}.png` — PWA icons generated from `assets/logo.png`
- `scripts/inject-pwa.js` — post-build script that injects manifest link, meta tags, and SW registration into `dist/index.html`

Build command: `npx expo export --platform web && node scripts/inject-pwa.js`

## Notes

- **No real camera** — uses `expo-image-picker` (photo library) to simulate camera capture.
- **Deep link scheme** — `pact://` (configured in app.json).
