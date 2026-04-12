import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAvatar, setAvatar } from '../utils/avatarStorage';

interface UserContextType {
  username: string | null;
  setUsername: (username: string) => Promise<void>;
  avatar: string;
  setAvatar: (avatar: string) => Promise<void>;
  isLoading: boolean;
  isRegistered: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USERNAME_STORAGE_KEY = '@numbermerge_username';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [avatar, setAvatarState] = useState<string>('🎮');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem(USERNAME_STORAGE_KEY);
      const storedAvatar = await getAvatar();
      setUsernameState(storedUsername);
      setAvatarState(storedAvatar);
      setError(null);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data. Please restart the app.');
    } finally {
      setIsLoading(false);
    }
  };

  const setUsername = async (newUsername: string) => {
    try {
      await AsyncStorage.setItem(USERNAME_STORAGE_KEY, newUsername);
      setUsernameState(newUsername);
      setError(null);
    } catch (error) {
      console.error('Error saving username:', error);
      setError('Failed to save username. Please try again.');
      throw error;
    }
  };

  const updateUserAvatar = async (newAvatar: string) => {
    try {
      await setAvatar(newAvatar);
      setAvatarState(newAvatar);
      setError(null);
    } catch (error) {
      console.error('Error saving avatar:', error);
      setError('Failed to save avatar. Please try again.');
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        avatar,
        setAvatar: updateUserAvatar,
        isLoading,
        isRegistered: !!username,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
