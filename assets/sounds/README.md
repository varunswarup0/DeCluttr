# Sound Files for DeCluttr App

This folder contains example sound effects used by the app.

## Required Files

- `delete.mp3` - Sound effect played when user swipes left to delete a photo
- `keep.mp3` - Sound effect played when user swipes right to keep a photo

These sample clips are short (~0.5–1s) MP3s. Replace them with your own before shipping.

## Optional Files

- `voice1.mp3` and `voice2.mp3` - short voice clips that occasionally play after deleting a photo
- `tap.mp3` - quick blip that plays when tapping buttons

The included files are silent placeholders. Provide your own voice clips to use this feature.

## File Requirements

- Format: MP3
- Duration: 0.5-2.0 seconds recommended
- Volume: Normalized to prevent sudden loud sounds
- File size: Keep under 100KB for optimal performance

## Sound Suggestions

- **delete.mp3**: Short "zap" or "whoosh" effect for a playful feel
- **keep.mp3**: Pleasant "ding" or "chime" that rewards the swipe
- For a retro vibe, keep the clips under half a second and use 8‑bit samples reminiscent of classic Nintendo games

## How to Add Sounds:

1. Record or download appropriate sound effects
2. Convert to MP3 format if needed
3. Place the files in this directory with the exact names above
4. The app will automatically detect and use them

## Fallback Behavior:

If sound files are not found, the app will continue to work normally without sound effects.
