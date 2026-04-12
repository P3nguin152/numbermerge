import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { loadStats } from '../utils/statsStorage';
import UsernameModal from '../components/UsernameModal';
import { useUser } from '../contexts/UserContext';
import { Colors, Radius, Spacing } from '../theme/colors';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { username, avatar, isLoading: userLoading } = useUser();
  const [stats, setStats] = useState({
    highScore: 0,
    gamesPlayed: 0,
  });
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadStats().then(loadedStats => {
        setStats({
          highScore: loadedStats.highScore,
          gamesPlayed: loadedStats.gamesPlayed,
        });
      });
    }, [])
  );

  useEffect(() => {
    if (!userLoading && !username) {
      setShowUsernameModal(true);
    }
  }, [username, userLoading]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>
              {username ? `Hey, ${username}` : 'Welcome back'}
            </Text>
            <Text style={styles.subHeaderText}>Ready to crush some numbers?</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
            activeOpacity={0.7}
          >
            <View style={styles.profileRing}>
              <Text style={styles.profileIcon}>{avatar}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoOuter}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>N</Text>
            </View>
          </View>
          <Text style={styles.appTitle}>NumberMerger</Text>
          <Text style={styles.appSubtitle}>Merge · Combo · Dominate</Text>
        </View>

        {/* Play Button */}
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => navigation.navigate('Game' as never)}
          activeOpacity={0.85}
        >
          <View style={styles.playButtonInner}>
            <Text style={styles.playIcon}>▶</Text>
            <Text style={styles.playButtonText}>PLAY NOW</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Preview */}
        <View style={styles.statsCard}>
          <Text style={styles.statsHeader}>YOUR STATS</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>👑</Text>
              <Text style={styles.statValueAccent}>{stats.highScore.toLocaleString()}</Text>
              <Text style={styles.statLabel}>High Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🎮</Text>
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
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.primaryDim }]}>
              <Text style={styles.menuIcon}>📖</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>How to Play</Text>
              <Text style={styles.menuSubtitle}>Learn the basics</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings' as never)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.accentDim }]}>
              <Text style={styles.menuIcon}>⚙️</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Settings</Text>
              <Text style={styles.menuSubtitle}>Customize your experience</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Leaderboard' as never)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.goldDim }]}>
              <Text style={styles.menuIcon}>🏆</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Leaderboard</Text>
              <Text style={styles.menuSubtitle}>View global rankings</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('GameModeSelection' as never)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.primaryDim }]}>
              <Text style={styles.menuIcon}>🎮</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Game Modes</Text>
              <Text style={styles.menuSubtitle}>Time Attack, Limited Moves</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Challenge Banner */}
        <TouchableOpacity 
          style={styles.dailyBanner} 
          activeOpacity={0.85}
          onPress={() => navigation.navigate('DailyChallenge' as never)}
        >
          <View style={styles.dailyGlow} />
          <View style={styles.dailyIconBox}>
            <Text style={styles.dailyIcon}>📅</Text>
          </View>
          <View style={styles.dailyContent}>
            <Text style={styles.dailyTitle}>Daily Challenge</Text>
            <Text style={styles.dailySubtitle}>New puzzle available</Text>
          </View>
          <View style={styles.dailyArrowBox}>
            <Text style={styles.dailyArrow}>▶</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <UsernameModal
        visible={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
      />
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

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subHeaderText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 6,
  },
  profileButton: {
    marginLeft: Spacing.md,
  },
  profileRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  profileIcon: {
    fontSize: 22,
  },

  // ── Logo ──
  logoSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  logoOuter: {
    width: 120,
    height: 120,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
  },
  appTitle: {
    color: Colors.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 8,
  },
  appSubtitle: {
    color: Colors.textMuted,
    fontSize: 15,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Play Button ──
  playButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  playButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playIcon: {
    color: '#fff',
    fontSize: 22,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },

  // ── Stats ──
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  statsHeader: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  statValueAccent: {
    color: Colors.primary,
    fontSize: 26,
    fontWeight: '900',
  },
  statValuePrimary: {
    color: Colors.accent,
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: Colors.divider,
  },

  // ── Menu ──
  menuOptions: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  menuItem: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  menuSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  menuChevron: {
    color: Colors.textMuted,
    fontSize: 24,
    fontWeight: '300',
  },

  // ── Daily Banner ──
  dailyBanner: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  dailyGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dailyIconBox: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyIcon: {
    fontSize: 24,
  },
  dailyContent: {
    flex: 1,
  },
  dailyTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  dailySubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 3,
  },
  dailyArrowBox: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyArrow: {
    color: '#fff',
    fontSize: 16,
  },
});
