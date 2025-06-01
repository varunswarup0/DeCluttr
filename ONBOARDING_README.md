# Onboarding System Documentation

## Overview

This document provides details about the onboarding system implemented in Decluttr, which displays a 3-step introduction to new users on their first launch.

## Implementation Details

### Key Components

1. **Onboarding Screen**: A 3-step swiper using `react-native-onboarding-swiper` to introduce users to the app's key features.
2. **State Management**: Using Zustand store (`useRecycleBinStore`) to track and persist onboarding completion status.
3. **Persistence**: AsyncStorage is used to remember whether a user has completed onboarding.

### Features

- **First Launch Detection**: Shows onboarding only to new users using AsyncStorage
- **Skip Option**: Users can skip the onboarding process
- **Completion Tracking**: Once completed, onboarding will not show again
- **Fallback Mechanism**: Uses in-memory storage if AsyncStorage fails

### Flow

1. App checks if onboarding is completed on launch
2. If not completed, redirects to onboarding screens
3. User swipes through or skips onboarding
4. Completion status is saved to AsyncStorage
5. User is redirected to the main app

## Customization

### Screens

The onboarding consists of 3 screens:

1. **Declutter Your Photos**: Introduces the main swipe feature for managing photos
2. **Recycle Bin**: Explains the recycle bin functionality for restoring photos
3. **Earn XP**: Highlights the XP system for tracking decluttering progress

### Styling

The onboarding UI is fully customized with:

- Custom buttons for Next, Skip, and Done actions
- Tailored color schemes for each screen
- Custom typography and spacing

## Related Files

- `app/onboarding.tsx`: Main onboarding UI component
- `store/store.ts`: State management for onboarding completion status
- `app/_layout.tsx`: App initialization and route handling

## Extending the Onboarding

To update or extend the onboarding:

1. Modify the `screens` array in `onboarding.tsx` to add/change steps
2. Update styling in the StyleSheet
3. Customize button components as needed
