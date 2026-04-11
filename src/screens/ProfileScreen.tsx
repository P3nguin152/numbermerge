import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loadStats } from '../utils/statsStorage';

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarEmoji}>🎮</Text>
          </View>
          <Text style={styles.profileName}>Player</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level 12</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionLabel}>Statistics</Text>
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
        <Text style={styles.sectionLabel}>Achievements</Text>
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
    backgroundColor: '#171923',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#E8624A',
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
    paddingRight: 64,
  },
  profileCard: {
    backgroundColor: '#3A6EEA',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#3A6EEA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileAvatarEmoji: {
    fontSize: 48,
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#718096',
    fontSize: 12,
    marginTop: 8,
  },
  achievementsList: {
    gap: 12,
    marginBottom: 32,
  },
  achievementCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconUnlocked: {
    backgroundColor: 'rgba(232, 98, 74, 0.2)',
  },
  achievementIconLocked: {
    backgroundColor: '#4A5568',
  },
  achievementIconText: {
    fontSize: 28,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  achievementTitleLocked: {
    color: '#718096',
  },
  achievementDesc: {
    color: '#718096',
    fontSize: 12,
    marginTop: 6,
  },
  achievementCheck: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementCheckText: {
    color: '#22C55E',
    fontSize: 18,
  },
});
