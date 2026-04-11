import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import Grid from './Grid';
import { GameState } from '../types/game';
import {
  createEmptyGrid,
  generateNextValue,
  dropTile,
  isGameOver,
  canDropInColumn,
  GRID_COLS,
} from '../utils/mergeLogic';
import { updateStats, loadStats } from '../utils/statsStorage';
import { soundManager } from '../utils/soundManager';
import { loadSettings } from '../utils/settingsStorage';
import { useUser } from '../contexts/UserContext';
import { leaderboardService } from '../services/leaderboardService';

import { Colors, TileColors as ThemeTileColors, Radius, Spacing } from '../theme/colors';

export const TILE_COLORS: Record<number, { bg: string; text: string }> = Object.fromEntries(
  Object.entries(ThemeTileColors).map(([k, v]) => [k, { bg: v.bg, text: v.text }])
);

function GameBoard() {
  const navigation = useNavigation();
  const { username } = useUser();
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
    });

    return () => {
      soundManager.cleanup();
    };
  }, []);

  // Animation values
  const scoreScale = useSharedValue(1);
  const nextBlockScale = useSharedValue(1);
  const nextBlockRotate = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(0.8);
  const arrowScales = useRef(Array(GRID_COLS).fill(0).map(() => useSharedValue(1))).current;
  const pauseButtonScale = useSharedValue(1);

  // Animate score when it changes
  useEffect(() => {
    scoreScale.value = withSequence(
      withTiming(1.3, { duration: 100, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 8, stiffness: 300 })
    );
  }, [gameState.score]);

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
      // Trigger overlay animation
      overlayOpacity.value = withTiming(1, { duration: 300 });
      overlayScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      // Trigger overlay animation
      overlayOpacity.value = withTiming(1, { duration: 300 });
      overlayScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      // Trigger overlay animation
      overlayOpacity.value = withTiming(1, { duration: 300 });
      overlayScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      // Save stats when game ends
      updateStats(gameState.score, merges, bestTile);
      soundManager.playSound('gameOver');

      // Submit score to leaderboard if user has username
      if (username) {
        setIsSubmittingScore(true);
        leaderboardService.submitScore(
          username,
          gameState.score,
          bestTile,
          totalGamesPlayed + 1
        ).then(result => {
          if (!result.success) {
            console.warn('Score submission warning:', result.error);
          }
        }).catch(err => {
          console.error('Failed to submit score:', err);
        }).finally(() => {
          setIsSubmittingScore(false);
        });
      }
      return;
    }

    const { grid: newGrid, score: moveScore } = dropTile(
      gameState.grid,
      gameState.nextTile,
      col
    );
    const gameOver = isGameOver(newGrid);

    // Track merges and best tile
    let mergeCount = 0;
    let maxTile = bestTile;
    let maxMergeValue = 0;

    // Count merges and find best tile in the new grid
    for (let row = 0; row < 6; row++) {
      for (let c = 0; c < 6; c++) {
        const tile = newGrid[row][c];
        if (tile) {
          if (tile.isMerged) {
            mergeCount++;
            if (tile.value > maxMergeValue) maxMergeValue = tile.value;
          }
          if (tile.value > maxTile) maxTile = tile.value;
        }
      }
    }

    const totalScore = gameState.score + moveScore;

    // Play sound effects
    soundManager.playSound('drop');
    if (mergeCount > 0) {
      soundManager.playSound('merge');
    }

    setMerges(prev => prev + mergeCount);
    setBestTile(maxTile);

    if (gameOver) {
      // Save stats when game ends
      updateStats(totalScore, merges + mergeCount, maxTile);
      soundManager.playSound('gameOver');

      // Submit score to leaderboard if user has username
      if (username) {
        setIsSubmittingScore(true);
        leaderboardService.submitScore(
          username,
          totalScore,
          maxTile,
          totalGamesPlayed + 1
        ).then(result => {
          if (!result.success) {
            console.warn('Score submission warning:', result.error);
          }
        }).catch(err => {
          console.error('Failed to submit score:', err);
        }).finally(() => {
          setIsSubmittingScore(false);
        });
      }
    }

    setGameState({
      grid: newGrid,
      score: totalScore,
      gameOver: gameOver,
      nextTile: gameOver ? gameState.nextTile : generateNextValue(),
      lastMergeValue: maxMergeValue || undefined,
    });
  }, [gameState.gameOver, isPaused, gameState.grid, gameState.nextTile, gameState.score, merges, bestTile, totalGamesPlayed, username, arrowScales]);

  const initializeGame = useCallback(() => {
    setGameState({
      grid: createEmptyGrid(),
      score: 0,
      gameOver: false,
      nextTile: generateNextValue(),
    });
    setMerges(0);
    setBestTile(2);
  }, []);

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

  const handleQuit = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.scoreChip}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Animated.Text style={[styles.scoreValue, scoreAnimatedStyle]}>{gameState.score}</Animated.Text>
        </View>

        <TouchableOpacity 
          style={styles.pauseBtn}
          onPress={handlePausePress}
          activeOpacity={0.7}
        >
          <Animated.Text style={[styles.pauseIcon, pauseButtonAnimatedStyle]}>⏸</Animated.Text>
        </TouchableOpacity>
      </View>

      {/* Next Block Strip */}
      <View style={styles.nextStrip}>
        <Text style={styles.nextLabel}>NEXT</Text>
        <Animated.View style={[styles.nextPreview, { backgroundColor: nextColor }, nextBlockAnimatedStyle]}>
          <Text style={styles.nextNumber}>{gameState.nextTile}</Text>
        </Animated.View>
      </View>

      {/* Drop Arrows */}
      <View style={styles.arrowRow}>
        {Array(GRID_COLS).fill(null).map((_, i) => {
          const arrowAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: arrowScales[i].value }] as any,
          }), []);
          return (
            <TouchableOpacity
              key={i}
              style={styles.arrowButton}
              onPress={() => handleColumnPress(i)}
              activeOpacity={0.7}
            >
              <Animated.Text style={[styles.arrowText, arrowAnimatedStyle]}>▼</Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Game Grid */}
      <View style={styles.gridContainer}>
        <Grid grid={gameState.grid} onColumnPress={handleColumnPress} />
      </View>

      {/* Game Over Overlay */}
      {gameState.gameOver && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayEmoji}>💥</Text>
            <Text style={styles.overlayTitle}>Game Over</Text>
            <View style={styles.overlayScoreRow}>
              <Text style={styles.overlayScoreLabel}>Final Score</Text>
              <Text style={styles.overlayScoreValue}>{gameState.score.toLocaleString()}</Text>
            </View>
            {isSubmittingScore && (
              <Text style={styles.submittingText}>Submitting score...</Text>
            )}
            <TouchableOpacity
              style={[styles.overlayBtn, isSubmittingScore && styles.overlayBtnDisabled]}
              onPress={initializeGame}
              activeOpacity={0.85}
              disabled={isSubmittingScore}
            >
              <Text style={styles.overlayBtnText}>
                {isSubmittingScore ? 'SUBMITTING...' : 'PLAY AGAIN'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.overlayBtnSecondary}
              onPress={handleQuit}
              activeOpacity={0.7}
            >
              <Text style={styles.overlayBtnSecondaryText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pause Menu Overlay */}
      {isPaused && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayEmoji}>⏸</Text>
            <Text style={styles.overlayTitle}>Paused</Text>
            <TouchableOpacity
              style={styles.overlayBtn}
              onPress={handleResume}
              activeOpacity={0.85}
            >
              <Text style={styles.overlayBtnText}>▶  RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.overlayBtnSecondary}
              onPress={handleRestart}
              activeOpacity={0.7}
            >
              <Text style={styles.overlayBtnSecondaryText}>🔄  Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.overlayBtnSecondary, { borderColor: Colors.danger }]}
              onPress={handleQuit}
              activeOpacity={0.7}
            >
              <Text style={[styles.overlayBtnSecondaryText, { color: Colors.danger }]}>✖  Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default React.memo(GameBoard);

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
  backIcon: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '600',
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
  pauseIcon: {
    color: Colors.textPrimary,
    fontSize: 20,
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
  arrowText: {
    color: Colors.primary,
    fontSize: 16,
    opacity: 0.6,
  },

  // ── Grid ──
  gridContainer: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.lg,
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
  overlayEmoji: {
    fontSize: 48,
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.lg,
  },
});
