import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loadStats } from '../utils/statsStorage';
import { Colors, Radius, Spacing } from '../theme/colors';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    highScore: 0,
    gamesPlayed: 0,
    totalMerges: 0,
    bestTile: 2,
  });

  useEffect(() => {
    loadStats().then(loadedStats => {
      setStats({
        highScore: loadedStats.highScore,
        gamesPlayed: loadedStats.gamesPlayed,
        totalMerges: loadedStats.totalMerges,
        bestTile: loadedStats.bestTile,
      });
    });
  }, []);

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
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarEmoji}>🎮</Text>
          </View>
          <Text style={styles.profileName}>Player</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level 12</Text>
          </View>
        </View>

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
});
