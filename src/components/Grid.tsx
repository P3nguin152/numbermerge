import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Tile as TileType } from '../types/game';
import Tile from './Tile';
import { Colors, Radius } from '../theme/colors';
import { useBoardTheme } from '../contexts/BoardThemeContext';
import { BoardTheme } from '../theme/boardThemes';

interface GridProps {
  grid: (TileType | null)[][];
  onColumnPress: (col: number) => void;
}

const PATTERN_POSITIONS = [20, 40, 60, 80];

function PatternOverlay({ pattern, color }: { pattern: BoardTheme['pattern']; color: string }) {
  if (pattern === 'none') return null;

  if (pattern === 'dots') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {PATTERN_POSITIONS.map(y =>
          PATTERN_POSITIONS.map(x => (
            <View
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: color,
                top: `${y}%` as any,
                left: `${x}%` as any,
                transform: [{ translateX: -2 }, { translateY: -2 }],
              }}
            />
          ))
        )}
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PATTERN_POSITIONS.map(pos => (
        <View
          key={`h${pos}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${pos}%` as any,
            height: 1,
            backgroundColor: color,
          }}
        />
      ))}
      {PATTERN_POSITIONS.map(pos => (
        <View
          key={`v${pos}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${pos}%` as any,
            width: 1,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

function Grid({ grid, onColumnPress }: GridProps) {
  const { boardTheme } = useBoardTheme();

  if (!grid || !Array.isArray(grid)) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: boardTheme.boardBg,
          borderColor: boardTheme.boardBorder,
        },
      ]}
      accessibilityLabel="Game board. Tap any cell to drop the next tile into that column."
    >
      <PatternOverlay pattern={boardTheme.pattern} color={boardTheme.patternColor} />
      {grid.map((row, rowIndex) => {
        if (!row || !Array.isArray(row)) return null;
        return (
          <View key={rowIndex} style={styles.row}>
            {row.map((tile, colIndex) => (
              <React.Fragment key={`${rowIndex}-${colIndex}`}>
                <View style={styles.cellContainer}>
                  {tile ? (
                    <TouchableOpacity
                      style={styles.cell}
                      onPress={() => onColumnPress(colIndex)}
                      activeOpacity={1}
                      accessibilityRole="button"
                      accessibilityLabel={`Row ${rowIndex + 1} column ${colIndex + 1}. Tile ${tile.value}. Drop next tile in this column.`}
                    >
                      <View style={styles.tileWrapper}>
                        <Tile tile={tile} />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.emptyCell}
                      onPress={() => onColumnPress(colIndex)}
                      activeOpacity={1}
                      accessibilityRole="button"
                      accessibilityLabel={`Empty row ${rowIndex + 1} column ${colIndex + 1}. Drop next tile in this column.`}
                    />
                  )}
                </View>
                {colIndex < row.length - 1 && (
                  <View style={[styles.verticalDivider, { backgroundColor: boardTheme.divider }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        );
      })}
    </View>
  );
}

export default React.memo(Grid);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 4,
    aspectRatio: 1,
    maxWidth: 350,
    maxHeight: 350,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  cellContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    margin: 2,
    borderRadius: Radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  tileWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  emptyCell: {
    flex: 1,
    margin: 2,
    borderRadius: Radius.xs,
    aspectRatio: 1,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: Colors.divider,
  },
});
