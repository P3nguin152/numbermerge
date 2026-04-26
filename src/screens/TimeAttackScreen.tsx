import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Grid from '../components/Grid';
import { GameState } from '../types/game';
import {
  createEmptyGrid,
  generateNextValue,
  dropTile,
  isGameOver,
  canDropInColumn,
  GRID_COLS,
  GRID_ROWS,
} from '../utils/mergeLogic';
import { updateStats, loadStats } from '../utils/statsStorage';
import { saveGameState, loadGameState, clearGameState } from '../utils/gameStorage';
import { soundManager } from '../utils/soundManager';
import { loadSettings } from '../utils/settingsStorage';
import { incrementExitCount } from '../utils/exitStorage';
import { useUser } from '../contexts/UserContext';
import { AdBanner, useAds } from '../contexts/AdContext';
import { leaderboardService } from '../services/leaderboardService';
import { hasCompletedTimeAttackTutorial } from '../utils/tutorialStorage';
import TimeAttackTutorialOverlay from '../components/TimeAttackTutorialOverlay';

import { Colors, TileColors as ThemeTileColors, Radius, Spacing } from '../theme/colors';

const TIME_ATTACK_DURATION = 120; // 2 minutes in seconds
const MAX_TIME = 180; // 3 minutes max with bonuses

export const TILE_COLORS: Record<number, { bg: string; text: string }> = Object.fromEntries(
  Object.entries(ThemeTileColors || {}).map(([k, v]) => {
    if (v && typeof v === 'object' && 'bg' in v && 'text' in v) {
      return [k, { bg: v.bg, text: v.text }];
    }
    return [k, { bg: '#3c3a32', text: '#f9f6f2' }];
  })
);

function TimeAttackScreen() {
  const navigation = useNavigation();
  const { username } = useUser();
  const { showRewarded, showInterstitial } = useAds();
  const [personalBest, setPersonalBest] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIME_ATTACK_DURATION);
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: createEmptyGrid(),
    score: 0,
    gameOver: false,
    nextTile: generateNextValue(),
  }));
  const [merges, setMerges] = useState(0);
  const [bestTile, setBestTile] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNewBest, setShowNewBest] = useState(false);
  const [didBeatPersonalBest, setDidBeatPersonalBest] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [playAgainCount, setPlayAgainCount] = useState(0);
  const [timeBonus, setTimeBonus] = useState<{ value: number; x: number; y: number } | null>(null);

  // Initialize sound manager and settings
  useEffect(() => {
    soundManager.initialize();
    soundManager.loadSounds();

    loadSettings().then(settings => {
      soundManager.setSoundEnabled(settings.soundEnabled);
      soundManager.setVibrationEnabled(settings.vibrationEnabled);
      soundManager.setMusicEnabled(settings.musicEnabled);
    });

    loadStats().then(stats => {
      setTotalGamesPlayed(stats.gamesPlayed);
      setPersonalBest(stats.highScore);
    });

    // Load saved game state if exists
    loadGameState('timeAttack').then(({ gameState: savedState, merges: savedMerges, bestTile: savedBestTile, timeRemaining: savedTimeRemaining }) => {
      if (savedState && !savedState.gameOver) {
        setGameState(savedState);
        setMerges(savedMerges);
        setBestTile(savedBestTile);
        if (savedTimeRemaining !== undefined) {
          setTimeRemaining(savedTimeRemaining);
        }
      }
    });

    // Check if tutorial should be shown
    hasCompletedTimeAttackTutorial().then((completed: boolean) => {
      if (!completed) {
        setShowTutorial(true);
      }
    });

    return () => {
      soundManager.cleanup();
    };
  }, []);

  // Timer for Time Attack mode
  useEffect(() => {
    if (gameState.gameOver || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up
          setGameState(prevState => ({ ...prevState, gameOver: true }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.gameOver, isPaused]);

  // Animation values
  const scoreScale = useSharedValue(1);
  const nextBlockScale = useSharedValue(1);
  const nextBlockRotate = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(0.8);
  const arrowScales = useRef(Array(GRID_COLS || 5).fill(0).map(() => useSharedValue(1))).current;
  const pauseButtonScale = useSharedValue(1);
  const timerScale = useSharedValue(1);
  const bonusOpacity = useSharedValue(0);
  const bonusTranslateY = useSharedValue(0);

  // Animate score when it changes
  useEffect(() => {
    scoreScale.value = withSequence(
      withTiming(1.3, { duration: 100, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 8, stiffness: 300 })
    );
  }, [gameState.score]);

  // Animate timer when it changes
  useEffect(() => {
    timerScale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
  }, [timeRemaining]);

  // Animate next block when it changes
  useEffect(() => {
    nextBlockScale.value = withSequence(
      withTiming(0.5, { duration: 150 }),
      withSpring(1, { damping: 12, stiffness: 250 })
    );
    nextBlockRotate.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 200 })
    );
  }, [gameState.nextTile]);

  useEffect(() => {
    if (!gameState.gameOver && !isPaused) {
      overlayOpacity.value = withTiming(0, { duration: 180 });
      overlayScale.value = withTiming(0.92, { duration: 180 });
      return;
    }

    overlayOpacity.value = withTiming(1, { duration: 220 });
    overlayScale.value = withSpring(1, { damping: 14, stiffness: 220 });
  }, [gameState.gameOver, isPaused]);

  useEffect(() => {
    if (!showNewBest) {
      return;
    }

    const timeout = setTimeout(() => {
      setShowNewBest(false);
    }, 2200);

    return () => clearTimeout(timeout);
  }, [showNewBest]);

  // Animate time bonus
  useEffect(() => {
    if (timeBonus) {
      bonusOpacity.value = withTiming(1, { duration: 100 });
      bonusTranslateY.value = withSequence(
        withTiming(-50, { duration: 600, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 100 })
      );
      const timeout = setTimeout(() => {
        setTimeBonus(null);
        bonusOpacity.value = withTiming(0, { duration: 200 });
      }, 800);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [timeBonus, bonusOpacity, bonusTranslateY]);

  const handleColumnPress = useCallback((col: number) => {
    if (gameState.gameOver || isPaused) return;

    // Animate arrow press
    arrowScales[col].value = withSequence(
      withTiming(0.7, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    if (!canDropInColumn(gameState.grid, col)) {
      // End game immediately when column is full
      setGameState(prev => ({ ...prev, gameOver: true }));
      // Save stats when game ends
      updateStats(gameState.score, merges, bestTile);
      soundManager.playSound('gameOver');
      AccessibilityInfo.announceForAccessibility(`Game over. Final score ${gameState.score}.`);
      return;
    }

    const { grid: newGrid, score: moveScore, tripleMergeCount, totalMergeCount } = dropTile(
      gameState.grid,
      gameState.nextTile,
      col
    );
    const gameOver = isGameOver(newGrid);

    // Track merges and best tile
    let mergeCount = totalMergeCount;
    let maxTile = bestTile;
    let maxMergeValue = 0;

    // Count merges and find best tile in the new grid
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const tile = newGrid[row][c];
        if (tile) {
          if (tile.isMerged) {
            if (tile.value > maxMergeValue) maxMergeValue = tile.value;
          }
          if (tile.value > maxTile) maxTile = tile.value;
        }
      }
    }

    // Calculate time bonus: +1s per 2-tile merge, +3s per triple merge
    const regularMerges = mergeCount - tripleMergeCount;
    const timeBonusValue = regularMerges * 1 + tripleMergeCount * 3;
    if (timeBonusValue > 0) {
      setTimeRemaining(prev => Math.min(prev + timeBonusValue, MAX_TIME));
      // Show bonus animation near the timer
      setTimeBonus({ value: timeBonusValue, x: 0, y: 0 });
    }

    const totalScore = gameState.score + moveScore;
    const beatPersonalBest = totalScore > personalBest;

    // Play sound effects
    soundManager.playSound('drop');
    if (mergeCount > 0) {
      soundManager.playSound('merge');
    }

    const totalMerges = merges + mergeCount;
    setMerges(totalMerges);
    setBestTile(maxTile);
    if (beatPersonalBest) {
      setPersonalBest(totalScore);
    }

    if (gameOver) {
      // Clear saved game state so returning starts a new game
      clearGameState('timeAttack');

      // Save stats when game ends
      updateStats(totalScore, totalMerges, maxTile);
      soundManager.playSound('gameOver');
      AccessibilityInfo.announceForAccessibility(`Game over. Final score ${totalScore}.`);

      // Show new best banner if personal best was beaten
      if (beatPersonalBest && !showNewBest) {
        setDidBeatPersonalBest(true);
        setShowNewBest(true);
      }
    }

    setGameState({
      grid: newGrid,
      score: totalScore,
      gameOver: gameOver,
      nextTile: gameOver ? gameState.nextTile : generateNextValue(),
      lastMergeValue: maxMergeValue || undefined,
    });
  }, [gameState.gameOver, isPaused, gameState.grid, gameState.nextTile, gameState.score, merges, bestTile, totalGamesPlayed, username, arrowScales, personalBest, showNewBest]);

  const initializeGame = useCallback(async () => {
    // Show interstitial ad if game was over and this is the 3rd play again
    if (gameState.gameOver) {
      const newCount = playAgainCount + 1;
      if (newCount >= 3) {
        showInterstitial();
        setPlayAgainCount(0);
      } else {
        setPlayAgainCount(newCount);
      }
    }
    
    // Clear saved game state when starting a new game
    clearGameState('timeAttack');
    setGameState({
      grid: createEmptyGrid(),
      score: 0,
      gameOver: false,
      nextTile: generateNextValue(),
    });
    setMerges(0);
    setBestTile(2);
    setTimeRemaining(TIME_ATTACK_DURATION);
    setDidBeatPersonalBest(false);
    setShowNewBest(false);
  }, [gameState.gameOver, showInterstitial, playAgainCount]);

  const handlePausePress = useCallback(() => {
    pauseButtonScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    if (!isPaused) {
      soundManager.playSound('pause');
    } else {
      soundManager.playSound('resume');
    }
    setIsPaused(!isPaused);
  }, [isPaused, pauseButtonScale]);

  const handleResume = useCallback(() => {
    soundManager.playSound('resume');
    setIsPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    setIsPaused(false);
    initializeGame();
  }, [initializeGame]);

  const handleQuit = useCallback(async () => {
    // Save game state before quitting
    if (!gameState.gameOver) {
      saveGameState(gameState, merges, bestTile, 'timeAttack', timeRemaining);
    }
    
    // Track exit and show ad every 5th time
    const exitCount = await incrementExitCount();
    if (exitCount % 5 === 0) {
      showInterstitial();
    }
    
    navigation.goBack();
  }, [navigation, gameState, merges, bestTile, timeRemaining, showInterstitial]);

  const handleBackPress = useCallback(async () => {
    // Save game state before backing out
    if (!gameState.gameOver) {
      saveGameState(gameState, merges, bestTile, 'timeAttack', timeRemaining);
    }
    
    // Track exit and show ad every 5th time
    const exitCount = await incrementExitCount();
    if (exitCount % 5 === 0) {
      showInterstitial();
    }
    
    navigation.goBack();
  }, [navigation, gameState, merges, bestTile, timeRemaining, showInterstitial]);

  const handleWatchAdToContinue = useCallback(async () => {
    setIsWatchingAd(true);
    await showRewarded();
    setIsWatchingAd(false);

    // Proceed regardless of reward detection (test ads may not trigger rewards)
    // Add 30 seconds to continue playing
    setTimeRemaining(prev => Math.max(prev + 30, 30));
    
    // Check if grid can continue before resetting game over
    const canContinue = gameState.grid.some(row => 
      row.some(tile => tile === null || tile === undefined)
    );
    
    if (canContinue) {
      setGameState(prev => ({ ...prev, gameOver: false }));
      soundManager.playSound('resume');
    } else {
      // Grid is full, cannot continue even with more time
      soundManager.playSound('gameOver');
    }
  }, [showRewarded, gameState.grid]);

  const nextColor = useMemo(() => TILE_COLORS[gameState.nextTile]?.bg || '#3c3a32', [gameState.nextTile]);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }] as any,
  }), []);

  const nextBlockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextBlockScale.value }] as any,
  }), []);

  const pauseButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pauseButtonScale.value }] as any,
  }), []);

  const timerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }] as any,
  }), []);

  const bonusAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bonusOpacity.value,
    transform: [{ translateY: bonusTranslateY.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const overlayCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: overlayScale.value }],
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const isTimeRunningLow = timeRemaining <= 10;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <View style={styles.scoreChip} accessibilityRole="summary" accessibilityLabel={`Current score ${gameState.score}. Personal best ${personalBest}.`}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Animated.Text style={[styles.scoreValue, scoreAnimatedStyle]}>{gameState.score}</Animated.Text>
          </View>
          <View style={[styles.timerChip, isTimeRunningLow && styles.timerChipLow]}>
            <Text style={styles.timerLabel}>TIME</Text>
            <Animated.Text style={[styles.timerValue, isTimeRunningLow && styles.timerValueLow, timerAnimatedStyle]}>
              {formatTime(timeRemaining)}
            </Animated.Text>
            {timeBonus && (
              <Animated.View style={[styles.timeBonusContainer, bonusAnimatedStyle]}>
                <Text style={styles.timeBonusText}>+{timeBonus.value}s</Text>
              </Animated.View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.pauseBtn}
          onPress={handlePausePress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isPaused ? 'Resume game' : 'Pause game'}
        >
          <Animated.View style={pauseButtonAnimatedStyle}>
            <Ionicons name={isPaused ? 'play' : 'pause'} size={20} color={Colors.textPrimary} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Next Block Strip */}
      <View style={styles.nextStrip}>
        <Text style={styles.nextLabel}>NEXT</Text>
        <Animated.View style={[styles.nextPreview, { backgroundColor: nextColor }, nextBlockAnimatedStyle]} accessibilityLabel={`Next tile ${gameState.nextTile}`}>
          <Text style={styles.nextNumber}>{gameState.nextTile}</Text>
        </Animated.View>
        <View style={styles.personalBestChip}>
          <Text style={styles.personalBestLabel}>BEST</Text>
          <Text style={styles.personalBestValue}>{personalBest.toLocaleString()}</Text>
        </View>
      </View>

      {showNewBest && (
        <View style={styles.newBestBanner} accessibilityLiveRegion="polite">
          <Text style={styles.newBestText}>New Best! {gameState.score.toLocaleString()}</Text>
        </View>
      )}

      {/* Drop Arrows */}
      <View style={styles.arrowRow}>
        {Array(GRID_COLS || 5).fill(null).map((_, i) => {
          const arrowAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: arrowScales[i]?.value || 1 }] as any,
          }), []);
          return (
            <TouchableOpacity
              key={i}
              style={styles.arrowButton}
              onPress={() => handleColumnPress(i)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Drop tile in column ${i + 1}`}
            >
              <Animated.View style={[arrowAnimatedStyle]}>
                <Ionicons name="chevron-down" size={16} color={Colors.primary} style={{ opacity: 0.6 }} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Game Grid */}
      <View style={styles.gridContainer}>
        <Grid grid={gameState.grid} onColumnPress={handleColumnPress} />
      </View>

      {/* Banner Ad */}
      {!gameState.gameOver && !isPaused && <AdBanner />}

      {/* Game Over Overlay */}
      {gameState.gameOver && (
        <Animated.View style={[styles.overlay, overlayAnimatedStyle]} accessibilityViewIsModal>
          <Animated.View style={[styles.overlayCard, overlayCardAnimatedStyle]}>
            <Ionicons name="skull" size={48} color={Colors.danger} />
            <Text style={styles.overlayTitle}>Time's Up!</Text>
            <View style={styles.overlayScoreRow}>
              <Text style={styles.overlayScoreLabel}>Final Score</Text>
              <Text style={styles.overlayScoreValue}>{gameState.score.toLocaleString()}</Text>
            </View>
            {didBeatPersonalBest && (
              <View style={styles.recordBadge}>
                <Text style={styles.recordBadgeText}>New personal best</Text>
              </View>
            )}
            {isSubmittingScore && (
              <View style={styles.submittingRow}>
                <ActivityIndicator color={Colors.primaryLight} size="small" />
                <Text style={styles.submittingText}>Submitting score...</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.overlayBtn, isSubmittingScore && styles.overlayBtnDisabled]}
              onPress={initializeGame}
              activeOpacity={0.85}
              disabled={isSubmittingScore}
              accessibilityRole="button"
              accessibilityLabel={isSubmittingScore ? 'Submitting score' : 'Play again'}
            >
              <Text style={styles.overlayBtnText}>
                {isSubmittingScore ? 'SUBMITTING...' : 'PLAY AGAIN'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.overlayBtnRewarded, isWatchingAd && styles.overlayBtnDisabled]}
              onPress={handleWatchAdToContinue}
              activeOpacity={0.85}
              disabled={isWatchingAd}
              accessibilityRole="button"
              accessibilityLabel={isWatchingAd ? 'Loading ad' : 'Watch ad to continue'}
            >
              <Text style={styles.overlayBtnRewardedText}>
                {isWatchingAd ? 'LOADING...' : 'WATCH AD FOR +30s'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.overlayBtnSecondary}
              onPress={handleQuit}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back to home"
            >
              <Text style={styles.overlayBtnSecondaryText}>Back to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {/* Pause Menu Overlay */}
      {isPaused && (
        <Animated.View style={[styles.overlay, overlayAnimatedStyle]} accessibilityViewIsModal>
          <Animated.View style={[styles.overlayCard, overlayCardAnimatedStyle]}>
            <Ionicons name="pause-circle" size={48} color={Colors.textPrimary} />
            <Text style={styles.overlayTitle}>Paused</Text>
            <TouchableOpacity
              style={styles.overlayBtn}
              onPress={handleResume}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Resume game"
            >
              <Text style={styles.overlayBtnText}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.overlayBtnSecondary}
              onPress={handleRestart}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Restart game"
            >
              <Ionicons name="refresh" size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={styles.overlayBtnSecondaryText}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.overlayBtnSecondary, { borderColor: Colors.danger }]}
              onPress={handleQuit}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Quit game"
            >
              <Ionicons name="close-circle" size={16} color={Colors.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.overlayBtnSecondaryText, { color: Colors.danger }]}>Quit</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {/* Tutorial Overlay */}
      <TimeAttackTutorialOverlay
        visible={showTutorial && !isPaused && !gameState.gameOver}
        onClose={() => setShowTutorial(false)}
      />
    </View>
  );
}

export default React.memo(TimeAttackScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 52,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  backButton: {
    width: 42,
    height: 42,
    backgroundColor: Colors.card,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scoreChip: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  scoreLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  scoreValue: {
    color: Colors.warning,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  timerChip: {
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    minWidth: 70,
  },
  timerChipLow: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerDim,
  },
  timerLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  timerValue: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  timerValueLow: {
    color: Colors.danger,
  },
  timeBonusContainer: {
    position: 'absolute',
    top: -20,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeBonusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  pauseBtn: {
    width: 42,
    height: 42,
    backgroundColor: Colors.card,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Next Strip ──
  nextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  nextLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  nextPreview: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  personalBestChip: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  personalBestLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  personalBestValue: {
    color: Colors.success,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  newBestBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.successDim,
    borderColor: Colors.success,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  newBestText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '800',
  },

  // ── Arrows ──
  arrowRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingBottom: 4,
  },
  arrowButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },

  // ── Grid ──
  gridContainer: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Overlays ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    zIndex: 1000,
  },
  overlayCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.xxxl,
    width: '100%',
    alignItems: 'center',
  },
  overlayTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: Spacing.lg,
  },
  overlayScoreRow: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  overlayScoreLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  overlayScoreValue: {
    color: Colors.warning,
    fontSize: 36,
    fontWeight: '900',
  },
  recordBadge: {
    backgroundColor: Colors.successDim,
    borderColor: Colors.success,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  recordBadgeText: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '800',
  },
  overlayBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  overlayBtnDisabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0,
  },
  overlayBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  overlayBtnRewarded: {
    width: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  overlayBtnRewardedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  overlayBtnSecondary: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  overlayBtnSecondaryText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  submittingText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
});
