import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../theme/colors';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  didBeatPersonalBest: boolean;
  isSubmittingScore: boolean;
  isWatchingAd: boolean;
  onPlayAgain: () => void;
  onWatchAdToContinue: () => void;
  onQuit: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  didBeatPersonalBest,
  isSubmittingScore,
  isWatchingAd,
  onPlayAgain,
  onWatchAdToContinue,
  onQuit,
}) => {
  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(0.8);
  const cardRotation = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      overlayScale.value = withSequence(
        withTiming(0.5, { duration: 150 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      cardRotation.value = withSequence(
        withTiming(-0.05, { duration: 200 }),
        withSpring(0, { damping: 12, stiffness: 150 })
      );
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      overlayScale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }), []);

  const overlayCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: overlayScale.value },
      { rotate: `${cardRotation.value}rad` }
    ] as any,
  }), []);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayAnimatedStyle]} accessibilityViewIsModal>
      <Animated.View style={[styles.overlayCard, overlayCardAnimatedStyle]}>
        <View style={styles.headerGradient}>
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={48} color="#fff" />
          </View>
          <Text style={styles.overlayTitle}>Game Over</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>YOUR SCORE</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>

          {didBeatPersonalBest && (
            <View style={styles.newBestContainer}>
              <Ionicons name="star" size={16} color={Colors.success} />
              <Text style={styles.newBestText}>New Personal Best!</Text>
              <Ionicons name="star" size={16} color={Colors.success} />
            </View>
          )}

          {isSubmittingScore && (
            <View style={styles.submittingRow}>
              <ActivityIndicator color={Colors.primary} size="small" />
              <Text style={styles.submittingText}>Saving score...</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, isSubmittingScore && styles.buttonDisabled]}
              onPress={onPlayAgain}
              activeOpacity={0.8}
              disabled={isSubmittingScore}
              accessibilityRole="button"
              accessibilityLabel={isSubmittingScore ? 'Submitting score' : 'Play again'}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {isSubmittingScore ? 'SAVING...' : 'PLAY AGAIN'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, isWatchingAd && styles.buttonDisabled]}
              onPress={onWatchAdToContinue}
              activeOpacity={0.8}
              disabled={isWatchingAd}
              accessibilityRole="button"
              accessibilityLabel={isWatchingAd ? 'Loading ad' : 'Watch ad to continue'}
            >
              <Ionicons name="videocam" size={18} color={Colors.accent} />
              <Text style={styles.secondaryButtonText}>
                {isWatchingAd ? 'LOADING...' : 'CONTINUE WITH AD'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tertiaryButton}
              onPress={onQuit}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back to home"
            >
              <Ionicons name="home" size={18} color={Colors.textSecondary} />
              <Text style={styles.tertiaryButtonText}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    zIndex: 1000,
  },
  overlayCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  headerGradient: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: Colors.primary,
  },
  iconContainer: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  contentContainer: {
    padding: Spacing.xl,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scoreLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  scoreValue: {
    color: Colors.textPrimary,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 60,
  },
  newBestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successDim,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginBottom: Spacing.lg,
  },
  newBestText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  submittingText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: Spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xl,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentDim,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  secondaryButtonText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tertiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tertiaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GameOverModal;
