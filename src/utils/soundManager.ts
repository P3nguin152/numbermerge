import { Vibration } from 'react-native';

export type SoundType = 'drop' | 'merge' | 'gameOver' | 'pause' | 'resume' | 'click';

class SoundManager {
  private isSoundEnabled: boolean = true;
  private isMusicEnabled: boolean = true;
  private isVibrationEnabled: boolean = true;

  async initialize() {
    // Audio and haptics disabled for now - expo-av and expo-haptics removed due to build issues
  }

  async loadSound(_type: SoundType, _fileName: string) {
    // Audio disabled for now
  }

  async loadSounds() {
    // Audio disabled for now
  }

  async loadBackgroundMusic(_fileName: string) {
    // Audio disabled for now
  }

  async playSound(_type: SoundType) {
    if (!this.isVibrationEnabled) {
      return;
    }

    const pattern = this.getVibrationPattern(_type);
    if (pattern) {
      Vibration.vibrate(pattern);
    }
  }

  async playBackgroundMusic() {
    // Audio disabled for now
  }

  async pauseBackgroundMusic() {
    // Audio disabled for now
  }

  async stopBackgroundMusic() {
    // Audio disabled for now
  }

  setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
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

  private getVibrationPattern(type: SoundType): number | number[] | null {
    switch (type) {
      case 'drop':
        return 10;
      case 'merge':
        return [0, 20, 30, 25];
      case 'gameOver':
        return [0, 35, 40, 35, 50, 45];
      case 'pause':
      case 'resume':
      case 'click':
        return 15;
      default:
        return null;
    }
  }

  async cleanup() {
    // Audio disabled for now
    Vibration.cancel();
  }
}

// Singleton instance
export const soundManager = new SoundManager();
