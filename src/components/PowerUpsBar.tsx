import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePowerUps } from '../contexts/PowerUpsContext';
import { Colors, Radius, Spacing } from '../theme/colors';

interface PowerUpsBarProps {
  isPaused: boolean;
  isGameOver: boolean;
  onUndo: () => void;
  onShuffle: () => void;
  onRemoveTiles: () => void;
  onDoublePoints: () => void;
}

function PowerUpsBar({ isPaused, isGameOver, onUndo, onShuffle, onRemoveTiles, onDoublePoints }: PowerUpsBarProps) {
  const {
    undoCount,
    shuffleCount,
    removeTilesCount,
    doublePointsCount,
    doublePointsActive,
  } = usePowerUps();

  return (
    <>
      <View style={styles.powerUpsBar}>
        {/* Undo Button */}
        <TouchableOpacity
          style={[styles.powerUpButton, undoCount === 0 && styles.powerUpButtonDisabled]}
          onPress={onUndo}
          activeOpacity={0.7}
          disabled={undoCount === 0 || isPaused || isGameOver}
          accessibilityRole="button"
          accessibilityLabel={`Undo last move. ${undoCount} uses remaining`}
        >
          <Ionicons 
            name="arrow-undo" 
            size={24} 
            color={undoCount === 0 ? Colors.textMuted : Colors.textPrimary}
            style={undoCount === 0 && styles.powerUpIconDisabled}
          />
          <Text style={[styles.powerUpCount, undoCount === 0 && styles.powerUpIconDisabled]}>{undoCount}</Text>
        </TouchableOpacity>

        {/* Shuffle Button */}
        <TouchableOpacity
          style={[styles.powerUpButton, shuffleCount === 0 && styles.powerUpButtonDisabled]}
          onPress={onShuffle}
          activeOpacity={0.7}
          disabled={shuffleCount === 0 || isPaused || isGameOver}
          accessibilityRole="button"
          accessibilityLabel={`Shuffle board. ${shuffleCount} uses remaining`}
        >
          <Ionicons 
            name="shuffle" 
            size={24} 
            color={shuffleCount === 0 ? Colors.textMuted : Colors.textPrimary}
            style={shuffleCount === 0 && styles.powerUpIconDisabled}
          />
          <Text style={[styles.powerUpCount, shuffleCount === 0 && styles.powerUpIconDisabled]}>{shuffleCount}</Text>
        </TouchableOpacity>

        {/* Remove Tiles Button */}
        <TouchableOpacity
          style={[styles.powerUpButton, removeTilesCount === 0 && styles.powerUpButtonDisabled]}
          onPress={onRemoveTiles}
          activeOpacity={0.7}
          disabled={removeTilesCount === 0 || isPaused || isGameOver}
          accessibilityRole="button"
          accessibilityLabel={`Remove lowest tiles. ${removeTilesCount} uses remaining`}
        >
          <Ionicons 
            name="trash" 
            size={24} 
            color={removeTilesCount === 0 ? Colors.textMuted : Colors.textPrimary}
            style={removeTilesCount === 0 && styles.powerUpIconDisabled}
          />
          <Text style={[styles.powerUpCount, removeTilesCount === 0 && styles.powerUpIconDisabled]}>{removeTilesCount}</Text>
        </TouchableOpacity>

        {/* Double Points Button */}
        <TouchableOpacity
          style={[
            styles.powerUpButton,
            doublePointsCount === 0 || doublePointsActive ? styles.powerUpButtonDisabled : styles.powerUpButtonActive,
            doublePointsActive && styles.powerUpButtonActivated
          ]}
          onPress={onDoublePoints}
          activeOpacity={0.7}
          disabled={doublePointsCount === 0 || isPaused || isGameOver || doublePointsActive}
          accessibilityRole="button"
          accessibilityLabel={`Double points. ${doublePointsCount} uses remaining${doublePointsActive ? ' - Active' : ''}`}
        >
          <Ionicons 
            name="star" 
            size={24} 
            color={doublePointsCount === 0 || doublePointsActive ? Colors.textMuted : Colors.textPrimary}
            style={(doublePointsCount === 0 || doublePointsActive) && styles.powerUpIconDisabled}
          />
          <Text style={[styles.powerUpCount, (doublePointsCount === 0 || doublePointsActive) && styles.powerUpIconDisabled]}>{doublePointsCount}</Text>
        </TouchableOpacity>
      </View>

      {doublePointsActive && (
        <View style={styles.doublePointsBanner} accessibilityLiveRegion="polite">
          <View style={styles.doublePointsBannerContent}>
            <Ionicons name="star" size={20} color={Colors.accent} />
            <Text style={styles.doublePointsText}>2X POINTS ACTIVE</Text>
            <Ionicons name="star" size={20} color={Colors.accent} />
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  powerUpsBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  powerUpButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    gap: 2,
    minHeight: 60,
    justifyContent: 'center',
  },
  powerUpButtonDisabled: {
    opacity: 0.3,
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
  },
  powerUpButtonActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  powerUpButtonActivated: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  powerUpIconDisabled: {
    opacity: 0.3,
  },
  powerUpCount: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  doublePointsBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  doublePointsBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  doublePointsText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default React.memo(PowerUpsBar);
