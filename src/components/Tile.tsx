import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Tile as TileType } from '../types/game';

interface TileProps {
  tile: TileType;
}

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: '#FF69B4', text: '#fff' },
  4: { bg: '#32CD32', text: '#fff' },
  8: { bg: '#5BBCD8', text: '#fff' },
  16: { bg: '#4169E1', text: '#fff' },
  32: { bg: '#E8624A', text: '#fff' },
  64: { bg: '#9B59B6', text: '#fff' },
  128: { bg: '#95A5A6', text: '#fff' },
  256: { bg: '#E74C3C', text: '#fff' },
  512: { bg: '#F39C12', text: '#fff' },
  1024: { bg: '#1ABC9C', text: '#fff' },
  2048: { bg: '#E91E63', text: '#fff' },
};

export default function Tile({ tile }: TileProps) {
  const colors = TILE_COLORS[tile.value] || { bg: '#3c3a32', text: '#f9f6f2' };
  
  const scaleValue = React.useRef(new Animated.Value(tile.isFalling ? 0.3 : 1)).current;
  const opacityValue = React.useRef(new Animated.Value(tile.isFalling ? 0 : 1)).current;
  const translateYValue = React.useRef(new Animated.Value(0)).current;
  const translateXValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (tile.isFalling) {
      translateYValue.setValue(-80);
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateYValue, {
          toValue: 0,
          useNativeDriver: true,
          tension: 30,
          friction: 10,
        }),
      ]).start();
    }
  }, [tile.isFalling, scaleValue, opacityValue, translateYValue]);

  React.useEffect(() => {
    if (tile.isMerged) {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.4,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();
    }
  }, [tile.isMerged, scaleValue]);

  React.useEffect(() => {
    if (tile.isMoving && tile.fromCol !== undefined && tile.fromCol !== tile.col) {
      const diff = (tile.col - tile.fromCol) * 50;
      translateXValue.setValue(diff);
      Animated.spring(translateXValue, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [tile.isMoving, tile.fromCol, tile.col, translateXValue]);

  const animatedStyle = {
    transform: [
      { scale: scaleValue },
      { translateY: translateYValue },
      { translateX: translateXValue },
    ] as any,
    opacity: opacityValue,
  };

  return (
    <Animated.View
      style={[
        styles.tile,
        { backgroundColor: colors.bg },
        animatedStyle,
      ]}
    >
      <Text style={[styles.tileText, { color: colors.text }]}>{tile.value}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
});
