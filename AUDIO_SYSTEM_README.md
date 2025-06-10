# Audio System for DeCluttr App

This document describes the sound effects implementation for swipe actions in the DeCluttr app.

## Overview

The audio system provides audio feedback when users swipe photos:

- **Swipe Left (Delete)**: Plays `delete.mp3` sound
- **Swipe Right (Keep)**: Plays `keep.mp3` sound
- Subtle haptic vibration accompanies each swipe for a satisfying feel

## Implementation Details

### Core Components

1. **Swipe Audio Hook** (`lib/useSwipeAudio.ts`)

   - React hook that delegates sound playback to a central `audioService`
   - The service uses `expo-audio` under the hood and preloads sound files
   - Volume and enabled state are synced with user preferences
   - Handles missing files or initialization errors gracefully

2. **Audio Settings Hook** (`lib/useAudioSettings.ts`)

   - Manages user audio preferences independently
   - Persists settings using AsyncStorage
   - Provides enable/disable and volume controls

3. **UI Components**
   - Basic audio settings and test screens were removed in the minimal build.
     Sound still plays automatically via `useSwipeAudio` with default
     preferences.

### Integration Points

1. **SwipeCard Component** (`components/SwipeCard.tsx`)

   - Primary integration point for audio feedback
   - Uses `useSwipeAudio` hook for sound management
   - Plays sounds directly in gesture handler using `runOnJS`
   - Ensures immediate audio response to swipe gestures

2. **Profile Screen**
   - Removed to streamline the app. Audio preferences are loaded from
     storage but no longer have a dedicated settings UI.

## File Structure

```
assets/sounds/
├── delete.mp3              # Delete action sound effect
├── keep.mp3               # Keep action sound effect
├── README.md              # Basic setup instructions
└── SETUP_INSTRUCTIONS.md  # Detailed sound file setup guide

lib/
├── useSwipeAudio.ts       # Hook-based audio functionality
└── useAudioSettings.ts    # Audio settings management

components/
└── SwipeCard.tsx          # Core swipe UI
```

## Sound File Requirements

### Technical Specifications

- **Format**: MP3
- **Duration**: 0.2 - 1.0 seconds
- **Sample Rate**: 44.1 kHz
- **Bitrate**: 128 kbps or lower
- **Channels**: Mono preferred
- **Volume**: Normalized to -6dB

### Sound Characteristics

- **delete.mp3**: Subtle "whoosh", "thud", or low-pitched sound (300-500ms)
- **keep.mp3**: Pleasant "ding", "chime", or success sound (200-400ms)

## Features

### Audio Settings

- **Enable/Disable**: Toggle sound effects on/off
- **Volume Control**: Adjust sound effect volume (0-100%)
- **Persistence**: Settings saved to device storage
- **Real-time**: Volume changes apply immediately

### Graceful Degradation

- App continues to work if sound files are missing
- Errors are logged but don't crash the app
- Hook-based approach ensures proper cleanup

### Performance Optimization

- The `audioService` preloads sounds once and reuses them across components
- Automatic cleanup when the service is destroyed
- Volume changes apply immediately when preferences change

## Usage

### For Users

1. Swipe photos normally - sounds play automatically.
2. Sound settings are not exposed in the minimal build, but can be
   adjusted programmatically via `useAudioSettings`.
3. Disable the sound hook if a silent experience is preferred.

### For Developers

1. Place MP3 files in `assets/sounds/` directory
2. Use `useSwipeAudio` hook in components that need audio feedback
3. Audio settings are managed through useAudioSettings hook
4. Sounds integrate seamlessly with React component lifecycle

## Error Handling

The audio system handles several error scenarios:

- Missing sound files (graceful degradation)
- Audio permission issues (silent failure)
- Device muted or in Do Not Disturb mode
- Low memory conditions (proper cleanup)

## Testing

The previous Audio Test screen was removed. Developers can verify audio
by calling the functions returned from `useSwipeAudio` during testing.

## Future Enhancements

Potential improvements for future versions:

- Additional sound themes
- Sound customization options
- Accessibility audio cues
- Background music controls

## Troubleshooting

### No Sound Playing

1. Check if sound files exist in `assets/sounds/`
2. Verify audio is enabled in app settings
3. Check device volume level
4. Ensure device is not muted
5. Check console for audio hook initialization errors

### Poor Performance

1. Ensure sound files are small (< 100KB each)
2. Check if files are properly compressed
3. Monitor memory usage in development tools
4. Verify hook cleanup is working properly when components unmount

## Dependencies

- `expo-audio`: Underlying playback library used by `audioService`
- `expo-haptics`: Tactile feedback on swipe actions
- `@react-native-async-storage/async-storage`: Settings persistence
- `react-native-reanimated`: Gesture integration
