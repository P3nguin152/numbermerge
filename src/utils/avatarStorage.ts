import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_KEY = '@user_avatar';

const AVATAR_OPTIONS = ['🎮', '🦊', '🐱', '🐶', '🦄', '🐼', '🦁', '🐸', '🦋', '🐙'];

export async function getAvatar(): Promise<string> {
  try {
    const avatar = await AsyncStorage.getItem(AVATAR_KEY);
    return avatar || '🎮'; // Default avatar
  } catch (error) {
    console.warn('Failed to load avatar:', error);
    return '🎮';
  }
}

export async function setAvatar(avatar: string): Promise<void> {
  try {
    await AsyncStorage.setItem(AVATAR_KEY, avatar);
  } catch (error) {
    console.warn('Failed to save avatar:', error);
  }
}

export function getAvatarOptions(): string[] {
  return AVATAR_OPTIONS;
}
