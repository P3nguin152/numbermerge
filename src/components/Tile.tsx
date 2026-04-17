import React from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Tile as TileType } from '../types/game';
import { TileColors, Radius } from '../theme/colors';

interface TileProps {
  tile: TileType;
}

const TILE_COLORS = TileColors;

function Tile({ tile }: TileProps) {
  const colors = TILE_COLORS[tile.value] || { bg: '#3c3a32', text: '#f9f6f2' };
  
  const scaleValue = React.useRef(new Animated.Value(tile.isFalling ? 0.3 : 1)).current;
  const opacityValue = React.useRef(new Animated.Value(tile.isFalling ? 0 : 1)).current;
  const translateYValue = React.useRef(new Animated.Value(0)).current;
  const translateXValue = React.useRef(new Animated.Value(0)).current;

  if (!tile || typeof tile !== 'object') {
    return null;
  }

  React.useEffect(() => {
    if (tile.isFalling) {
      translateYValue.setValue(-600);
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 20,
          friction: 12,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(translateYValue, {
          toValue: 0,
          useNativeDriver: true,
          tension: 15,
          friction: 14,
        }),
      ]).start();
    }
  }, [tile.isFalling, scaleValue, opacityValue, translateYValue]);

  React.useEffect(() => {
    if (tile.isMerged) {
      scaleValue.setValue(1.2);
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 30,
        friction: 12,
      }).start();
    }
  }, [tile.isMerged, scaleValue]);

  React.useEffect(() => {
    if (tile.isMoving && tile.fromCol !== undefined && tile.fromCol !== tile.col) {
      const diff = (tile.col - tile.fromCol) * 50;
      translateXValue.setValue(diff);
      Animated.spring(translateXValue, {
        toValue: 0,
        useNativeDriver: true,
        tension: 20,
        friction: 12,
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

export default React.memo(Tile);

const styles = StyleSheet.create({
  tile: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  tileText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
