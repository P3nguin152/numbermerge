import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '../theme/colors';
import { markTimeAttackTutorialCompleted } from '../utils/tutorialStorage';

interface TimeAttackTutorialOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    id: 1,
    emoji: '⏱️',
    title: 'Race Against Time',
    description: 'You have 2 minutes to score as many points as possible!',
  },
  {
    id: 2,
    emoji: '🔥',
    title: 'Earn Bonus Time',
    description: 'Regular merges give +1 second. Triple merges give +3 seconds!',
  },
  {
    id: 3,
    emoji: '💎',
    title: 'Triple Merges',
    description: 'Match 3 tiles in a row, column, or L-shape for a ×4 merge and +3s bonus.',
  },
  {
    id: 4,
    emoji: '🚀',
    title: 'Max Time Cap',
    description: 'Time bonuses cap at 3 minutes. Keep merging to extend your run!',
  },
];

export default function TimeAttackTutorialOverlay({ visible, onClose }: TimeAttackTutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    await markTimeAttackTutorialCompleted();
    onClose();
  };

  const handleComplete = async () => {
    await markTimeAttackTutorialCompleted();
    onClose();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  const step = tutorialSteps[currentStep];

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.content}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {tutorialSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Step Content */}
          <View style={styles.stepContent}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{step.emoji}</Text>
            </View>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={[styles.navButton, styles.skipButton]}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === tutorialSteps.length - 1 ? "Let's Play!" : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    zIndex: 2000,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.xxxl,
    width: '100%',
    maxWidth: 400,
  },
  content: {
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.xxl,
  },
  progressDot: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.glass,
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: Colors.accent,
  },
  progressDotCompleted: {
    backgroundColor: Colors.success,
  },
  stepContent: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.accentDim,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  navigation: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  skipButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: Colors.accent,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
