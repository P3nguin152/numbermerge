import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { loadStats } from '../utils/statsStorage';
import { useUser } from '../contexts/UserContext';
import { getAvatarOptions } from '../utils/avatarStorage';
import { Colors, Radius, Spacing } from '../theme/colors';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { username, avatar, setAvatar } = useUser();
  const [stats, setStats] = useState({
    highScore: 0,
    gamesPlayed: 0,
    totalMerges: 0,
    bestTile: 2,
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadStats().then(loadedStats => {
        setStats({
          highScore: loadedStats.highScore,
          gamesPlayed: loadedStats.gamesPlayed,
          totalMerges: loadedStats.totalMerges,
          bestTile: loadedStats.bestTile,
        });
      });
    }, [])
  );

  const achievements = [
    { id: 1, icon: '🔥', title: 'On Fire', desc: 'Reach 5000 points', unlocked: stats.highScore >= 5000 },
    { id: 2, icon: '💎', title: 'Diamond', desc: 'Create a 2048 tile', unlocked: stats.bestTile >= 2048 },
    { id: 3, icon: '⭐', title: 'Super Star', desc: 'Reach 10000 points', unlocked: stats.highScore >= 10000 },
    { id: 4, icon: '🎯', title: 'Perfectionist', desc: 'Win without using power-ups', unlocked: false },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 42 }} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileGlow} />
          <TouchableOpacity 
            style={styles.profileAvatar}
            onPress={() => setShowAvatarPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.profileAvatarEmoji}>{avatar}</Text>
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✎</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{username || 'Player'}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {Math.floor(stats.gamesPlayed / 10) + 1}</Text>
          </View>
        </View>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <View style={styles.avatarGrid}>
                {getAvatarOptions().map((avatarOption) => (
                  <TouchableOpacity
                    key={avatarOption}
                    style={[
                      styles.avatarOption,
                      avatar === avatarOption && styles.avatarOptionSelected,
                    ]}
                    onPress={() => {
                      setAvatar(avatarOption);
                      setShowAvatarPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.avatarOptionText}>{avatarOption}</Text>
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

        {/* Stats Grid */}
        <Text style={styles.sectionLabel}>STATISTICS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👑</Text>
            <Text style={styles.statValue}>{stats.highScore.toLocaleString()}</Text>
            <Text style={styles.statLabel}>High Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎮</Text>
            <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔗</Text>
            <Text style={styles.statValue}>{stats.totalMerges}</Text>
            <Text style={styles.statLabel}>Total Merges</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statValue}>{stats.bestTile}</Text>
            <Text style={styles.statLabel}>Best Tile</Text>
          </View>
        </View>

        {/* Achievements */}
        <Text style={styles.sectionLabel}>ACHIEVEMENTS</Text>
        <View style={styles.achievementsList}>
          {achievements.map((achievement) => (
            <View 
              key={achievement.id} 
              style={[styles.achievementCard, !achievement.unlocked && styles.achievementCardLocked]}
            >
              <View style={[styles.achievementIcon, achievement.unlocked ? styles.achievementIconUnlocked : styles.achievementIconLocked]}>
                <Text style={styles.achievementIconText}>{achievement.unlocked ? achievement.icon : '🔒'}</Text>
              </View>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementTitle, !achievement.unlocked && styles.achievementTitleLocked]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDesc}>{achievement.desc}</Text>
              </View>
              {achievement.unlocked && (
                <View style={styles.achievementCheck}>
                  <Text style={styles.achievementCheckText}>✓</Text>
                </View>
              )}
            </View>
          ))}
        </View>
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
  profileCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    marginBottom: Spacing.xxl,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  profileGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileAvatar: {
    width: 88,
    height: 88,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  profileAvatarEmoji: {
    fontSize: 42,
  },
  profileName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    width: '47%',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  achievementsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  achievementCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  achievementCardLocked: {
    opacity: 0.4,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconUnlocked: {
    backgroundColor: Colors.accentDim,
  },
  achievementIconLocked: {
    backgroundColor: Colors.glass,
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  achievementTitleLocked: {
    color: Colors.textMuted,
  },
  achievementDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  achievementCheck: {
    width: 30,
    height: 30,
    backgroundColor: Colors.successDim,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementCheckText: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
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
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 350,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarOption: {
    width: 60,
    height: 60,
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionSelected: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  avatarOptionText: {
    fontSize: 32,
  },
  modalCloseButton: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalCloseButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
