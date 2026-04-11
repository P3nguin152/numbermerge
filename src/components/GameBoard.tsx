import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
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
import { updateStats } from '../utils/statsStorage';

export const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2:    { bg: '#FF69B4', text: '#fff' },
  4:    { bg: '#32CD32', text: '#fff' },
  8:    { bg: '#00CED1', text: '#fff' },
  16:   { bg: '#4169E1', text: '#fff' },
  32:   { bg: '#E8624A', text: '#fff' },
  64:   { bg: '#9B59B6', text: '#fff' },
  128:  { bg: '#D8BFD8', text: '#fff' },
  256:  { bg: '#E74C3C', text: '#fff' },
  512:  { bg: '#F39C12', text: '#fff' },
  1024: { bg: '#1ABC9C', text: '#fff' },
  2048: { bg: '#E91E63', text: '#fff' },
};

export default function GameBoard() {
  const navigation = useNavigation();
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: createEmptyGrid(),
    score: 0,
    gameOver: false,
    nextTile: generateNextValue(),
  }));
  const [merges, setMerges] = useState(0);
  const [bestTile, setBestTile] = useState(2);

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

  const handleColumnPress = (col: number) => {
    if (gameState.gameOver) return;

    // Animate arrow press
    arrowScales[col].value = withSequence(
      withTiming(0.7, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    if (!canDropInColumn(gameState.grid, col)) {
      // Check if game is over when column is full
      if (isGameOver(gameState.grid)) {
        setGameState(prev => ({ ...prev, gameOver: true }));
        // Trigger overlay animation
        overlayOpacity.value = withTiming(1, { duration: 300 });
        overlayScale.value = withSpring(1, { damping: 15, stiffness: 200 });
        // Save stats when game ends
        updateStats(gameState.score, merges, bestTile);
      }
      return;
    }

    const { grid: newGrid, score: moveScore } = dropTile(gameState.grid, gameState.nextTile, col);
    const gameOver = isGameOver(newGrid);
    
    // Track merges and best tile
    let mergeCount = 0;
    let maxTile = bestTile;
    
    // Count merges and find best tile in the new grid
    for (let row = 0; row < 6; row++) {
      for (let c = 0; c < 6; c++) {
        const tile = newGrid[row][c];
        if (tile) {
          if (tile.isMerged) mergeCount++;
          if (tile.value > maxTile) maxTile = tile.value;
        }
      }
    }
    
    setMerges(prev => prev + mergeCount);
    setBestTile(maxTile);
    
    if (gameOver) {
      // Trigger overlay animation
      overlayOpacity.value = withTiming(1, { duration: 300 });
      overlayScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      // Save stats when game ends
      updateStats(gameState.score + moveScore, merges + mergeCount, maxTile);
    }
    
    setGameState({
      grid: newGrid,
      score: gameState.score + moveScore,
      gameOver: gameOver,
      nextTile: gameOver ? gameState.nextTile : generateNextValue(),
    });
  };

  const initializeGame = () => {
    // Reset overlay animation
    overlayOpacity.value = withTiming(0, { duration: 200 });
    overlayScale.value = withTiming(0.8, { duration: 200 });
    
    setGameState({
      grid: createEmptyGrid(),
      score: 0,
      gameOver: false,
      nextTile: generateNextValue(),
    });
    setMerges(0);
    setBestTile(2);
  };

  const handlePausePress = () => {
    pauseButtonScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
  };

  const nextColor = TILE_COLORS[gameState.nextTile]?.bg ?? '#FF69B4';

  // Animated styles
  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }] as any,
  }), []);

  const nextBlockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextBlockScale.value }] as any,
  }), []);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    transform: [{ scale: overlayScale.value }] as any,
  }), []);

  const pauseButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pauseButtonScale.value }] as any,
  }), []);

  return (
    <View style={styles.container}>
      {/* Top Stats Row */}
      <View style={styles.topStatsRow}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Rank */}
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statValue}>-</Text>
        </View>

        {/* Score */}
        <View style={styles.scoreBox}>
          <Text style={styles.crownIcon}>👑</Text>
          <Animated.Text style={[styles.scoreValue, scoreAnimatedStyle]}>{gameState.score}</Animated.Text>
        </View>

        {/* Record/Coins */}
        <View style={styles.recordBox}>
          <TouchableOpacity style={styles.recordButton}>
            <Text style={styles.recordButtonText}>Record</Text>
          </TouchableOpacity>
          <View style={styles.coinsRow}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinAmount}>500</Text>
            <TouchableOpacity style={styles.addCoinButton}>
              <Text style={styles.addCoinText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Next Block */}
      <View style={styles.nextBlockRow}>
        <Text style={styles.nextBlockLabel}>Next Block</Text>
        <Text style={styles.nextBlockArrow}>▶</Text>
        <Animated.View style={[styles.nextBlockPreview, { backgroundColor: nextColor }, nextBlockAnimatedStyle]}>
          <Text style={styles.nextBlockNumber}>{gameState.nextTile}</Text>
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

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Pause Button */}
        <TouchableOpacity 
          style={styles.pauseButton}
          onPress={handlePausePress}
          activeOpacity={0.8}
        >
          <Animated.Text style={[styles.pauseIcon, pauseButtonAnimatedStyle]}>⏸</Animated.Text>
        </TouchableOpacity>
      </View>

      {/* Game Over Overlay */}
      {gameState.gameOver && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayTitle}>Game Over!</Text>
            <Text style={styles.overlayScore}>Score: {gameState.score}</Text>
            <TouchableOpacity
              style={styles.playAgainButton}
              onPress={initializeGame}
              activeOpacity={0.8}
            >
              <Text style={styles.playAgainButtonText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2C2C',
  },
  topStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4A4A4A',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  scoreBox: {
    alignItems: 'center',
    flex: 1,
  },
  crownIcon: {
    fontSize: 24,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  recordBox: {
    alignItems: 'center',
    flex: 1.5,
  },
  recordButton: {
    backgroundColor: '#4A4A4A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 4,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinIcon: {
    fontSize: 16,
  },
  coinAmount: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addCoinButton: {
    backgroundColor: '#4A4A4A',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCoinText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextBlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  nextBlockLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  nextBlockArrow: {
    color: '#666',
    fontSize: 16,
  },
  nextBlockPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  nextBlockNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  arrowRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  arrowButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  arrowText: {
    color: '#666',
    fontSize: 18,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  pauseButton: {
    width: 50,
    height: 50,
    backgroundColor: '#8B7355',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: {
    color: '#fff',
    fontSize: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overlayScore: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  playAgainButton: {
    width: '100%',
    backgroundColor: '#E8624A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
