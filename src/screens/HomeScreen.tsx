import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { loadStats } from '../utils/statsStorage';
import UsernameModal from '../components/UsernameModal';
import DailyChallengeCard from '../components/DailyChallengeCard';
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>NumberMerge</Text>
            <Text style={styles.welcomeText}>
              {username ? `Hey, ${username} 👋` : 'Welcome back 👋'}
            </Text>
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

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statPillEmoji}>👑</Text>
            <View>
              <Text style={styles.statPillValue}>{stats.highScore.toLocaleString()}</Text>
              <Text style={styles.statPillLabel}>Best Score</Text>
            </View>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillEmoji}>🎮</Text>
            <View>
              <Text style={[styles.statPillValue, { color: Colors.accent }]}>{stats.gamesPlayed}</Text>
              <Text style={styles.statPillLabel}>Games Played</Text>
            </View>
          </View>
        </View>

        {/* Leaderboard Banner */}
        <TouchableOpacity
          style={styles.leaderboardBanner}
          onPress={() => navigation.navigate('Leaderboard' as never)}
          activeOpacity={0.85}
        >
          <View style={styles.leaderboardLeft}>
            <Text style={styles.leaderboardEmoji}>🏆</Text>
            <View>
              <Text style={styles.leaderboardTitle}>Leaderboard</Text>
              <Text style={styles.leaderboardSub}>See how you rank globally</Text>
            </View>
          </View>
          <Text style={styles.leaderboardChevron}>›</Text>
        </TouchableOpacity>

        {/* Game Modes */}
        <Text style={styles.sectionTitle}>CHOOSE YOUR MODE</Text>

        <TouchableOpacity
          style={styles.gameModeCardFeatured}
          onPress={() => navigation.navigate('Game' as never)}
          activeOpacity={0.85}
        >
          <View style={[styles.gameModeAccent, { backgroundColor: Colors.primary }]} />
          <View style={styles.gameModeIconBox}>
            <Text style={styles.gameModeIcon}>🎯</Text>
          </View>
          <View style={styles.gameModeContent}>
            <View style={styles.gameModeTitleRow}>
              <Text style={styles.gameModeTitle}>Classic</Text>
              <View style={styles.gameModeBadge}><Text style={styles.gameModeBadgeText}>POPULAR</Text></View>
            </View>
            <Text style={styles.gameModeSubtitle}>Endless gameplay · No limits · High score chase</Text>
          </View>
          <Text style={styles.gameModeChevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.gameModeRow}>
          <TouchableOpacity
            style={styles.gameModeCardHalf}
            onPress={() => navigation.navigate('LimitedMoves' as never)}
            activeOpacity={0.85}
          >
            <View style={[styles.gameModeAccentHalf, { backgroundColor: Colors.accent }]} />
            <Text style={styles.gameModeIconLarge}>⚡</Text>
            <Text style={styles.gameModeTitleHalf}>Limited{'\n'}Moves</Text>
            <Text style={styles.gameModeSubtitleHalf}>25 moves to score big</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameModeCardHalf}
            onPress={() => navigation.navigate('TimeAttack' as never)}
            activeOpacity={0.85}
          >
            <View style={[styles.gameModeAccentHalf, { backgroundColor: Colors.gold }]} />
            <Text style={styles.gameModeIconLarge}>⏱️</Text>
            <Text style={styles.gameModeTitleHalf}>Time{'\n'}Attack</Text>
            <Text style={styles.gameModeSubtitleHalf}>Race against 2 minutes</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Challenge */}
        <Text style={styles.sectionTitle}>DAILY CHALLENGE</Text>
        <DailyChallengeCard />

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>MORE</Text>
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => navigation.navigate('HowToPlay' as never)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: Colors.primaryDim }]}>
              <Text style={styles.quickLinkEmoji}>📖</Text>
            </View>
            <Text style={styles.quickLinkLabel}>How to Play</Text>
            <Text style={styles.quickLinkChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.quickLinkDivider} />

          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => navigation.navigate('Settings' as never)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: Colors.accentDim }]}>
              <Text style={styles.quickLinkEmoji}>⚙️</Text>
            </View>
            <Text style={styles.quickLinkLabel}>Settings</Text>
            <Text style={styles.quickLinkChevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 48 }} />
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
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: 64,
    paddingBottom: 48,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  headerLeft: {
    flex: 1,
  },
  appName: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  welcomeText: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileButton: {
    marginLeft: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  profileIcon: {
    fontSize: 28,
  },

  // ── Stats Row ──
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  statPillEmoji: {
    fontSize: 22,
  },
  statPillValue: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statPillLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },

  // ── Leaderboard Banner ──
  leaderboardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
    marginBottom: Spacing.xxl,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  leaderboardEmoji: {
    fontSize: 28,
  },
  leaderboardTitle: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  leaderboardSub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  leaderboardChevron: {
    color: Colors.gold,
    fontSize: 26,
    fontWeight: '300',
  },

  // ── Section Title ──
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },

  // ── Featured Game Mode Card ──
  gameModeCardFeatured: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.md,
    paddingRight: Spacing.lg,
    paddingVertical: 18,
  },
  gameModeAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: Spacing.lg,
    marginLeft: 0,
  },
  gameModeIconBox: {
    width: 50,
    height: 50,
    backgroundColor: Colors.primaryDim,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  gameModeIcon: {
    fontSize: 24,
  },
  gameModeContent: {
    flex: 1,
  },
  gameModeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  gameModeTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gameModeBadge: {
    backgroundColor: Colors.primaryDim,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gameModeBadgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  gameModeSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  gameModeChevron: {
    color: Colors.textMuted,
    fontSize: 26,
    fontWeight: '300',
    marginLeft: Spacing.sm,
  },

  // ── Half-width Game Mode Cards ──
  gameModeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  gameModeCardHalf: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: 0,
  },
  gameModeAccentHalf: {
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.lg,
  },
  gameModeIconLarge: {
    fontSize: 30,
    marginBottom: 8,
  },
  gameModeTitleHalf: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 20,
    marginBottom: 6,
  },
  gameModeSubtitleHalf: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },

  // ── Quick Links ──
  quickLinks: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  quickLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    gap: 14,
  },
  quickLinkDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.lg,
  },
  quickLinkIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkEmoji: {
    fontSize: 19,
  },
  quickLinkLabel: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  quickLinkChevron: {
    color: Colors.textMuted,
    fontSize: 22,
    fontWeight: '300',
  },
});
