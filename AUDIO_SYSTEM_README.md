# Audio System for DeClutter App

This document describes the sound effects implementation for swipe actions in the DeClutter app.

## Overview

The audio system provides audio feedback when users swipe photos:

- **Swipe Left (Delete)**: Plays `delete.mp3` sound
- **Swipe Right (Keep)**: Plays `keep.mp3` sound

## Implementation Details

### Core Components

1. **Swipe Audio Hook** (`lib/useSwipeAudio.ts`)

   - React hook managing swipe sound effects using expo-audio
   - Provides separate audio players for delete and keep sounds
   - Automatically applies volume settings from user preferences
   - Handles error cases gracefully

2. **Audio Settings Hook** (`lib/useAudioSettings.ts`)

   - Manages user audio preferences independently
   - Persists settings using AsyncStorage
   - Provides enable/disable and volume controls

3. **UI Components**
   - `AudioSettingsSection`: Settings panel for audio controls
   - `AudioTestSection`: Test panel to verify audio functionality

### Integration Points

1. **SwipeCard Component** (`components/SwipeCard.tsx`)

   - Primary integration point for audio feedback
   - Uses `useSwipeAudio` hook for sound management
   - Plays sounds directly in gesture handler using `runOnJS`
   - Ensures immediate audio response to swipe gestures

2. **Profile Screen** (`app/(drawer)/profile.tsx`)
   - Provides audio settings and test interface
   - Allows users to control audio preferences

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
├── AudioSettingsSection.tsx  # Settings UI component
└── AudioTestSection.tsx      # Audio testing UI component
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

- Uses expo-audio's `useAudioPlayer` hooks for efficient audio management
- Automatic cleanup when components unmount
- Volume changes apply immediately through hook integration

## Usage

### For Users

1. Swipe photos normally - sounds play automatically
2. Adjust settings in Profile → Audio Settings
3. Test sounds using the Audio Test section
4. Disable if preferred for silent operation

### For Developers

1. Place MP3 files in `assets/sounds/` directory
2. Use `useSwipeAudio` hook in components that need audio feedback
3. Audio settings are managed through useAudioSettings hook
4. Sounds integrate seamlessly with React component lifecycle

## Error Handling

The audio system handles several error scenarios:

- Missing sound files (graceful degradation)
- Audio permission issues (silent failure)
- Device in silent mode (respects iOS silent switch)
- Low memory conditions (proper cleanup)

## Testing

Use the Audio Test section in the Profile screen to:

- Verify sound files are loading correctly
- Test volume levels
- Confirm audio settings are working
- Debug audio issues

## Future Enhancements

Potential improvements for future versions:

- Additional sound themes
- Haptic feedback integration
- Sound customization options
- Accessibility audio cues
- Background music controls

## Troubleshooting

### No Sound Playing

1. Check if sound files exist in `assets/sounds/`
2. Verify audio is enabled in app settings
3. Check device volume level
4. Ensure device is not in silent mode (iOS)
5. Check console for audio hook initialization errors

### Poor Performance

1. Ensure sound files are small (< 100KB each)
2. Check if files are properly compressed
3. Monitor memory usage in development tools
4. Verify hook cleanup is working properly when components unmount

## Dependencies

- `expo-audio`: Modern audio playback functionality with React hooks
- `@react-native-async-storage/async-storage`: Settings persistence
- `react-native-reanimated`: Gesture integration
