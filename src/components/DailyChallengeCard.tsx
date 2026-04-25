import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DailyChallenge, UserChallengeStatus } from '../types/dailyChallenge';
import { dailyChallengeService } from '../services/dailyChallengeService';
import { useUser } from '../contexts/UserContext';
import { Colors, Radius, Spacing } from '../theme/colors';

export default function DailyChallengeCard() {
  const navigation = useNavigation();
  const { username } = useUser();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [status, setStatus] = useState<UserChallengeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallengeData();
  }, [username]);

  useFocusEffect(
    useCallback(() => {
      // Only refresh data on focus, don't show loading spinner
      refreshChallengeData();
    }, [username])
  );

  const loadChallengeData = async () => {
    try {
      setLoading(true);
      const [todayChallenge, userStatus] = await Promise.all([
        dailyChallengeService.getTodayChallenge(),
        username ? dailyChallengeService.getUserChallengeStatus(username) : Promise.resolve(null),
      ]);
      setChallenge(todayChallenge);
      setStatus(userStatus);
    } catch (error) {
      console.error('Error loading challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshChallengeData = async () => {
    try {
      const [todayChallenge, userStatus] = await Promise.all([
        dailyChallengeService.getTodayChallenge(),
        username ? dailyChallengeService.getUserChallengeStatus(username) : Promise.resolve(null),
      ]);
      setChallenge(todayChallenge);
      setStatus(userStatus);
    } catch (error) {
      console.error('Error refreshing challenge data:', error);
    }
  };

  const handlePress = () => {
    if (challenge) {
      (navigation.navigate as any)('DailyChallenge', { challenge });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator color={Colors.primary} size="small" />
        </View>
      </View>
    );
  }

  if (!challenge) {
    return null;
  }

  const challengeTitle = challenge.type === 'target_score' ? 'Target Score' :
                      challenge.type === 'tile_mastery' ? 'Tile Mastery' :
                      challenge.type === 'combo' ? 'Combo Challenge' :
                      challenge.type === 'clear_board' ? 'Clear the Board' :
                      'Speed Run';
  const challengeSubtitle = challenge.type === 'target_score'
    ? `Reach ${challenge.targetValue.toLocaleString()} points`
    : challenge.type === 'tile_mastery'
    ? `Create a ${challenge.targetValue} tile`
    : challenge.type === 'combo'
    ? `Get ${challenge.comboTarget || 3} consecutive merges`
    : challenge.type === 'clear_board'
    ? 'Clear all tiles from the grid'
    : `Reach ${challenge.targetValue.toLocaleString()} points in ${challenge.timeLimit}s`;
  const challengeEmoji = challenge.type === 'target_score' ? '🎯' :
                        challenge.type === 'tile_mastery' ? '🧩' :
                        challenge.type === 'combo' ? '🔥' :
                        challenge.type === 'clear_board' ? '🧹' :
                        '⏱️';
  const modeLabel = challengeTitle;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Daily Challenge: ${challengeTitle}. ${challengeSubtitle}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{challengeEmoji}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Daily Challenge</Text>
            <Text style={styles.subtitle}>{challengeSubtitle}</Text>
          </View>
          {status?.completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Mode</Text>
            <Text style={styles.footerValue}>{modeLabel}</Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Attempts</Text>
            <Text style={styles.footerValue}>{status?.attemptsRemaining ?? 5}/5</Text>
          </View>
          {status && status.streak > 0 && (
            <>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>Streak</Text>
                <Text style={[styles.footerValue, styles.streakValue]}>🔥 {status.streak}</Text>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.gold,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  completedBadge: {
    width: 32,
    height: 32,
    backgroundColor: Colors.success,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
  },
  footerLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  footerValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  streakValue: {
    color: Colors.gold,
  },
  footerDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.sm,
  },
});
