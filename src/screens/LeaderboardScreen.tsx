import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { leaderboardService } from '../services/leaderboardService';
import { LeaderboardEntry } from '../types/game';
import { useUser } from '../contexts/UserContext';
import { Colors, Radius, Spacing } from '../theme/colors';

export default function LeaderboardScreen() {
  const navigation = useNavigation();
  const { username } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadLeaderboard();
    }, [username])
  );

  const loadLeaderboard = async () => {
    try {
      setError(null);
      const data = await leaderboardService.getLeaderboard(100);
      setLeaderboard(data);

      if (username) {
        const rank = await leaderboardService.getPlayerRank(username);
        setPlayerRank(rank);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setError('Failed to load leaderboard. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const renderSkeletonItem = () => (
    <View style={styles.itemContainer}>
      <View style={[styles.rankBadge, styles.skeleton]} />
      <View style={styles.infoContainer}>
        <View style={[styles.skeletonUsername, styles.skeleton]} />
        <View style={[styles.skeletonStats, styles.skeleton]} />
      </View>
      <View style={[styles.skeletonScore, styles.skeleton]} />
    </View>
  );

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.username === username;
    const rank = index + 1;

    const getRankStyle = (rank: number) => {
      if (rank === 1) return { bg: Colors.goldDim, color: Colors.gold };
      if (rank === 2) return { bg: 'rgba(192,192,192,0.15)', color: '#C0C0C0' };
      if (rank === 3) return { bg: 'rgba(205,127,50,0.15)', color: '#CD7F32' };
      return { bg: Colors.glass, color: Colors.textSecondary };
    };

    const getRankIcon = (rank: number) => {
      if (rank === 1) return 'medal';
      if (rank === 2) return 'ribbon';
      if (rank === 3) return 'trophy';
      return null;
    };

    const getRankIconColor = (rank: number) => {
      if (rank === 1) return Colors.gold;
      if (rank === 2) return '#C0C0C0';
      if (rank === 3) return '#CD7F32';
      return Colors.textSecondary;
    };

    const rankStyle = getRankStyle(rank);

    return (
      <View
        style={[
          styles.itemContainer,
          isCurrentUser && styles.currentUserItem,
        ]}
        accessibilityRole="summary"
        accessibilityLabel={`${isCurrentUser ? 'Your entry.' : 'Leaderboard entry.'} Rank ${rank}. ${item.username}. Score ${item.score}. Best tile ${item.bestTile}. Games played ${item.gamesPlayed}.`}
      >
        <View style={[styles.rankBadge, { backgroundColor: rankStyle.bg }]}>
          {getRankIcon(rank) ? (
            <Ionicons name={getRankIcon(rank) as any} size={22} color={getRankIconColor(rank)} />
          ) : (
            <Text style={{ color: rankStyle.color, fontSize: 16, fontWeight: '800' }}>{rank}</Text>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.username, isCurrentUser && styles.currentUsername]}>
            {item.username}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={styles.stats}>
            Best Tile: {item.bestTile} · Games: {item.gamesPlayed}
          </Text>
        </View>
        <Text style={[styles.score, isCurrentUser && styles.currentScore]}>
          {item.score.toLocaleString()}
        </Text>
      </View>
    );
  };

  const HeaderComponent = () => (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back to home">
        <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Leaderboard</Text>
      <View style={{ width: 42 }} />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent />
        <FlatList
          data={Array(8).fill(null)}
          renderItem={renderSkeletonItem}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent />
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={56} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              loadLeaderboard();
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Retry loading leaderboard"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent />

      {username && playerRank && (
        <View style={styles.playerRankBanner}>
          <Text style={styles.playerRankLabel}>YOUR RANK</Text>
          <Text style={styles.playerRankValue}>#{playerRank}</Text>
        </View>
      )}

      {!username && (
        <View style={styles.noUserBanner}>
          <Text style={styles.noUserText}>
            Register a username to appear on the leaderboard!
          </Text>
        </View>
      )}

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, leaderboard.length === 0 && styles.emptyListContent]}
        refreshing={refreshing}
        onRefresh={onRefresh}
        accessibilityLabel="Leaderboard entries"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No scores yet</Text>
            <Text style={styles.emptyStateText}>Be the first to finish a run and claim the top spot.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
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
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  playerRankBanner: {
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.sm,
    borderRadius: Radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerRankLabel: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  playerRankValue: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  noUserBanner: {
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.sm,
    borderRadius: Radius.sm,
  },
  noUserText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.xxxl,
  },
  emptyStateTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 21,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 14,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  currentUserItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoContainer: {
    flex: 1,
  },
  username: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  currentUsername: {
    color: Colors.primaryLight,
  },
  stats: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  score: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  currentScore: {
    color: Colors.primaryLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  skeleton: {
    backgroundColor: Colors.glass,
  },
  skeletonUsername: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonStats: {
    height: 10,
    width: '40%',
    borderRadius: 4,
  },
  skeletonScore: {
    width: 70,
    height: 20,
    borderRadius: 4,
  },
});
