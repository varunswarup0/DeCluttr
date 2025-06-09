import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { getAsyncStorage } from './asyncStorageWrapper';

export class AudioService {
  private static instance: AudioService;
  private players: Record<string, AudioPlayer | null> = {
    delete: null,
    keep: null,
    tap: null,
  };
  private isInitialized = false;
  private initializing: Promise<void> | null = null;

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
    if (this.initializing) {
      return this.initializing;
    }

    this.initializing = (async () => {
      try {
        this.players = {
          delete: createAudioPlayer(require('../assets/sounds/delete.mp3')),
          keep: createAudioPlayer(require('../assets/sounds/keep.mp3')),
          // Reuse the keep sound for taps to avoid bundling extra assets
          tap: createAudioPlayer(require('../assets/sounds/keep.mp3')),
        };

        const { volume } = await this.getAudioSettings();
        for (const key of Object.keys(this.players)) {
          this.players[key]!.volume = volume;
        }

        this.isInitialized = true;
      } catch (error) {
        console.warn('Failed to initialize audio service:', error);
        this.createMockPlayers();
      } finally {
        this.initializing = null;
      }
    })();
    return this.initializing;
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

    this.players = {
      delete: mockPlayer,
      keep: mockPlayer,
      tap: mockPlayer,
    };
    this.isInitialized = true;
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

  private async playSound(player: AudioPlayer | null): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const audioSettings = await this.getAudioSettings();
      if (!audioSettings.enabled || !player) {
        return;
      }

      player.seekTo(0);
      player.play();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /** Play delete sound effect */
  public async playDeleteSound(): Promise<void> {
    return this.playSound(this.players.delete);
  }

  /** Play keep sound effect */
  public async playKeepSound(): Promise<void> {
    return this.playSound(this.players.keep);
  }

  /** Play generic tap sound effect */
  public async playTapSound(): Promise<void> {
    return this.playSound(this.players.tap);
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      for (const key of Object.keys(this.players)) {
        const player = this.players[key];
        if (player) {
          player.remove();
          this.players[key] = null;
        }
      }

      this.isInitialized = false;
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

      for (const player of Object.values(this.players)) {
        if (player) player.volume = clampedVolume;
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
