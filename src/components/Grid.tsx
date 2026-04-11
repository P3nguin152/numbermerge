import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Tile as TileType } from '../types/game';
import Tile from './Tile';
import { Colors, Radius } from '../theme/colors';

interface GridProps {
  grid: (TileType | null)[][];
  onColumnPress: (col: number) => void;
}

function Grid({ grid, onColumnPress }: GridProps) {
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
            </View>
          ))}
        </View>
      ))}
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
    padding: 3,
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
    margin: 3,
    borderRadius: Radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  emptyCell: {
    flex: 1,
    margin: 3,
    borderRadius: Radius.xs,
  },
});
