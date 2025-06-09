import { createAudioPlayer, AudioPlayer } from 'expo-audio';

class BackgroundMusicService {
  private static instance: BackgroundMusicService;
  private player: AudioPlayer | null = null;
  private isInitialized = false;
  private initializing: Promise<void> | null = null;

  static getInstance() {
    if (!BackgroundMusicService.instance) {
      BackgroundMusicService.instance = new BackgroundMusicService();
    }
    return BackgroundMusicService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;
    if (this.initializing) return this.initializing;
    this.initializing = (async () => {
      try {
        this.player = createAudioPlayer(require('../assets/music/background.mp3'));
        this.player.loop = true;
        this.player.volume = 0.4;
        this.isInitialized = true;
      } catch (err) {
        console.warn('Failed to load background music:', err);
      } finally {
        this.initializing = null;
      }
    })();
    return this.initializing;
  }

  async play() {
    try {
      if (!this.isInitialized) await this.initialize();
      this.player?.seekTo(0);
      this.player?.play();
    } catch (err) {
      console.warn('Failed to play background music:', err);
    }
  }

  async stop() {
    try {
      await this.player?.stop();
    } catch (err) {
      console.warn('Failed to stop background music:', err);
    }
  }
}

export const backgroundMusicService = BackgroundMusicService.getInstance();
