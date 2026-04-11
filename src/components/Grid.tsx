import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Tile as TileType } from '../types/game';
import Tile from './Tile';
import { TILE_COLORS } from './GameBoard';
import { GRID_COLS } from '../utils/mergeLogic';

interface GridProps {
  grid: (TileType | null)[][];
  onColumnPress: (col: number) => void;
}

export default function Grid({ grid, onColumnPress }: GridProps) {
  return (
    <View style={styles.container}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((tile, colIndex) => (
            <View key={`${rowIndex}-${colIndex}`} style={styles.cellContainer}>
              {tile ? (
                <TouchableOpacity
                  style={styles.cell}
                  onPress={() => onColumnPress(colIndex)}
                  activeOpacity={0.7}
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
                />
              )}
              {colIndex < GRID_COLS - 1 && <View style={styles.verticalLine} />}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 4,
    flex: 1,
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
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  tileText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyCell: {
    flex: 1,
    margin: 2,
  },
  verticalLine: {
    width: 1,
    backgroundColor: '#333',
  },
});
