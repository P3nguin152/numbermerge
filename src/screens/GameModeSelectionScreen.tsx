import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../theme/colors';

export default function GameModeSelectionScreen() {
  const navigation = useNavigation();

  const modes: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    bgColor: string;
    screen: string;
  }> = [
    {
      id: 'classic',
      title: 'Classic',
      subtitle: 'Play at your own pace',
      icon: 'rocket',
      color: Colors.primary,
      bgColor: Colors.primaryDim,
      screen: 'Game',
    },
    {
      id: 'timeAttack',
      title: 'Time Attack',
      subtitle: 'Score as much as possible in 2 minutes',
      icon: 'timer',
      color: Colors.accent,
      bgColor: Colors.accentDim,
      screen: 'TimeAttack',
    },
    {
      id: 'limitedMoves',
      title: 'Limited Moves',
      subtitle: 'Maximize score with 25 drops',
      icon: 'dice',
      color: Colors.warning,
      bgColor: Colors.warningDim,
      screen: 'LimitedMoves',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Mode</Text>
          <View style={{ width: 42 }} />
        </View>

        {/* Game Modes */}
        <View style={styles.modesContainer}>
          <Text style={styles.sectionLabel}>GAME MODES</Text>
          
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.modeCard, { borderColor: mode.color }]}
              onPress={() => navigation.navigate(mode.screen as never)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: mode.bgColor }]}>
                <Ionicons name={mode.icon as any} size={28} color={mode.color} />
              </View>
              <View style={styles.modeContent}>
                <Text style={[styles.modeTitle, { color: mode.color }]}>{mode.title}</Text>
                <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={mode.color} />
            </TouchableOpacity>
          ))}
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
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  modesContainer: {
    gap: Spacing.md,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 2,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIcon: {
    fontSize: 28,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  modeSubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});
