import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../theme/colors';

interface UpdateModalProps {
  visible: boolean;
  onClose: () => void;
  version: string;
  updateNotes: string[];
  packageName?: string;
}

export default function UpdateModal({ visible, onClose, version, updateNotes, packageName }: UpdateModalProps) {
  const handleOpenPlayStore = async () => {
    if (!packageName) {
      Alert.alert('Error', 'Package name not configured');
      return;
    }

    const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
    
    try {
      const supported = await Linking.canOpenURL(playStoreUrl);
      if (supported) {
        await Linking.openURL(playStoreUrl);
      } else {
        Alert.alert('Error', 'Unable to open Play Store');
      }
    } catch (error) {
      console.error('Error opening Play Store:', error);
      Alert.alert('Error', 'Unable to open Play Store');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="rocket" size={48} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>What's New</Text>
          <Text style={styles.version}>Version {version}</Text>
          
          <ScrollView style={styles.notesScroll} showsVerticalScrollIndicator={false}>
            {updateNotes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <View style={styles.bullet}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                </View>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Got it!</Text>
          </TouchableOpacity>

          {packageName && (
            <TouchableOpacity
              style={styles.playStoreButton}
              onPress={handleOpenPlayStore}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-google-playstore" size={20} color={Colors.textPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.playStoreButtonText}>Download the new update now</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.testingNote}>
            🧪 Closed Testing Phase
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  version: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    letterSpacing: 1,
  },
  notesScroll: {
    maxHeight: 200,
    marginBottom: Spacing.xl,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  bullet: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  noteText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.sm,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Spacing.md,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  playStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  playStoreButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  testingNote: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
