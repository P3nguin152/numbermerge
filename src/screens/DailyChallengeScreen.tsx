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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Grid from '../components/Grid';
import { GameState } from '../types/game';
import { DailyChallenge } from '../types/dailyChallenge';
import {
  createEmptyGrid,
  generateNextValue,
  dropTile,
  isGameOver,
  canDropInColumn,
  isGridEmpty,
  GRID_COLS,
  GRID_ROWS,
} from '../utils/mergeLogic';
import { soundManager } from '../utils/soundManager';
import { loadSettings } from '../utils/settingsStorage';
import { useUser } from '../contexts/UserContext';
import { AdBanner, useAds } from '../contexts/AdContext';
import { dailyChallengeService } from '../services/dailyChallengeService';
import { saveChallengeProgress, loadChallengeProgress, clearChallengeProgress } from '../utils/dailyChallengeStorage';
import {
  updateLastPlayedDate,
  hasPlayedToday,
  getStreakCount,
  setStreakCount,
  getLastPlayedDate,
} from '../utils/notificationStorage';

import { Colors, TileColors as ThemeTileColors, Radius, Spacing } from '../theme/colors';

const MAX_MOVES = 25;
const MAX_MOVES_CAP = 40;

export const TILE_COLORS: Record<number, { bg: string; text: string }> = Object.fromEntries(
  Object.entries(ThemeTileColors || {}).map(([k, v]) => {
    if (v && typeof v === 'object' && 'bg' in v && 'text' in v) {
      return [k, { bg: v.bg, text: v.text }];
    }
    return [k, { bg: '#3c3a32', text: '#f9f6f2' }];
  })
);

function DailyChallengeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { username } = useUser();
  const { showRewarded, showInterstitial } = useAds();
  const challenge = (route.params as any)?.challenge as DailyChallenge;
  
  const [personalBest, setPersonalBest] = useState(0);
  const [movesRemaining, setMovesRemaining] = useState(MAX_MOVES);
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: createEmptyGrid(),
    score: 0,
    gameOver: false,
    nextTile: generateNextValue(),
  }));
  const [merges, setMerges] = useState(0);
  const [bestTile, setBestTile] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [showNewBest, setShowNewBest] = useState(false);
  const [didBeatPersonalBest, setDidBeatPersonalBest] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [moveBonus, setMoveBonus] = useState<{ value: number; x: number; y: number } | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(99);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [completedScore, setCompletedScore] = useState(0);
  const [completedBestTile, setCompletedBestTile] = useState(2);
  const [consecutiveMerges, setConsecutiveMerges] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(challenge?.type === 'speed_run' ? challenge.timeLimit || 0 : 0);
  const [tilesRemaining, setTilesRemaining] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize sound manager and settings
  useEffect(() => {
    soundManager.initialize();
    soundManager.loadSounds();

    loadSettings().then(settings => {
      soundManager.setSoundEnabled(settings.soundEnabled);
      soundManager.setVibrationEnabled(settings.vibrationEnabled);
      soundManager.setMusicEnabled(settings.musicEnabled);
    });

    // Load saved game state if exists
    loadChallengeProgress().then(savedChallenge => {
      if (savedChallenge && savedChallenge.date === challenge?.date) {
        setGameState({
          grid: createEmptyGrid(),
          score: 0,
          gameOver: false,
          nextTile: generateNextValue(),
        });
        setAttemptsRemaining(savedChallenge.attemptsRemaining);
        setChallengeCompleted(savedChallenge.completed);
      }
    });

    // Load user status
    if (username) {
      dailyChallengeService.getUserChallengeStatus(username).then(status => {
        if (status) {
          setAttemptsRemaining(Math.max(0, 99 - status.attemptsUsed));
          setChallengeCompleted(status.completed);
          // Reset game state to ensure fresh start when navigating from homescreen
          setMovesRemaining(MAX_MOVES);
          setGameState({
            grid: createEmptyGrid(),
            score: 0,
            gameOver: false,
            nextTile: generateNextValue(),
          });
          setMerges(0);
          setBestTile(2);
          setConsecutiveMerges(0);
          setTilesRemaining(0);
          setGameStarted(false);
          // Reset timeRemaining for speed run challenges
          if (challenge.type === 'speed_run' && challenge.timeLimit) {
            setTimeRemaining(challenge.timeLimit);
          }
          // If challenge is already completed, show completion overlay with stats
          if (status.completed) {
            setAlreadyCompleted(true);
            setCompletedScore(status.bestScore);
            setCompletedBestTile(status.bestTile);
            setGameState(prev => ({ ...prev, gameOver: true }));
            setShowNewBest(true);
          } else {
            // Initialize challenge-specific state
            if (challenge.type === 'speed_run' && challenge.timeLimit) {
              setTimeRemaining(challenge.timeLimit);
            }
          }
        }
      });
    }

    return () => {
      soundManager.cleanup();
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [challenge, username]);

  // Timer effect for speed run challenges
  useEffect(() => {
    // Clear any existing timer first
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    // Only start timer when game has started (user made first move)
    if (gameStarted && challenge.type === 'speed_run' && challenge.timeLimit && !gameState.gameOver && !isPaused && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameState(prev => ({ ...prev, gameOver: true }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [challenge.type, challenge.timeLimit, gameState.gameOver, isPaused, timeRemaining, gameStarted]);

  // Initialize timeRemaining when challenge changes
  useEffect(() => {
    if (challenge?.type === 'speed_run' && challenge.timeLimit) {
      setTimeRemaining(challenge.timeLimit);
    }
  }, [challenge]);

  // Animation values
  const scoreScale = useSharedValue(1);
  const nextBlockScale = useSharedValue(1);
  const nextBlockRotate = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(0.8);
  const arrowScales = useRef(Array(GRID_COLS || 5).fill(0).map(() => useSharedValue(1))).current;
  const pauseButtonScale = useSharedValue(1);
  const movesScale = useSharedValue(1);
  const bonusOpacity = useSharedValue(0);
  const bonusTranslateY = useSharedValue(0);

  // Animate score when it changes
  useEffect(() => {
    scoreScale.value = withSequence(
      withTiming(1.3, { duration: 100, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 8, stiffness: 300 })
    );
  }, [gameState.score]);

  // Animate moves when it changes
  useEffect(() => {
    movesScale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
  }, [movesRemaining]);

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

  // Animate move bonus
  useEffect(() => {
    if (moveBonus) {
      bonusOpacity.value = withTiming(1, { duration: 100 });
      bonusTranslateY.value = withSequence(
        withTiming(-50, { duration: 600, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 100 })
      );
      const timeout = setTimeout(() => {
        setMoveBonus(null);
        bonusOpacity.value = withTiming(0, { duration: 200 });
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [moveBonus, bonusOpacity, bonusTranslateY]);

  const handleColumnPress = useCallback((col: number) => {
    if (gameState.gameOver || isPaused || movesRemaining <= 0 || attemptsRemaining <= 0) return;

    // Start the game (and timer for speed run) on first move
    if (!gameStarted) {
      console.log('Starting game, timeRemaining:', timeRemaining, 'challenge:', challenge);
      setGameStarted(true);
    }

    // Animate arrow press
    arrowScales[col].value = withSequence(
      withTiming(0.7, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    if (!canDropInColumn(gameState.grid, col)) {
      // End game immediately when column is full
      setGameState(prev => ({ ...prev, gameOver: true }));
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

    // Calculate move bonus: +1 per 2-tile merge, +3 per triple merge
    const regularMerges = mergeCount - tripleMergeCount;
    const moveBonusValue = regularMerges * 1 + tripleMergeCount * 3;
    if (moveBonusValue > 0) {
      setMovesRemaining(prev => Math.min(prev + moveBonusValue, MAX_MOVES_CAP));
      setMoveBonus({ value: moveBonusValue, x: 0, y: 0 });
    }

    const totalScore = gameState.score + moveScore;
    const beatPersonalBest = totalScore > personalBest;

    // Play sound effects
    soundManager.playSound('drop');
    if (mergeCount > 0) {
      soundManager.playSound('merge');
    }

    setMerges(prev => prev + mergeCount);
    setBestTile(maxTile);
    
    // Track consecutive merges for combo challenge
    if (challenge.type === 'combo') {
      if (mergeCount > 0) {
        setConsecutiveMerges(prev => prev + 1);
      } else {
        setConsecutiveMerges(0);
      }
    }
    
    // Track tiles remaining for clear board challenge
    if (challenge.type === 'clear_board') {
      let tileCount = 0;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (newGrid[row][c] !== null) tileCount++;
        }
      }
      setTilesRemaining(tileCount);
    }
    
    // Only decrement moves if not speed run (speed run uses timer)
    if (challenge.mode !== 'timeAttack') {
      setMovesRemaining(prev => prev - 1);
    }
    
    if (beatPersonalBest) {
      setPersonalBest(totalScore);
    }

    // Check if challenge is completed
    let completed = false;
    if (challenge.type === 'target_score' && totalScore >= challenge.targetValue) {
      completed = true;
    } else if (challenge.type === 'tile_mastery' && maxTile >= challenge.targetValue) {
      completed = true;
    } else if (challenge.type === 'combo' && consecutiveMerges >= (challenge.comboTarget || 3)) {
      completed = true;
    } else if (challenge.type === 'clear_board' && tilesRemaining === 0) {
      completed = true;
    } else if (challenge.type === 'speed_run' && totalScore >= challenge.targetValue) {
      completed = true;
    }

    // Game over conditions
    const isTimeAttackGameOver = gameStarted && challenge.type === 'speed_run' && timeRemaining <= 0;
    const isLimitedMovesGameOver = challenge.mode === 'limitedMoves' && movesRemaining <= 1;
    
    if (gameOver || isLimitedMovesGameOver || isTimeAttackGameOver || completed) {
      // Reset game started flag
      setGameStarted(false);
      // Decrement attempts when game ends
      setAttemptsRemaining(prev => prev - 1);
      
      // Submit score to daily challenge service
      if (username) {
        setIsSubmittingScore(true);
        dailyChallengeService.submitChallengeAttempt(
          username,
          challenge,
          totalScore,
          maxTile,
          completed
        ).then(result => {
          if (result.success) {
            setChallengeCompleted(completed);
            
            // Update streak if challenge was completed
            if (completed) {
              updateStreak();
            }
          }
        }).catch(err => {
          console.error('Failed to submit challenge attempt:', err);
        }).finally(() => {
          setIsSubmittingScore(false);
        });
      }

      setGameState({
        grid: newGrid,
        score: totalScore,
        gameOver: true,
        nextTile: gameState.nextTile,
        lastMergeValue: maxMergeValue || undefined,
      });

      if (completed) {
        soundManager.playSound('merge');
        setShowNewBest(true);
      } else {
        soundManager.playSound('gameOver');
      }
    } else {
      setGameState({
        grid: newGrid,
        score: totalScore,
        gameOver: gameOver,
        nextTile: generateNextValue(),
        lastMergeValue: maxMergeValue || undefined,
      });
    }
  }, [gameState.gameOver, isPaused, gameState.grid, gameState.nextTile, gameState.score, merges, bestTile, arrowScales, personalBest, challenge, username, movesRemaining, attemptsRemaining]);

  const initializeGame = useCallback(async () => {
    if (attemptsRemaining <= 0) {
      navigation.goBack();
      return;
    }
    
    setGameState({
      grid: createEmptyGrid(),
      score: 0,
      gameOver: false,
      nextTile: generateNextValue(),
    });
    setMerges(0);
    setBestTile(2);
    setMovesRemaining(MAX_MOVES);
    setConsecutiveMerges(0);
    setTilesRemaining(0);
    setGameStarted(false);
    if (challenge.type === 'speed_run' && challenge.timeLimit) {
      setTimeRemaining(challenge.timeLimit);
    }
    setDidBeatPersonalBest(false);
    setShowNewBest(false);
  }, [attemptsRemaining, navigation, challenge]);

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

  const updateStreak = useCallback(async () => {
    try {
      await updateLastPlayedDate();
      
      const playedToday = await hasPlayedToday();
      if (playedToday) {
        return; // Already updated streak today
      }
      
      const lastPlayed = await getLastPlayedDate();
      const streak = await getStreakCount();
      
      if (!lastPlayed) {
        // First time playing
        await setStreakCount(1);
      } else {
        const lastPlayedDate = new Date(lastPlayed);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPlayedDate.toDateString() === yesterday.toDateString()) {
          // Played yesterday, increment streak
          await setStreakCount(streak + 1);
        } else if (lastPlayedDate.toDateString() !== today.toDateString()) {
          // Streak broken, reset to 1
          await setStreakCount(1);
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, []);

  const handleWatchAdToContinue = useCallback(async () => {
    setIsWatchingAd(true);
    const { rewarded } = await showRewarded();
    setIsWatchingAd(false);

    // Add 5 moves to continue playing
    setMovesRemaining(prev => prev + 5);
    setAttemptsRemaining(prev => prev + 1);
    
    // Check if grid can continue before resetting game over
    const canContinue = gameState.grid.some(row => 
      row.some(tile => tile === null || tile === undefined)
    );
    
    if (canContinue) {
      setGameState(prev => ({ ...prev, gameOver: false }));
      soundManager.playSound('resume');
    } else {
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

  const movesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: movesScale.value }] as any,
  }), []);

  const bonusAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bonusOpacity.value,
    transform: [{ translateY: bonusTranslateY.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }), []);

  const overlayCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: overlayScale.value }] as any,
  }), []);

  const isMovesRunningLow = movesRemaining <= 5;
  const isTargetScoreChallenge = challenge.type === 'target_score';
  const isTileMasteryChallenge = challenge.type === 'tile_mastery';
  const isComboChallenge = challenge.type === 'combo';
  const isClearBoardChallenge = challenge.type === 'clear_board';
  const isSpeedRunChallenge = challenge.type === 'speed_run';
  
  let targetProgress = 0;
  let progressLabel = '';
  let progressValue = 0;
  
  if (isTargetScoreChallenge || isSpeedRunChallenge) {
    targetProgress = Math.min(100, (gameState.score / challenge.targetValue) * 100);
    progressLabel = 'SCORE';
    progressValue = gameState.score;
  } else if (isTileMasteryChallenge) {
    targetProgress = Math.min(100, (bestTile / challenge.targetValue) * 100);
    progressLabel = 'TILE';
    progressValue = bestTile;
  } else if (isComboChallenge) {
    targetProgress = Math.min(100, (consecutiveMerges / (challenge.comboTarget || 3)) * 100);
    progressLabel = 'STREAK';
    progressValue = consecutiveMerges;
  } else if (isClearBoardChallenge) {
    const totalTiles = GRID_ROWS * GRID_COLS;
    targetProgress = Math.min(100, ((totalTiles - tilesRemaining) / totalTiles) * 100);
    progressLabel = 'CLEARED';
    progressValue = totalTiles - tilesRemaining;
  }

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
          <View style={styles.scoreChip}>
            <Text style={styles.scoreLabel}>
              {progressLabel}
            </Text>
            <Animated.Text style={[styles.scoreValue, scoreAnimatedStyle]}>
              {progressValue}
            </Animated.Text>
          </View>
          <View style={styles.targetChip}>
            <Text style={styles.targetLabel}>TARGET</Text>
            <Text style={styles.targetValue}>
              {isComboChallenge ? `${challenge.comboTarget || 3} in a row` : 
               isClearBoardChallenge ? 'CLEAR ALL' :
               isSpeedRunChallenge ? `${challenge.timeLimit}s` :
               challenge.targetValue}
            </Text>
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

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${targetProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {isComboChallenge ? `${consecutiveMerges}/${challenge.comboTarget || 3}` :
           isClearBoardChallenge ? `${tilesRemaining} left` :
           isSpeedRunChallenge ? `${timeRemaining}s` :
           `${Math.round(targetProgress)}%`}
        </Text>
      </View>

      {/* Next Block Strip */}
      <View style={styles.nextStrip}>
        <Text style={styles.nextLabel}>NEXT</Text>
        <Animated.View style={[styles.nextPreview, { backgroundColor: nextColor }, nextBlockAnimatedStyle]}>
          <Text style={styles.nextNumber}>{gameState.nextTile}</Text>
        </Animated.View>
        <View style={styles.attemptsChip}>
          <Text style={styles.attemptsLabel}>ATTEMPTS</Text>
          <Text style={styles.attemptsValue}>{attemptsRemaining}/99</Text>
        </View>
      </View>

      {showNewBest && (
        <View style={styles.newBestBanner}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text style={styles.newBestText}> Challenge Complete!</Text>
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
              style={[styles.arrowButton, movesRemaining <= 0 && styles.arrowButtonDisabled]}
              onPress={() => handleColumnPress(i)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Drop tile in column ${i + 1}`}
              disabled={movesRemaining <= 0 || attemptsRemaining <= 0}
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
            <Ionicons 
              name={alreadyCompleted ? 'checkmark-circle' : challengeCompleted ? 'trophy' : 'skull'} 
              size={48} 
              color={alreadyCompleted ? Colors.success : challengeCompleted ? Colors.gold : Colors.danger} 
            />
            <Text style={styles.overlayTitle}>
              {alreadyCompleted ? 'Already Completed Today' : 
               challengeCompleted ? 'Challenge Complete!' : 
               isSpeedRunChallenge ? 'Time\'s Up!' : 'Out of Moves!'}
            </Text>
            <View style={styles.overlayScoreRow}>
              <Text style={styles.overlayScoreLabel}>
                {isTargetScoreChallenge || isSpeedRunChallenge ? 'Final Score' :
                 isTileMasteryChallenge ? 'Best Tile' :
                 isComboChallenge ? 'Best Streak' :
                 'Tiles Cleared'}
              </Text>
              <Text style={styles.overlayScoreValue}>
                {isTargetScoreChallenge || isSpeedRunChallenge ? (alreadyCompleted ? completedScore : gameState.score).toLocaleString() :
                 isTileMasteryChallenge ? (alreadyCompleted ? completedBestTile : bestTile) :
                 isComboChallenge ? (alreadyCompleted ? completedBestTile : consecutiveMerges) :
                 (alreadyCompleted ? completedBestTile : (GRID_ROWS * GRID_COLS - tilesRemaining))}
              </Text>
            </View>
            {isSubmittingScore && (
              <View style={styles.submittingRow}>
                <ActivityIndicator color={Colors.primaryLight} size="small" />
                <Text style={styles.submittingText}>Submitting score...</Text>
              </View>
            )}
            {attemptsRemaining > 0 && !challengeCompleted && (
              <TouchableOpacity
                style={[styles.overlayBtn, isSubmittingScore && styles.overlayBtnDisabled]}
                onPress={initializeGame}
                activeOpacity={0.85}
                disabled={isSubmittingScore}
              >
                <Text style={styles.overlayBtnText}>
                  {isSubmittingScore ? 'SUBMITTING...' : `TRY AGAIN (${attemptsRemaining} LEFT)`}
                </Text>
              </TouchableOpacity>
            )}
            {!challengeCompleted && (
              <TouchableOpacity
                style={[styles.overlayBtnRewarded, isWatchingAd && styles.overlayBtnDisabled]}
                onPress={handleWatchAdToContinue}
                activeOpacity={0.85}
                disabled={isWatchingAd}
              >
                <Text style={styles.overlayBtnRewardedText}>
                  {isWatchingAd ? 'LOADING...' : 'WATCH AD FOR EXTRA ATTEMPT'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.overlayBtnSecondary}
              onPress={handleQuit}
              activeOpacity={0.7}
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
            >
              <Text style={styles.overlayBtnText}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.overlayBtnSecondary}
              onPress={handleRestart}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={styles.overlayBtnSecondaryText}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.overlayBtnSecondary, { borderColor: Colors.danger }]}
              onPress={handleQuit}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={16} color={Colors.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.overlayBtnSecondaryText, { color: Colors.danger }]}>Quit</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

export default React.memo(DailyChallengeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
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
  targetChip: {
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingVertical: 8,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    minWidth: 70,
  },
  targetLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  targetValue: {
    color: Colors.gold,
    fontSize: 20,
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  progressText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '800',
    minWidth: 40,
    textAlign: 'right',
  },
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
  attemptsChip: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  attemptsLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  attemptsValue: {
    color: Colors.primary,
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
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
