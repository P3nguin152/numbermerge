import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loadSettings, updateSetting, GameSettings } from '../utils/settingsStorage';
import { soundManager } from '../utils/soundManager';
import { clearGameState } from '../utils/gameStorage';
import { clearStats } from '../utils/statsStorage';
import { Colors, Radius, Spacing } from '../theme/colors';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true,
    theme: 'dark',
  });

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const handleSoundToggle = async (value: boolean) => {
    await updateSetting('soundEnabled', value);
    setSettings(prev => ({ ...prev, soundEnabled: value }));
    soundManager.setSoundEnabled(value);
  };

  const handleMusicToggle = async (value: boolean) => {
    await updateSetting('musicEnabled', value);
    setSettings(prev => ({ ...prev, musicEnabled: value }));
    soundManager.setMusicEnabled(value);
  };

  const handleHapticToggle = async (value: boolean) => {
    await updateSetting('vibrationEnabled', value);
    setSettings(prev => ({ ...prev, vibrationEnabled: value }));
    soundManager.setVibrationEnabled(value);
  };

  const handleThemeToggle = async (theme: 'dark' | 'light') => {
    await updateSetting('theme', theme);
    setSettings(prev => ({ ...prev, theme }));
    // Note: In a real app, you'd need to reload the app or use a theme provider
    // For now, we'll just save the preference
    Alert.alert(
      'Theme Changed',
      `Theme changed to ${theme} mode. Restart the app to see the full effect.`,
      [{ text: 'OK' }]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your game progress, stats, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearGameState();
              await clearStats();
              Alert.alert('Success', 'All data has been reset.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset data. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 42 }} />
        </View>

        {/* Sound Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SOUND & AUDIO</Text>

          <View style={styles.card}>
            <View style={[styles.cardItem, styles.cardItemBorder]}>
              <View style={[styles.iconBox, { backgroundColor: Colors.accentDim }]}>
                <Text style={styles.iconEmoji}>🔊</Text>
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Sound Effects</Text>
                <Text style={styles.cardItemSubtitle}>Tile drops, merges, etc.</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor="#FFF"
              />
            </View>

            <View style={[styles.cardItem, styles.cardItemBorder]}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primaryDim }]}>
                <Text style={styles.iconEmoji}>🎵</Text>
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Background Music</Text>
                <Text style={styles.cardItemSubtitle}>Play music during game</Text>
              </View>
              <Switch
                value={settings.musicEnabled}
                onValueChange={handleMusicToggle}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.cardItem}>
              <View style={[styles.iconBox, { backgroundColor: Colors.warningDim }]}>
                <Text style={styles.iconEmoji}>📳</Text>
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Haptic Feedback</Text>
                <Text style={styles.cardItemSubtitle}>Vibration on actions</Text>
              </View>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={handleHapticToggle}
                trackColor={{ false: Colors.card, true: Colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APPEARANCE</Text>
          
          <View style={styles.card}>
            <TouchableOpacity 
              style={[styles.cardItem, styles.cardItemBorder]} 
              activeOpacity={0.7}
              onPress={() => handleThemeToggle('dark')}
            >
              <View style={styles.themePreview}>
                <View style={styles.themePreviewInner} />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Dark Mode</Text>
                <Text style={styles.cardItemSubtitle}>{settings.theme === 'dark' ? 'Currently active' : 'Switch to dark'}</Text>
              </View>
              {settings.theme === 'dark' && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.cardItem]} 
              activeOpacity={0.7}
              onPress={() => handleThemeToggle('light')}
            >
              <View style={[styles.themePreview, styles.themePreviewLight]}>
                <View style={[styles.themePreviewInner, styles.themePreviewInnerLight]} />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Light Mode</Text>
                <Text style={styles.cardItemSubtitle}>{settings.theme === 'light' ? 'Currently active' : 'Switch to light'}</Text>
              </View>
              {settings.theme === 'light' && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA</Text>
          
          <View style={styles.card}>
            <TouchableOpacity 
              style={[styles.cardItem, styles.dangerItem]} 
              activeOpacity={0.7}
              onPress={handleResetData}
            >
              <View style={[styles.iconBox, { backgroundColor: Colors.dangerDim }]}>
                <Text style={styles.iconEmoji}>🗑️</Text>
              </View>
              <View style={styles.cardItemContent}>
                <Text style={[styles.cardItemTitle, styles.dangerText]}>Reset All Data</Text>
                <Text style={styles.cardItemSubtitle}>Clear progress, stats & settings</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          
          <View style={styles.card}>
            <View style={[styles.cardItem, styles.cardItemBorder]}>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemSubtitle}>Version</Text>
              </View>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
            <TouchableOpacity style={styles.cardItem} activeOpacity={0.7}>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Rate the App</Text>
                <Text style={styles.cardItemSubtitle}>Share your feedback</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxxl,
  },
  backBtn: {
    width: 42,
    height: 42,
    backgroundColor: Colors.card,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '600',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    gap: 14,
  },
  cardItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  cardItemDisabled: {
    opacity: 0.4,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  cardItemContent: {
    flex: 1,
  },
  cardItemTitle: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  cardItemSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  checkBadge: {
    width: 28,
    height: 28,
    backgroundColor: Colors.successDim,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  chevron: {
    color: Colors.textMuted,
    fontSize: 24,
    fontWeight: '300',
  },
  themePreview: {
    width: 42,
    height: 42,
    backgroundColor: Colors.bg,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  themePreviewLight: {
    backgroundColor: '#F5F5F5',
    borderColor: '#DDD',
  },
  themePreviewInner: {
    width: 28,
    height: 28,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xs,
  },
  themePreviewInnerLight: {
    backgroundColor: '#E0E0E0',
  },
  dangerItem: {
    borderColor: Colors.dangerDim,
  },
  dangerText: {
    color: Colors.danger,
  },
});
