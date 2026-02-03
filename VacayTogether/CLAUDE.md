# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VacayTogether is a React Native mobile app built with Expo for sharing vacation photos and memories. Users create albums, organize photos, and chat with trip companions. Targets iOS, Android, and Web.

## Development Commands

```bash
npm start                    # Start Expo development server
npm run android             # Run on Android emulator
npm run ios                 # Run on iOS simulator
npm run web                 # Run on web
npm run lint                # Run ESLint
```

## Architecture

### Routing (Expo Router - File-based)
- `app/_layout.tsx` - Root Stack navigator
- `app/index.tsx` - Dashboard (home screen)
- `app/profile.tsx` - User profile
- `app/album/chat.tsx` - Album photo gallery
- `app/album/conversation.tsx` - Album chat

### Components (`/components`)
- `Dashboard.tsx` - Album list with category color coding
- `AlbumDetail.tsx` - Photo grid (2-column) with upload capability
- `Chat.tsx` - Messaging UI with timestamps, keyboard handling
- `BottomNav.tsx` - Tab navigation (Dashboard/Profile)
- `CreateAlbumModal.tsx` - Album creation form

### Styling
- Theme tokens in `app/styles/theme.ts` (colors, fonts, spacing, radii)
- Light/dark mode definitions (light mode active by default)
- Primary accent: #2563EB
- Uses React Native StyleSheet with inline styles

## Key Configuration

- **TypeScript**: Strict mode, path alias `@/*` maps to project root
- **Expo**: New Architecture enabled, React Compiler enabled
- **ESLint**: Extends `expo/flat`

## Album Categories

Beach, Mountain, City, Road Trip, Nature - each with distinct color coding in the UI.

## Current State

The app has UI implemented but needs backend integration:
- Profile data is hardcoded
- Image picker not implemented
- No authentication/session management
- Help, Notifications, Privacy screens are placeholders
