import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('Normal');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Sound Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sound & Audio</Text>
          
          <View style={styles.card}>
            <View style={styles.cardItem}>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Sound Effects</Text>
                <Text style={styles.cardItemSubtitle}>Tile drops, merges, etc.</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#374151', true: '#E8624A' }}
                thumbColor="#FFF"
              />
            </View>

            <View style={[styles.cardItem, styles.cardItemBorder]}>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Background Music</Text>
                <Text style={styles.cardItemSubtitle}>Play music during game</Text>
              </View>
              <Switch
                value={musicEnabled}
                onValueChange={setMusicEnabled}
                trackColor={{ false: '#374151', true: '#E8624A' }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.cardItem}>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Haptic Feedback</Text>
                <Text style={styles.cardItemSubtitle}>Vibration on actions</Text>
              </View>
              <Switch
                value={hapticEnabled}
                onValueChange={setHapticEnabled}
                trackColor={{ false: '#374151', true: '#E8624A' }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Difficulty Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Difficulty</Text>
          
          <View style={styles.card}>
            <TouchableOpacity 
              style={[styles.cardItem, difficulty === 'Easy' ? styles.cardItemActive : null, styles.cardItemBorder]}
              onPress={() => setDifficulty('Easy')}
            >
              <View style={styles.cardItemContent}>
                <Text style={[styles.cardItemTitle, difficulty === 'Easy' ? styles.cardItemTitleActive : null]}>Easy</Text>
                <Text style={styles.cardItemSubtitle}>4x4 Grid • Relaxed pace</Text>
              </View>
              {difficulty === 'Easy' && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.cardItem, difficulty === 'Normal' ? styles.cardItemActive : null, styles.cardItemBorder]}
              onPress={() => setDifficulty('Normal')}
            >
              <View style={styles.cardItemContent}>
                <Text style={[styles.cardItemTitle, difficulty === 'Normal' ? styles.cardItemTitleActive : null]}>Normal</Text>
                <Text style={styles.cardItemSubtitle}>5x5 Grid • Balanced challenge</Text>
              </View>
              {difficulty === 'Normal' && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.cardItem, difficulty === 'Hard' ? styles.cardItemActive : null]}
              onPress={() => setDifficulty('Hard')}
            >
              <View style={styles.cardItemContent}>
                <Text style={[styles.cardItemTitle, difficulty === 'Hard' ? styles.cardItemTitleActive : null]}>Hard</Text>
                <Text style={styles.cardItemSubtitle}>6x6 Grid • Expert level</Text>
              </View>
              {difficulty === 'Hard' && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Appearance</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={[styles.cardItem, styles.cardItemBorder]}>
              <View style={styles.themePreview}>
                <View style={styles.themePreviewInner} />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Dark Mode</Text>
                <Text style={styles.cardItemSubtitle}>Currently active</Text>
              </View>
              <Text style={styles.checkIcon}>✓</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cardItem, styles.cardItemDisabled]}>
              <View style={[styles.themePreview, styles.themePreviewLight]}>
                <View style={[styles.themePreviewInner, styles.themePreviewInnerLight]} />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemTitle}>Light Mode</Text>
                <Text style={styles.cardItemSubtitle}>Coming soon</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          
          <View style={styles.card}>
            <View style={[styles.cardItem, styles.cardItemBorder]}>
              <Text style={styles.cardItemSubtitle}>Version</Text>
              <Text style={styles.cardItemTitle}>1.0.0</Text>
            </View>
            <TouchableOpacity style={styles.cardItem}>
              <Text style={styles.cardItemTitle}>Rate the App</Text>
              <Text style={styles.cardItemSubtitle}>Share your feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#E8624A',
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
    paddingRight: 64,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#4A5568',
  },
  cardItemActive: {
    backgroundColor: 'rgba(232, 98, 74, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#E8624A',
  },
  cardItemDisabled: {
    opacity: 0.5,
  },
  cardItemContent: {
    flex: 1,
  },
  cardItemTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cardItemTitleActive: {
    color: '#E8624A',
  },
  cardItemSubtitle: {
    color: '#718096',
    fontSize: 12,
    marginTop: 4,
  },
  checkIcon: {
    color: '#E8624A',
    fontSize: 24,
  },
  themePreview: {
    width: 48,
    height: 48,
    backgroundColor: '#171923',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4A5568',
    marginRight: 16,
  },
  themePreviewLight: {
    backgroundColor: '#fff',
  },
  themePreviewInner: {
    width: 32,
    height: 32,
    backgroundColor: '#171923',
    borderRadius: 8,
  },
  themePreviewInnerLight: {
    backgroundColor: '#e5e5e5',
  },
});
