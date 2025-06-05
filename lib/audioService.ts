import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { getAsyncStorage } from './asyncStorageWrapper';

export class AudioService {
  private static instance: AudioService;
  private deletePlayer: AudioPlayer | null = null;
  private keepPlayer: AudioPlayer | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Initialize audio service by preloading sound files
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create audio players for each sound
      this.deletePlayer = createAudioPlayer(require('../assets/sounds/delete.mp3'));
      this.keepPlayer = createAudioPlayer(require('../assets/sounds/keep.mp3'));

      // Set initial volume
      const audioSettings = await this.getAudioSettings();
      this.deletePlayer.volume = audioSettings.volume;
      this.keepPlayer.volume = audioSettings.volume;

      this.isInitialized = true;
      console.log('Audio service initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize audio service:', error);
      // Create mock players that fail silently if files don't exist
      this.createMockPlayers();
    }
  }

  /**
   * Create mock player objects that fail silently
   */
  private createMockPlayers(): void {
    const mockPlayer = {
      play: () => {},
      pause: () => {},
      stop: () => {},
      seekTo: () => {},
      volume: 0.8,
      currentTime: 0,
      duration: 0,
      playing: false,
      muted: false,
      loop: false,
      remove: () => {},
    } as any;

    this.deletePlayer = mockPlayer;
    this.keepPlayer = mockPlayer;
    this.isInitialized = true;
    console.log('Audio service initialized with mock players (sound files not found)');
  }

  /**
   * Get audio settings from AsyncStorage
   */
  private async getAudioSettings(): Promise<{ enabled: boolean; volume: number }> {
    try {
      const storage = getAsyncStorage();
      const stored = await storage.getItem('decluttr_audio_settings');
      if (stored) {
        try {
          const settings = JSON.parse(stored);
          return { enabled: settings.enabled ?? true, volume: settings.volume ?? 0.8 };
        } catch {
          // fall through to default if JSON is invalid
        }
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
    return { enabled: true, volume: 0.8 };
  }

  /**
   * Play delete sound effect
   */
  public async playDeleteSound(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check if audio is enabled in settings
      const audioSettings = await this.getAudioSettings();
      if (!audioSettings.enabled) {
        return;
      }

      if (this.deletePlayer) {
        // Reset to beginning and play
        this.deletePlayer.seekTo(0);
        this.deletePlayer.play();
      }
    } catch (error) {
      console.warn('Failed to play delete sound:', error);
    }
  }

  /**
   * Play keep sound effect
   */
  public async playKeepSound(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check if audio is enabled in settings
      const audioSettings = await this.getAudioSettings();
      if (!audioSettings.enabled) {
        return;
      }

      if (this.keepPlayer) {
        // Reset to beginning and play
        this.keepPlayer.seekTo(0);
        this.keepPlayer.play();
      }
    } catch (error) {
      console.warn('Failed to play keep sound:', error);
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.deletePlayer) {
        this.deletePlayer.remove();
        this.deletePlayer = null;
      }

      if (this.keepPlayer) {
        this.keepPlayer.remove();
        this.keepPlayer = null;
      }

      this.isInitialized = false;
      console.log('Audio service cleaned up');
    } catch (error) {
      console.warn('Failed to cleanup audio service:', error);
    }
  }

  /**
   * Set volume for all sounds (0.0 to 1.0)
   */
  public async setVolume(volume: number): Promise<void> {
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));

      if (this.deletePlayer) {
        this.deletePlayer.volume = clampedVolume;
      }

      if (this.keepPlayer) {
        this.keepPlayer.volume = clampedVolume;
      }

      // Save volume setting to AsyncStorage
      const currentSettings = await this.getAudioSettings();
      const storage = getAsyncStorage();
      await storage.setItem(
        'decluttr_audio_settings',
        JSON.stringify({
          ...currentSettings,
          volume: clampedVolume,
        })
      );
    } catch (error) {
      console.warn('Failed to set volume:', error);
    }
  }

  /**
   * Enable or disable audio playback
   */
  public async setEnabled(enabled: boolean): Promise<void> {
    try {
      const currentSettings = await this.getAudioSettings();
      const storage = getAsyncStorage();
      await storage.setItem(
        'decluttr_audio_settings',
        JSON.stringify({
          ...currentSettings,
          enabled,
        })
      );
    } catch (error) {
      console.warn('Failed to set audio enabled state:', error);
    }
  }

  /**
   * Get current audio settings
   */
  public async getSettings(): Promise<{ enabled: boolean; volume: number }> {
    return this.getAudioSettings();
  }
}

// Export singleton instance
export const audioService = AudioService.getInstance();
