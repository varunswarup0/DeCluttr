# Sound File Generation for DeCluttr App

Since actual MP3 files cannot be created through text, here are several options to get the required sound files:

## Option 1: Free Sound Libraries

- **Freesound.org**: Download CC0 licensed sounds
- **Zapsplat.com**: Professional sound effects (requires free account)
- **YouTube Audio Library**: Free sound effects from Google

## Option 2: Generate Simple Sounds

You can use online generators or audio software:

1. **Online Tone Generators**:

   - Generate simple beeps/tones at different frequencies
   - For delete: Lower frequency (200-400 Hz), 0.3-0.5 seconds
   - For keep: Higher frequency (600-1000 Hz), 0.3-0.5 seconds

2. **Audio Software** (Audacity, GarageBand, etc.):
   - Create simple sine wave tones
   - Add gentle fade in/out for smoother playback
   - Export as MP3, 44.1kHz, mono, 128kbps

## Option 3: System Sounds

Use built-in Android system sounds:

- Convert system notification sounds to MP3
- Ensure they're brief and not jarring

## Recommended Sound Characteristics:

- **delete.mp3**: Subtle "whoosh" or low-pitched "thud" (300-500ms)
- **keep.mp3**: Pleasant "ding" or "chime" (200-400ms)
- Consider using short 8-bit style blips for a retro Nintendo vibe
- Both should be normalized to -6dB to prevent loud playback

## Quick Setup:

1. Place MP3 files in this directory
2. Name them exactly: `delete.mp3`, `keep.mp3` and (optionally) `tap.mp3`
3. App will automatically detect and use them
4. If files are missing, audio will fail gracefully without errors

## Audio Specifications:

- Format: MP3
- Sample Rate: 44.1 kHz
- Bitrate: 128 kbps (or lower for smaller file size)
- Channels: Mono preferred
- Duration: 0.2 - 1.0 seconds
- Volume: Normalized, not too loud
