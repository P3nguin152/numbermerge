import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { loadStats } from '../utils/statsStorage';
import { useUser } from '../contexts/UserContext';
import { getAvatarOptions } from '../utils/avatarStorage';
import { getBannerOptions, getBannerById } from '../utils/bannerStorage';
import { getStreakCount } from '../utils/notificationStorage';
import { Colors, Radius, Spacing } from '../theme/colors';

type AchievementFilter = 'all' | 'unlocked' | 'locked';

interface Achievement {
  id: number;
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
  progress?: { current: number; target: number; format?: (n: number) => string };
}

function formatPlayTime(ms: number): string {
  if (!ms || ms < 1000) return '0m';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { username, avatar, setAvatar, banner, setBanner } = useUser();
  const [stats, setStats] = useState({
    highScore: 0,
    gamesPlayed: 0,
    totalMerges: 0,
    bestTile: 2,
    fastestMergeTime: Infinity,
    maxChainReaction: 0,
    totalPlayTime: 0,
  });
  const [streak, setStreak] = useState(0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [filter, setFilter] = useState<AchievementFilter>('all');

  useFocusEffect(
    React.useCallback(() => {
      loadStats().then(loadedStats => {
        setStats({
          highScore: loadedStats.highScore,
          gamesPlayed: loadedStats.gamesPlayed,
          totalMerges: loadedStats.totalMerges,
          bestTile: loadedStats.bestTile,
          fastestMergeTime: loadedStats.fastestMergeTime ?? Infinity,
          maxChainReaction: loadedStats.maxChainReaction ?? 0,
          totalPlayTime: loadedStats.totalPlayTime ?? 0,
        });
      });
      getStreakCount().then(setStreak);
    }, [])
  );

  const currentBanner = useMemo(() => getBannerById(banner), [banner]);

  const achievements: Achievement[] = useMemo(() => [
    {
      id: 1, icon: '🎯', title: 'First Merge', desc: 'Complete your first merge',
      unlocked: stats.totalMerges >= 1,
    },
    {
      id: 2, icon: '⚡', title: 'Speed Demon', desc: 'Merge within 5 seconds',
      unlocked: stats.fastestMergeTime <= 5000,
      progress: stats.fastestMergeTime === Infinity
        ? { current: 0, target: 1, format: () => 'No merges yet' }
        : {
            current: Math.min(5000, Math.max(0, 10000 - stats.fastestMergeTime)),
            target: 5000,
            format: () => `Best: ${(stats.fastestMergeTime / 1000).toFixed(1)}s`,
          },
    },
    {
      id: 3, icon: '🔥', title: 'Chain Reaction', desc: '5+ merges in one move',
      unlocked: stats.maxChainReaction >= 5,
      progress: { current: Math.min(5, stats.maxChainReaction), target: 5 },
    },
    {
      id: 4, icon: '📅', title: 'Streak Master', desc: '7-day playing streak',
      unlocked: streak >= 7,
      progress: { current: Math.min(7, streak), target: 7 },
    },
    {
      id: 5, icon: '💎', title: 'Tile Master', desc: 'Create a 2048 tile',
      unlocked: stats.bestTile >= 2048,
      progress: { current: Math.min(2048, stats.bestTile), target: 2048 },
    },
    {
      id: 6, icon: '🔥', title: 'On Fire', desc: 'Reach 5,000 points',
      unlocked: stats.highScore >= 5000,
      progress: { current: Math.min(5000, stats.highScore), target: 5000 },
    },
    {
      id: 7, icon: '⭐', title: 'Super Star', desc: 'Reach 10,000 points',
      unlocked: stats.highScore >= 10000,
      progress: { current: Math.min(10000, stats.highScore), target: 10000 },
    },
  ], [stats, streak]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const filteredAchievements = useMemo(() => {
    if (filter === 'unlocked') return achievements.filter(a => a.unlocked);
    if (filter === 'locked') return achievements.filter(a => !a.unlocked);
    return achievements;
  }, [achievements, filter]);

  const level = Math.floor(stats.gamesPlayed / 10) + 1;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Nav */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
            <Text style={styles.navBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Profile</Text>
          <View style={{ width: 42 }} />
        </View>

        {/* Hero Banner */}
        <TouchableOpacity
          style={styles.heroWrap}
          onPress={() => setShowBannerPicker(true)}
          activeOpacity={0.9}
        >
          <View style={[styles.hero, { backgroundColor: currentBanner.colors[0] }]}>
            <View style={[styles.heroLayer, { backgroundColor: currentBanner.colors[1], opacity: 0.6 }]} />
            <View style={[styles.heroLayer2, { backgroundColor: currentBanner.colors[2], opacity: 0.45 }]} />
            <View style={styles.heroOrb1} />
            <View style={styles.heroOrb2} />

            <View style={styles.bannerEditBadge}>
              <Text style={styles.bannerEditText}>🎨</Text>
            </View>

            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); setShowAvatarPicker(true); }}
              activeOpacity={0.8}
              style={styles.heroAvatar}
            >
              <Text style={styles.heroAvatarEmoji}>{avatar}</Text>
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditText}>✎</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.heroName} numberOfLines={1}>{username || 'Player'}</Text>

            <View style={styles.heroMetaRow}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Level {level}</Text>
              </View>
              {streak > 0 && (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>🔥 {streak} day{streak === 1 ? '' : 's'}</Text>
                </View>
              )}
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>🏅 {unlockedCount}/{totalCount}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Achievements */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          <Text style={styles.sectionCount}>{unlockedCount}/{totalCount}</Text>
        </View>

        <View style={styles.filterTabs}>
          {(['all', 'unlocked', 'locked'] as AchievementFilter[]).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f === 'all' ? 'All' : f === 'unlocked' ? 'Unlocked' : 'Locked'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.achievementsList}>
          {filteredAchievements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No achievements {filter === 'unlocked' ? 'unlocked' : 'locked'} yet</Text>
            </View>
          ) : filteredAchievements.map((a) => {
            const progressPct = a.progress
              ? Math.min(100, Math.round((a.progress.current / a.progress.target) * 100))
              : 0;
            return (
              <View
                key={a.id}
                style={[styles.achievementCard, !a.unlocked && styles.achievementCardLocked]}
              >
                <View style={[styles.achievementIcon, a.unlocked ? styles.achievementIconUnlocked : styles.achievementIconLocked]}>
                  <Text style={styles.achievementIconText}>{a.unlocked ? a.icon : '🔒'}</Text>
                </View>
                <View style={styles.achievementContent}>
                  <Text style={[styles.achievementTitle, !a.unlocked && styles.achievementTitleLocked]}>
                    {a.title}
                  </Text>
                  <Text style={styles.achievementDesc}>{a.desc}</Text>
                  {!a.unlocked && a.progress && (
                    <View style={styles.progressWrap}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                      </View>
                      <Text style={styles.progressText}>
                        {a.progress.format
                          ? a.progress.format(a.progress.current)
                          : `${a.progress.current.toLocaleString()} / ${a.progress.target.toLocaleString()}`}
                      </Text>
                    </View>
                  )}
                </View>
                {a.unlocked && (
                  <View style={styles.achievementCheck}>
                    <Text style={styles.achievementCheckText}>✓</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Statistics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STATISTICS</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard icon="👑" value={stats.highScore.toLocaleString()} label="High Score" />
          <StatCard icon="🎮" value={stats.gamesPlayed.toString()} label="Games Played" />
          <StatCard icon="🔗" value={stats.totalMerges.toLocaleString()} label="Total Merges" />
          <StatCard icon="💎" value={stats.bestTile.toString()} label="Best Tile" />
          <StatCard icon="⏱️" value={formatPlayTime(stats.totalPlayTime)} label="Play Time" />
          <StatCard icon="📅" value={streak.toString()} label="Day Streak" />
        </View>
      </ScrollView>

      {/* Avatar Picker */}
      {showAvatarPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Avatar</Text>
            <View style={styles.avatarGrid}>
              {getAvatarOptions().map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.avatarOption, avatar === opt && styles.avatarOptionSelected]}
                  onPress={() => { setAvatar(opt); setShowAvatarPicker(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarOptionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAvatarPicker(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Banner Picker */}
      {showBannerPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Banner</Text>
            <View style={styles.bannerGrid}>
              {getBannerOptions().map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.bannerOption,
                    banner === opt.id && styles.bannerOptionSelected,
                  ]}
                  onPress={() => { setBanner(opt.id); setShowBannerPicker(false); }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.bannerSwatch, { backgroundColor: opt.colors[0] }]}>
                    <View style={[styles.bannerSwatchLayer, { backgroundColor: opt.colors[1], opacity: 0.6 }]} />
                    <View style={[styles.bannerSwatchLayer2, { backgroundColor: opt.colors[2], opacity: 0.45 }]} />
                  </View>
                  <Text style={styles.bannerName}>{opt.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowBannerPicker(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingTop: 60, paddingBottom: 48 },

  // Top Nav
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  navBtn: {
    width: 42, height: 42,
    backgroundColor: Colors.card,
    borderRadius: 21,
    borderWidth: 1, borderColor: Colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  navBtnText: { color: Colors.textPrimary, fontSize: 22, fontWeight: '600' },
  navTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },

  // Hero
  heroWrap: { marginBottom: Spacing.xxl },
  hero: {
    borderRadius: Radius.xl,
    paddingVertical: 28,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  heroLayer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '70%',
  },
  heroLayer2: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '35%',
  },
  heroOrb1: {
    position: 'absolute',
    top: -40, right: -40,
    width: 140, height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroOrb2: {
    position: 'absolute',
    bottom: -30, left: -30,
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bannerEditBadge: {
    position: 'absolute',
    top: 12, right: 12,
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerEditText: { fontSize: 14 },

  heroAvatar: {
    width: 92, height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroAvatarEmoji: { fontSize: 44 },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2, right: -2,
    width: 28, height: 28,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarEditText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  heroName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  sectionCount: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  // Filter tabs
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterTabText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterTabTextActive: { color: '#fff', fontWeight: '700' },

  // Achievements
  achievementsList: { gap: Spacing.md, marginBottom: Spacing.xxl },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: { color: Colors.textMuted, fontSize: 13 },
  achievementCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  achievementCardLocked: { opacity: 0.75 },
  achievementIcon: {
    width: 50, height: 50,
    borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  achievementIconUnlocked: { backgroundColor: Colors.accentDim },
  achievementIconLocked: { backgroundColor: Colors.glass },
  achievementIconText: { fontSize: 24 },
  achievementContent: { flex: 1 },
  achievementTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },
  achievementTitleLocked: { color: Colors.textSecondary },
  achievementDesc: { color: Colors.textMuted, fontSize: 12, marginTop: 3 },
  achievementCheck: {
    width: 30, height: 30,
    backgroundColor: Colors.successDim,
    borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  achievementCheckText: { color: Colors.success, fontSize: 16, fontWeight: '700' },

  // Progress bar
  progressWrap: { marginTop: 8 },
  progressBar: {
    height: 5,
    backgroundColor: Colors.glass,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  progressText: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    width: '47%',
    alignItems: 'center',
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { color: Colors.textPrimary, fontSize: 20, fontWeight: '900' },
  statLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 6 },

  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 380,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },

  // Avatar picker
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    justifyContent: 'center',
  },
  avatarOption: {
    width: 60, height: 60,
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarOptionSelected: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  avatarOptionText: { fontSize: 32 },

  // Banner picker
  bannerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    justifyContent: 'center',
  },
  bannerOption: {
    width: '47%',
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  bannerOptionSelected: { borderColor: Colors.primary },
  bannerSwatch: {
    height: 60,
    width: '100%',
    overflow: 'hidden',
  },
  bannerSwatchLayer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '70%',
  },
  bannerSwatchLayer2: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '35%',
  },
  bannerName: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 8,
  },

  modalCloseButton: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  modalCloseButtonText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
});
