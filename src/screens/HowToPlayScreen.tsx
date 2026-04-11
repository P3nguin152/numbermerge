import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../theme/colors';

export default function HowToPlayScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>How to Play</Text>
          <View style={{ width: 42 }} />
        </View>

        {/* Objective */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: Colors.accentDim }]}>
              <Text style={styles.iconText}>🎯</Text>
            </View>
            <Text style={styles.cardTitle}>Objective</Text>
          </View>
          <Text style={styles.cardText}>
            Drop numbered tiles into columns to merge matching numbers and reach the highest score possible!
          </Text>
        </View>

        {/* How to Drop */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: Colors.primaryDim }]}>
              <Text style={styles.iconText}>👇</Text>
            </View>
            <Text style={styles.cardTitle}>How to Drop Tiles</Text>
          </View>
          <Text style={styles.cardText}>
            Tap on any column or the drop arrow above it to place the next tile. The tile will fall to the lowest available space.
          </Text>
        </View>

        {/* Merging */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: Colors.successDim }]}>
              <Text style={styles.iconText}>🔗</Text>
            </View>
            <Text style={styles.cardTitle}>Merging Tiles</Text>
          </View>
          <Text style={styles.cardText}>
            When two tiles with the same number touch, they merge into one tile with double the value.
          </Text>
          <View style={styles.mergeDemo}>
            <View style={[styles.demoTile, { backgroundColor: Colors.accent }]}>
              <Text style={styles.demoTileText}>2</Text>
            </View>
            <Text style={styles.demoOp}>+</Text>
            <View style={[styles.demoTile, { backgroundColor: Colors.accent }]}>
              <Text style={styles.demoTileText}>2</Text>
            </View>
            <Text style={styles.demoOp}>=</Text>
            <View style={[styles.demoTile, { backgroundColor: Colors.success }]}>
              <Text style={styles.demoTileText}>4</Text>
            </View>
          </View>
        </View>

        {/* Game Over */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: Colors.dangerDim }]}>
              <Text style={styles.iconText}>💀</Text>
            </View>
            <Text style={styles.cardTitle}>Game Over</Text>
          </View>
          <Text style={styles.cardText}>
            The game ends when the grid is full and no more merges are possible. Try to beat your high score!
          </Text>
        </View>

        {/* Power-ups */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: Colors.warningDim }]}>
              <Text style={styles.iconText}>⚡</Text>
            </View>
            <Text style={styles.cardTitle}>Power-ups</Text>
          </View>
          <Text style={styles.cardText}>
            Use power-ups strategically to get out of tough situations:
          </Text>
          <View style={styles.powerUpList}>
            <View style={styles.powerUpItem}>
              <Text style={styles.powerUpIcon}>🔨</Text>
              <Text style={styles.powerUpText}>Hammer - Destroy any tile</Text>
            </View>
            <View style={styles.powerUpItem}>
              <Text style={styles.powerUpIcon}>🔄</Text>
              <Text style={styles.powerUpText}>Shuffle - Randomize the grid</Text>
            </View>
            <View style={styles.powerUpItem}>
              <Text style={styles.powerUpIcon}>↩️</Text>
              <Text style={styles.powerUpText}>Undo - Reverse your last move</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsGlow} />
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={styles.iconText}>💡</Text>
            </View>
            <Text style={styles.cardTitle}>Pro Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Plan ahead — look at your next tile before dropping</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Build chains — set up multiple merges in one column</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Keep space — don't fill up all columns evenly</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Save power-ups — use them when you're truly stuck</Text>
            </View>
          </View>
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

  // ── Cards ──
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  cardText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  // ── Merge Demo ──
  mergeDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  demoTile: {
    width: 40,
    height: 40,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  demoOp: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },

  // ── Power-ups ──
  powerUpList: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  powerUpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  powerUpIcon: {
    fontSize: 20,
  },
  powerUpText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },

  // ── Tips Card ──
  tipsCard: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xxxl,
    overflow: 'hidden',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  tipsGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tipsList: {
    gap: Spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginTop: 7,
  },
  tipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
});
