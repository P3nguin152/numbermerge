import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type SoundType = 'drop' | 'merge' | 'gameOver' | 'pause' | 'resume' | 'click';

class SoundManager {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private backgroundMusic: Audio.Sound | null = null;
  private isSoundEnabled: boolean = true;
  private isMusicEnabled: boolean = true;
  private isVibrationEnabled: boolean = true;
  private isInitialized: boolean = false;
  private soundsLoaded: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  async loadSound(type: SoundType, fileName: string) {
    if (!this.isInitialized) await this.initialize();

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileName },
        { shouldPlay: false }
      );
      this.sounds.set(type, sound);
    } catch (error) {
      console.warn(`Failed to load sound ${type}:`, error);
    }
  }

  async loadSounds() {
    if (this.soundsLoaded) return;

    // Load sound effects - these files need to be added to assets/sounds/
    // For now, we'll try to load them but handle errors gracefully
    try {
      await this.loadSound('drop', require('../../assets/sounds/drop.mp3'));
      await this.loadSound('merge', require('../../assets/sounds/merge.mp3'));
      await this.loadSound('gameOver', require('../../assets/sounds/gameover.mp3'));
      await this.loadSound('pause', require('../../assets/sounds/pause.mp3'));
      await this.loadSound('resume', require('../../assets/sounds/resume.mp3'));
      await this.loadSound('click', require('../../assets/sounds/click.mp3'));
      this.soundsLoaded = true;
    } catch (error) {
      console.warn('Sound files not found - audio will be disabled until files are added:', error);
      this.soundsLoaded = false;
    }
  }

  async loadBackgroundMusic(fileName: string) {
    if (!this.isInitialized) await this.initialize();

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileName },
        { shouldPlay: false, isLooping: true }
      );
      this.backgroundMusic = sound;
    } catch (error) {
      console.warn('Failed to load background music:', error);
    }
  }

  async playSound(type: SoundType) {
    if (!this.isSoundEnabled) return;

    // Trigger vibration if enabled
    if (this.isVibrationEnabled) {
      this.triggerVibration(type);
    }

    const sound = this.sounds.get(type);
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.warn(`Failed to play sound ${type}:`, error);
      }
    }
  }

  private async triggerVibration(type: SoundType) {
    if (Platform.OS === 'web') return;

    try {
      switch (type) {
        case 'drop':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'merge':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'gameOver':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'pause':
        case 'resume':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'click':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
      }
    } catch (error) {
      console.warn('Failed to trigger vibration:', error);
    }
  }

  async playBackgroundMusic() {
    if (!this.isMusicEnabled || !this.backgroundMusic) return;

    try {
      await this.backgroundMusic.playAsync();
    } catch (error) {
      console.warn('Failed to play background music:', error);
    }
  }

  async pauseBackgroundMusic() {
    if (!this.backgroundMusic) return;

    try {
      await this.backgroundMusic.pauseAsync();
    } catch (error) {
      console.warn('Failed to pause background music:', error);
    }
  }

  async stopBackgroundMusic() {
    if (!this.backgroundMusic) return;

    try {
      await this.backgroundMusic.stopAsync();
    } catch (error) {
      console.warn('Failed to stop background music:', error);
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  setVibrationEnabled(enabled: boolean) {
    this.isVibrationEnabled = enabled;
  }

  getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  getVibrationEnabled(): boolean {
    return this.isVibrationEnabled;
  }

  async cleanup() {
    // Stop background music
    await this.stopBackgroundMusic();

    // Unload all sounds
    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn('Failed to unload sound:', error);
      }
    }
    this.sounds.clear();

    // Unload background music
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.unloadAsync();
      } catch (error) {
        console.warn('Failed to unload background music:', error);
      }
      this.backgroundMusic = null;
    }
  }
}

// Singleton instance
export const soundManager = new SoundManager();
