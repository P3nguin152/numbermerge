import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HowToPlayScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>How to Play</Text>
        </View>

        {/* Objective */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconPrimary}>
              <Text style={styles.cardIconText}>🎯</Text>
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
            <View style={styles.cardIconAccent}>
              <Text style={styles.cardIconText}>👇</Text>
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
            <View style={styles.cardIconGreen}>
              <Text style={styles.cardIconText}>🔗</Text>
            </View>
            <Text style={styles.cardTitle}>Merging Tiles</Text>
          </View>
          <Text style={styles.cardText}>
            When two tiles with the same number touch, they merge into one tile with double the value.
          </Text>
          <View style={styles.stepList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>+</Text>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>=</Text>
              <View style={styles.stepNumberGreen}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Game Over */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconRed}>
              <Text style={styles.cardIconText}>💀</Text>
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
            <View style={styles.cardIconYellow}>
              <Text style={styles.cardIconText}>⚡</Text>
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
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWhite}>
              <Text style={styles.cardIconText}>💡</Text>
            </View>
            <Text style={styles.cardTitle}>Pro Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Plan ahead - Look at your next tile before dropping</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Build chains - Set up multiple merges in one column</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Keep space - Don't fill up all columns evenly</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Save power-ups - Use them when you're stuck</Text>
            </View>
          </View>
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
  card: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardIconPrimary: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(232, 98, 74, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconAccent: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(58, 110, 234, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconGreen: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconRed: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconYellow: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconWhite: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    fontSize: 24,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  cardText: {
    color: '#718096',
    fontSize: 16,
    lineHeight: 24,
  },
  stepList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#E8624A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberGreen: {
    backgroundColor: '#22C55E',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  powerUpList: {
    gap: 12,
  },
  powerUpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#171923',
    borderRadius: 12,
    padding: 16,
  },
  powerUpIcon: {
    fontSize: 24,
  },
  powerUpText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  tipsCard: {
    backgroundColor: '#E8624A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#E8624A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
  },
  tipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
  },
});
