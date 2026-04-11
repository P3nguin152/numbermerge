import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loadStats } from '../utils/statsStorage';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    highScore: 0,
    gamesPlayed: 0,
  });

  useEffect(() => {
    loadStats().then(loadedStats => {
      setStats({
        highScore: loadedStats.highScore,
        gamesPlayed: loadedStats.gamesPlayed,
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.subHeaderText}>Ready to challenge your mind?</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🔢</Text>
          </View>
          <Text style={styles.appTitle}>Number Merge</Text>
          <Text style={styles.appSubtitle}>Merge tiles • Build combos • Beat scores</Text>
        </View>

        {/* Play Button */}
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => navigation.navigate('Game' as never)}
        >
          <View style={styles.playButtonContent}>
            <Text style={styles.playIcon}>▶</Text>
            <Text style={styles.playButtonText}>PLAY NOW</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Preview */}
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Your Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValueAccent}>{stats.highScore.toLocaleString()}</Text>
              <Text style={styles.statLabel}>High Score</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValuePrimary}>{stats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuOptions}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('HowToPlay' as never)}
          >
            <View style={styles.menuIconContainerAccent}>
              <Text style={styles.menuIcon}>📖</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>How to Play</Text>
              <Text style={styles.menuSubtitle}>Learn the basics</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <View style={styles.menuIconContainerPrimary}>
              <Text style={styles.menuIcon}>⚙️</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Settings</Text>
              <Text style={styles.menuSubtitle}>Customize your experience</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Challenge Banner */}
        <TouchableOpacity style={styles.dailyChallengeBanner}>
          <View style={styles.dailyIconContainer}>
            <Text style={styles.dailyIcon}>📅</Text>
          </View>
          <View style={styles.dailyContent}>
            <Text style={styles.dailyTitle}>Daily Challenge</Text>
            <Text style={styles.dailySubtitle}>New puzzle available • 2h left</Text>
          </View>
          <View style={styles.dailyArrowContainer}>
            <Text style={styles.dailyArrow}>▶</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeaderText: {
    color: '#718096',
    fontSize: 14,
    marginTop: 8,
  },
  profileButton: {
    width: 48,
    height: 48,
    backgroundColor: '#2D3748',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 48,
  },
  logoContainer: {
    width: 128,
    height: 128,
    backgroundColor: '#E8624A',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#E8624A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 60,
  },
  appTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 12,
  },
  appSubtitle: {
    color: '#718096',
    fontSize: 16,
  },
  playButton: {
    backgroundColor: '#E8624A',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#E8624A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  playButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playIcon: {
    color: '#fff',
    fontSize: 28,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  statsCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValueAccent: {
    color: '#3A6EEA',
    fontSize: 24,
    fontWeight: '900',
  },
  statValuePrimary: {
    color: '#E8624A',
    fontSize: 24,
    fontWeight: '900',
  },
  statValueGreen: {
    color: '#32CD32',
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#718096',
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#4A5568',
  },
  menuOptions: {
    gap: 12,
    marginBottom: 24,
  },
  menuItem: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconContainerAccent: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(58, 110, 234, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconContainerPrimary: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(232, 98, 74, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  menuSubtitle: {
    color: '#718096',
    fontSize: 12,
    marginTop: 4,
  },
  menuArrow: {
    color: '#718096',
    fontSize: 20,
  },
  dailyChallengeBanner: {
    backgroundColor: '#3A6EEA',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    shadowColor: '#3A6EEA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  dailyIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyIcon: {
    fontSize: 28,
  },
  dailyContent: {
    flex: 1,
  },
  dailyTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dailySubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  dailyArrowContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyArrow: {
    color: '#fff',
    fontSize: 20,
  },
});
