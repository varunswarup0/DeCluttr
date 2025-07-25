import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { getAsyncStorage } from './asyncStorageWrapper';

export class AudioService {
  private static instance: AudioService;
  private deletePlayer: AudioPlayer | null = null;
  private keepPlayer: AudioPlayer | null = null;
  private tapPlayer: AudioPlayer | null = null;
  private voicePlayers: AudioPlayer[] = [];
  private queue: (() => Promise<void>)[] = [];
  private playing = false;
  private isInitialized = false;
  private initializing: Promise<void> | null = null;
  private settingsCache: { enabled: boolean; volume: number } | null = null;

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
        // Create audio players for each sound
        this.deletePlayer = createAudioPlayer(require('../assets/sounds/delete.mp3'));
        this.keepPlayer = createAudioPlayer(require('../assets/sounds/keep.mp3'));
        try {
          this.tapPlayer = createAudioPlayer(require('../assets/sounds/tap.mp3'));
        } catch {
          // tap sound not found
        }
        // Load optional voice clips if present
        const players: AudioPlayer[] = [];
        try {
          players.push(createAudioPlayer(require('../assets/sounds/voice1.mp3')));
        } catch {
          // voice1 not found
        }
        try {
          players.push(createAudioPlayer(require('../assets/sounds/voice2.mp3')));
        } catch {
          // voice2 not found
        }
        this.voicePlayers = players;

        // Set initial volume
        const audioSettings = await this.getAudioSettings();
        this.deletePlayer.volume = audioSettings.volume;
        this.keepPlayer.volume = audioSettings.volume;
        if (this.tapPlayer) {
          this.tapPlayer.volume = audioSettings.volume;
        }
        this.voicePlayers.forEach((p) => (p.volume = audioSettings.volume));

        this.isInitialized = true;
        console.log('Audio service initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize audio service:', error);
        // Create mock players that fail silently if files don't exist
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

    this.deletePlayer = mockPlayer;
    this.keepPlayer = mockPlayer;
    this.tapPlayer = mockPlayer;
    this.voicePlayers = [mockPlayer, mockPlayer];
    this.isInitialized = true;
    console.log('Audio service initialized with mock players (sound files not found)');
  }

  /**
   * Get audio settings from AsyncStorage
   */
  private async getAudioSettings(): Promise<{ enabled: boolean; volume: number }> {
    if (this.settingsCache) {
      return this.settingsCache;
    }
    try {
      const storage = getAsyncStorage();
      const stored = await storage.getItem('decluttr_audio_settings');
      if (stored) {
        try {
          const settings = JSON.parse(stored);
          this.settingsCache = {
            enabled: settings.enabled ?? true,
            volume: settings.volume ?? 0.8,
          };
          return this.settingsCache;
        } catch {
          // ignore parse error
        }
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
    this.settingsCache = { enabled: true, volume: 0.8 };
    return this.settingsCache;
  }

  private enqueue(job: () => Promise<void>): void {
    // Prevent unbounded growth if sounds are triggered rapidly
    if (this.queue.length > 10) {
      return;
    }
    this.queue.push(job);
    if (!this.playing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    const next = this.queue.shift();
    if (!next) {
      this.playing = false;
      return;
    }
    this.playing = true;
    try {
      await next();
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
    // Delay before playing the next queued sound
    // Lower value means snappier audio but may overlap if too small
    setTimeout(() => this.processQueue(), 25);
  }

  /**
   * Play delete sound effect
   */
  public async playDeleteSound(): Promise<void> {
    this.enqueue(async () => {
      try {
        if (!this.isInitialized) {
          await this.initialize();
        }

        const audioSettings = await this.getAudioSettings();
        if (!audioSettings.enabled || !this.deletePlayer) {
          return;
        }

        this.deletePlayer.seekTo(0);
        this.deletePlayer.play();
      } catch (error) {
        console.warn('Failed to play delete sound:', error);
      }
    });
  }

  /**
   * Play keep sound effect
   */
  public async playKeepSound(): Promise<void> {
    this.enqueue(async () => {
      try {
        if (!this.isInitialized) {
          await this.initialize();
        }

        const audioSettings = await this.getAudioSettings();
        if (!audioSettings.enabled || !this.keepPlayer) {
          return;
        }

        this.keepPlayer.seekTo(0);
        this.keepPlayer.play();
      } catch (error) {
        console.warn('Failed to play keep sound:', error);
      }
    });
  }

  /**
   * Play tap sound effect
   */
  public async playTapSound(): Promise<void> {
    this.enqueue(async () => {
      try {
        if (!this.isInitialized) {
          await this.initialize();
        }

        const audioSettings = await this.getAudioSettings();
        if (!audioSettings.enabled || !this.tapPlayer) {
          return;
        }

        this.tapPlayer.seekTo(0);
        this.tapPlayer.play();
      } catch (error) {
        console.warn('Failed to play tap sound:', error);
      }
    });
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

      if (this.tapPlayer) {
        this.tapPlayer.remove();
        this.tapPlayer = null;
      }

      this.voicePlayers.forEach((p) => p.remove && p.remove());
      this.voicePlayers = [];
      this.queue = [];
      this.playing = false;

      this.isInitialized = false;
      this.settingsCache = null;
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
      if (this.tapPlayer) {
        this.tapPlayer.volume = clampedVolume;
      }
      this.voicePlayers.forEach((p) => (p.volume = clampedVolume));

      // Save volume setting to AsyncStorage
      const storage = getAsyncStorage();
      this.settingsCache = await this.getAudioSettings();
      this.settingsCache.volume = clampedVolume;
      await storage.setItem('decluttr_audio_settings', JSON.stringify(this.settingsCache));
    } catch (error) {
      console.warn('Failed to set volume:', error);
    }
  }

  /**
   * Enable or disable audio playback
   */
  public async setEnabled(enabled: boolean): Promise<void> {
    try {
      const storage = getAsyncStorage();
      this.settingsCache = await this.getAudioSettings();
      this.settingsCache.enabled = enabled;
      await storage.setItem('decluttr_audio_settings', JSON.stringify(this.settingsCache));
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

  public playRandomVoice(): void {
    this.enqueue(async () => {
      try {
        if (!this.isInitialized) {
          await this.initialize();
        }
        const audioSettings = await this.getAudioSettings();
        if (!audioSettings.enabled || this.voicePlayers.length === 0) {
          return;
        }
        const player = this.voicePlayers[Math.floor(Math.random() * this.voicePlayers.length)];
        player.seekTo(0);
        player.play();
      } catch (error) {
        console.warn('Failed to play voice clip:', error);
      }
    });
  }
}

// Export singleton instance
export const audioService = AudioService.getInstance();
