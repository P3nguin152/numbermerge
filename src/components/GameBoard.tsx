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
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AnimatedView = Animated.createAnimatedComponent(View);
import { useNavigation } from '@react-navigation/native';
import Grid from './Grid';
import TutorialOverlay from './TutorialOverlay';
import GameOverModal from './GameOverModal';
import { GameState } from '../types/game';
import {
  createEmptyGrid,
  generateNextValue,
  dropTile,
  isGameOver,
  canDropInColumn,
  GRID_COLS,
  GRID_ROWS,
  applyGravityToGrid,
} from '../utils/mergeLogic';
import { settleGridWithAnimation, countPotentialMerges } from '../utils/mergeAnimation';
import { updateStats, loadStats, updateFastestMergeTime, updateMaxChainReaction, updatePlayTime } from '../utils/statsStorage';
import { saveGameState, loadGameState, clearGameState } from '../utils/gameStorage';
import { soundManager } from '../utils/soundManager';

const generateDefaultUsername = (): string => {
  const randomNum = Math.floor(Math.random() * 90000) + 10000;
  return `user${randomNum}`;
};
import { loadSettings } from '../utils/settingsStorage';
import { incrementExitCount } from '../utils/exitStorage';
import { useUser } from '../contexts/UserContext';
import { AdBanner, useAds } from '../contexts/AdContext';
import { usePowerUps } from '../contexts/PowerUpsContext';
import PowerUpsBar from './PowerUpsBar';
import { leaderboardService } from '../services/leaderboardService';
import { hasCompletedTutorial } from '../utils/tutorialStorage';

import { Colors, TileColors as ThemeTileColors, Radius, Spacing } from '../theme/colors';

export const TILE_COLORS: Record<number, { bg: string; text: string }> = Object.fromEntries(
  Object.entries(ThemeTileColors || {}).map(([k, v]) => {
    if (v && typeof v === 'object' && 'bg' in v && 'text' in v) {
      return [k, { bg: v.bg, text: v.text }];
    }
    return [k, { bg: '#3c3a32', text: '#f9f6f2' }];
  })
);

function GameBoard() {
  const navigation = useNavigation();
  const { username } = useUser();
  const { showRewarded, showInterstitial } = useAds();
  const {
    handleUndo,
    saveStateForUndo,
    handleShuffle,
    handleRemoveTiles,
    handleDoublePoints,
    doublePointsActive,
    resetDoublePoints,
  } = usePowerUps();
  const [personalBest, setPersonalBest] = useState(0);
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
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [lastScoreForRankFetch, setLastScoreForRankFetch] = useState(0);
  const [lastMergeTime, setLastMergeTime] = useState<number | null>(null);
  const [isAnimatingMerges, setIsAnimatingMerges] = useState(false);
  const [scoreTapCount, setScoreTapCount] = useState(0);
  const gameStartTimeRef = useRef<number>(Date.now());

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
    loadGameState('classic').then(({ gameState: savedState, merges: savedMerges, bestTile: savedBestTile }) => {
      if (savedState && !savedState.gameOver) {
        setGameState(savedState);
        setMerges(savedMerges);
        setBestTile(savedBestTile);
      }
    });

    // Check if tutorial should be shown
    hasCompletedTutorial().then((completed: boolean) => {
      if (!completed) {
        setShowTutorial(true);
      }
    });

    return () => {
      soundManager.cleanup();
    };
  }, []);

  // Fetch user's global rank whenever username changes
  useEffect(() => {
    if (username) {
      leaderboardService.getPlayerRank(username).then(rank => {
        setGlobalRank(rank);
        setLastScoreForRankFetch(gameState.score);
      }).catch(err => {
        console.error('Failed to fetch rank:', err);
        setGlobalRank(null);
      });
    } else {
      setGlobalRank(null);
    }
  }, [username]);

  // Fetch rank when score increases significantly
  useEffect(() => {
    if (username && !gameState.gameOver) {
      const scoreDiff = gameState.score - lastScoreForRankFetch;
      if (scoreDiff >= 100) {
        leaderboardService.getPlayerRank(username).then(rank => {
          setGlobalRank(rank);
          setLastScoreForRankFetch(gameState.score);
        }).catch(err => {
          console.error('Failed to fetch rank:', err);
        });
      }
    }
  }, [username, gameState.score, gameState.gameOver]);

  // Track when user leaves screen via swipe gesture
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', async () => {
        // Save game state before leaving
        if (!gameState.gameOver) {
          await saveGameState(gameState, merges, bestTile, 'classic');
        }

        // Track exit and show ad every 5th time
        const exitCount = await incrementExitCount();
        if (exitCount % 5 === 0) {
          // Don't prevent default - let navigation happen
          // Show ad after navigation completes
          setTimeout(() => {
            showInterstitial();
          }, 100);
        }
      });

      return unsubscribe;
    }, [navigation, gameState, merges, bestTile, showInterstitial])
  );

  // Animation values
  const scoreScale = useSharedValue(1);
  const nextBlockScale = useSharedValue(1);
  const nextBlockRotate = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(0.8);
  const arrowScales = useRef(Array(GRID_COLS || 5).fill(0).map(() => useSharedValue(1))).current;
  const pauseButtonScale = useSharedValue(1);
  const newBestOpacity = useSharedValue(0);
  const newBestScale = useSharedValue(0.8);

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

  // Animate new best banner when it appears
  useEffect(() => {
    if (showNewBest) {
      newBestOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
      newBestScale.value = withSpring(1, { damping: 12, stiffness: 150 });
    } else {
      newBestOpacity.value = withSpring(0, { damping: 15, stiffness: 100 });
      newBestScale.value = withSpring(0.8, { damping: 12, stiffness: 150 });
    }
  }, [showNewBest]);

  useEffect(() => {
    if (!gameState.gameOver && !isPaused) {
      overlayOpacity.value = withTiming(0, { duration: 180 });
      overlayScale.value = withTiming(0.92, { duration: 180 });
      return;
    }

    overlayOpacity.value = withTiming(1, { duration: 220 });
    overlayScale.value = withSpring(1, { damping: 14, stiffness: 220 });
  }, [gameState.gameOver, isPaused, overlayOpacity, overlayScale]);

  useEffect(() => {
    if (!showNewBest) {
      return;
    }

    const timeout = setTimeout(() => {
      setShowNewBest(false);
    }, 2200);

    return () => clearTimeout(timeout);
  }, [showNewBest]);

  const handleColumnPress = useCallback(async (col: number) => {
    if (gameState.gameOver || isPaused || isAnimatingMerges) return;

    // Save current state for undo before making a move
    saveStateForUndo(gameState);

    // Animate arrow press
    arrowScales[col].value = withSequence(
      withTiming(0.7, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    if (!canDropInColumn(gameState.grid, col)) {
      // End game immediately when column is full
      setGameState(prev => ({ ...prev, gameOver: true }));
      // Save stats when game ends
      await updateStats(gameState.score, merges, bestTile);
      await updatePlayTime(Date.now() - gameStartTimeRef.current);
      soundManager.playSound('gameOver');
      AccessibilityInfo.announceForAccessibility(`Game over. Final score ${gameState.score}.`);

      // Submit score to leaderboard (use generated username if user hasn't registered)
      const leaderboardUsername = username || generateDefaultUsername();
      setIsSubmittingScore(true);
      leaderboardService.submitScore(
        leaderboardUsername,
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
      return;
    }

    const dropStartTime = Date.now();

    // Check for potential merges to decide if we should animate
    const potentialMerges = countPotentialMerges(gameState.grid, col, gameState.nextTile);

    if (potentialMerges > 1) {
      // Use animated merge for chain reactions
      setIsAnimatingMerges(true);
      soundManager.playSound('drop');

      // Place the initial tile
      const initialGrid = gameState.grid.map(row => [...row]);
      if (initialGrid[0]) {
        initialGrid[0][col] = {
          id: Math.random().toString(36).slice(2, 11),
          value: gameState.nextTile,
          row: 0,
          col,
          isFalling: true,
          fromRow: -1,
          fromCol: col,
          isMerged: false,
        };
      }

      // Apply initial gravity
      applyGravityToGrid(initialGrid);
      setGameState(prev => ({ ...prev, grid: initialGrid }));

      // Run animated settlement
      const result = await settleGridWithAnimation(
        initialGrid,
        col,
        (step) => {
          setGameState(prev => ({ ...prev, grid: step.grid }));
        },
        200 // 200ms delay between passes
      );

      setIsAnimatingMerges(false);

      const newGrid = result.grid;
      const moveScore = result.score + gameState.nextTile; // Add base drop score
      const _totalMergeCount = result.totalMergeCount;
      const gameOver = isGameOver(newGrid);

      // Track merges and best tile
      let mergeCount = 0;
      let maxTile = bestTile;
      let maxMergeValue = 0;

      for (let row = 0; row < GRID_ROWS; row++) {
        for (let c = 0; c < GRID_COLS; c++) {
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

      // Track merge timing for Speed Demon achievement
      if (mergeCount > 0 && lastMergeTime !== null) {
        const mergeTime = Date.now() - dropStartTime;
        updateFastestMergeTime(mergeTime);
      }
      setLastMergeTime(Date.now());

      // Track chain reaction for Chain Reaction achievement
      if (_totalMergeCount > 0) {
        updateMaxChainReaction(_totalMergeCount);
      }

      const totalScore = gameState.score + moveScore * (doublePointsActive ? 2 : 1);
      const beatPersonalBest = totalScore > personalBest;

      // Play merge sound after animation completes
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
        clearGameState('classic');

        // Save stats when game ends
        await updateStats(totalScore, totalMerges, maxTile);
        await updatePlayTime(Date.now() - gameStartTimeRef.current);
        soundManager.playSound('gameOver');
        AccessibilityInfo.announceForAccessibility(`Game over. Final score ${totalScore}.`);

        // Show new best banner if personal best was beaten
        if (beatPersonalBest && !showNewBest) {
          setDidBeatPersonalBest(true);
          setShowNewBest(true);
        }

        // Submit score to leaderboard (use generated username if user hasn't registered)
        const leaderboardUsername = username || generateDefaultUsername();
        setIsSubmittingScore(true);
        leaderboardService.submitScore(
          leaderboardUsername,
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

      setGameState({
        grid: newGrid,
        score: totalScore,
        gameOver: gameOver,
        nextTile: gameOver ? gameState.nextTile : generateNextValue(),
        lastMergeValue: maxMergeValue || undefined,
      });
    } else {
      // Use instant merge for simple cases
      const { grid: newGrid, score: moveScore, tripleMergeCount: _tripleMergeCount, totalMergeCount: _totalMergeCount } = dropTile(
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
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let c = 0; c < GRID_COLS; c++) {
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

      // Track merge timing for Speed Demon achievement
      if (mergeCount > 0 && lastMergeTime !== null) {
        const mergeTime = Date.now() - dropStartTime;
        updateFastestMergeTime(mergeTime);
      }
      setLastMergeTime(Date.now());

      // Track chain reaction for Chain Reaction achievement
      if (_totalMergeCount > 0) {
        updateMaxChainReaction(_totalMergeCount);
      }

      const totalScore = gameState.score + moveScore * (doublePointsActive ? 2 : 1);
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
        clearGameState('classic');

        // Save stats when game ends
        await updateStats(totalScore, totalMerges, maxTile);
        await updatePlayTime(Date.now() - gameStartTimeRef.current);
        soundManager.playSound('gameOver');
        AccessibilityInfo.announceForAccessibility(`Game over. Final score ${totalScore}.`);

        // Show new best banner if personal best was beaten
        if (beatPersonalBest && !showNewBest) {
          setDidBeatPersonalBest(true);
          setShowNewBest(true);
        }

        // Submit score to leaderboard (use generated username if user hasn't registered)
        const leaderboardUsername = username || generateDefaultUsername();
        setIsSubmittingScore(true);
        leaderboardService.submitScore(
          leaderboardUsername,
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

      setGameState({
        grid: newGrid,
        score: totalScore,
        gameOver: gameOver,
        nextTile: gameOver ? gameState.nextTile : generateNextValue(),
        lastMergeValue: maxMergeValue || undefined,
      });
    }
  }, [gameState.gameOver, isPaused, gameState.grid, gameState.nextTile, gameState.score, merges, bestTile, totalGamesPlayed, username, arrowScales, personalBest, isAnimatingMerges, doublePointsActive, showNewBest, lastMergeTime]);

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
    clearGameState('classic');
    setGameState({
      grid: createEmptyGrid(),
      score: 0,
      gameOver: false,
      nextTile: generateNextValue(),
    });
    setMerges(0);
    setBestTile(2);
    setDidBeatPersonalBest(false);
    setShowNewBest(false);
    setLastMergeTime(null);
    gameStartTimeRef.current = Date.now();
    resetDoublePoints();
  }, [gameState.gameOver, showInterstitial, playAgainCount, resetDoublePoints]);

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
    navigation.goBack();
  }, [navigation]);

  const handleUndoPress = useCallback(async () => {
    const previousState = await handleUndo();
    if (previousState !== null && previousState !== undefined) {
      setGameState(previousState);
    }
  }, [handleUndo]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleScorePress = useCallback(() => {
    setScoreTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        // Dev feature: Set score to 100,092 and populate grid with high tiles
        const newGrid = createEmptyGrid();
        
        // High tiles to place (5 fairly high ones + others)
        const highTiles = [8192, 4096, 2048, 2048, 1024, 512, 512, 256, 128, 128, 64, 64, 32, 32, 16];
        
        // Place tiles randomly in the grid
        let tileIndex = 0;
        const positions = [];
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            positions.push({ row: r, col: c });
          }
        }
        
        // Shuffle positions
        for (let i = positions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // Place high tiles
        for (let i = 0; i < highTiles.length && i < positions.length; i++) {
          const pos = positions[i];
          if (newGrid[pos.row]) {
            newGrid[pos.row][pos.col] = {
              id: Math.random().toString(36).slice(2, 11),
              value: highTiles[i],
              row: pos.row,
              col: pos.col,
              isFalling: false,
              fromRow: pos.row,
              fromCol: pos.col,
              isMerged: false,
            };
          }
        }
        
        setGameState(prev => ({ ...prev, score: 100092, grid: newGrid }));
        setPersonalBest(100092);
        setBestTile(8192);
        soundManager.playSound('merge');
        return 0;
      }
      // Reset after 1 second if not triple-tapped
      setTimeout(() => setScoreTapCount(0), 1000);
      return newCount;
    });
  }, []);

  const handleWatchAdToContinue = useCallback(async () => {
    setIsWatchingAd(true);
    await showRewarded();
    setIsWatchingAd(false);

    // Proceed regardless of reward detection (test ads may not trigger rewards)
    // Clear one row to allow player to continue
    const newGrid = gameState.grid.map(row => [...row]);
    // Find the row with the fewest tiles and clear it
    let rowTileCounts = Array(GRID_ROWS).fill(0);
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (newGrid[row][col]) {
          rowTileCounts[row]++;
        }
      }
    }
    const rowToClear = rowTileCounts.indexOf(Math.min(...rowTileCounts));
    for (let col = 0; col < GRID_COLS; col++) {
      newGrid[rowToClear][col] = null;
    }

    setGameState({
      grid: newGrid,
      score: gameState.score,
      gameOver: false,
      nextTile: generateNextValue(),
    });
    soundManager.playSound('resume');
  }, [gameState, showRewarded]);

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

  const newBestAnimatedStyle = useAnimatedStyle(() => ({
    opacity: newBestOpacity.value,
    transform: [{ scale: newBestScale.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }), []);

  const overlayCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: overlayScale.value }] as any,
  }), []);

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
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={handleScorePress} activeOpacity={0.7}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Animated.Text style={[styles.statValue, scoreAnimatedStyle]}>{gameState.score.toLocaleString()}</Animated.Text>
          </TouchableOpacity>
          {globalRank !== null && (
            <View style={styles.statDivider} />
          )}
          {globalRank !== null && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>RANK</Text>
              <Text style={[styles.statValue, styles.rankValue]}>#{globalRank}</Text>
            </View>
          )}
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
        <AnimatedView style={[styles.newBestBanner, newBestAnimatedStyle]} accessibilityLiveRegion="polite">
          <Text style={styles.newBestText}>New Best! {gameState.score.toLocaleString()}</Text>
        </AnimatedView>
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
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel={`Drop tile in column ${i + 1}`}
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

      <PowerUpsBar
        isPaused={isPaused}
        isGameOver={gameState.gameOver}
        onUndo={handleUndoPress}
        onShuffle={() => handleShuffle(gameState.grid, setGameState)}
        onRemoveTiles={() => handleRemoveTiles(gameState.grid, setGameState)}
        onDoublePoints={handleDoublePoints}
      />

      {/* Banner Ad */}
      {!gameState.gameOver && !isPaused && <AdBanner />}

      {/* Game Over Modal */}
      <GameOverModal
        visible={gameState.gameOver}
        score={gameState.score}
        didBeatPersonalBest={didBeatPersonalBest}
        isSubmittingScore={isSubmittingScore}
        isWatchingAd={isWatchingAd}
        onPlayAgain={initializeGame}
        onWatchAdToContinue={handleWatchAdToContinue}
        onQuit={handleQuit}
      />

      {/* Pause Menu Overlay */}
      {isPaused && (
        <Animated.View style={[styles.overlay, overlayAnimatedStyle]} accessibilityViewIsModal>
          <Animated.View style={[styles.overlayCard, overlayCardAnimatedStyle]}>
            <Ionicons name="pause-circle" size={64} color={Colors.primary} />
            <Text style={styles.overlayTitle}>Paused</Text>
            <TouchableOpacity
              style={styles.overlayBtn}
              onPress={handleResume}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Resume game"
            >
              <Ionicons name="play" size={20} color={Colors.surface} />
              <Text style={styles.overlayBtnText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.overlayBtnSecondary}
              onPress={handleRestart}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Restart game"
            >
              <Ionicons name="refresh" size={20} color={Colors.textPrimary} />
              <Text style={styles.overlayBtnSecondaryText}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.overlayBtnSecondary, { borderColor: Colors.danger }]}
              onPress={handleQuit}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Quit game"
            >
              <Ionicons name="close" size={20} color={Colors.danger} />
              <Text style={[styles.overlayBtnSecondaryText, { color: Colors.danger }]}>Quit</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {/* Tutorial Overlay */}
      <TutorialOverlay
        visible={showTutorial && !isPaused && !gameState.gameOver}
        onClose={() => setShowTutorial(false)}
      />
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
    paddingTop: 56,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    backgroundColor: 'transparent',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: Colors.textSecondary,
    fontSize: 24,
    fontWeight: '300',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    gap: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.divider,
  },
  pauseBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  rankValue: {
    color: Colors.primary,
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
  overlayBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  overlayBtnSecondaryText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
