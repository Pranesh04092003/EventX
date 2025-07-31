import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/Theme';
import { useStore } from '@/hooks/useStore';
import { markAttendance } from '@/services/attendance';
import { firebaseEventsService } from '@/services/firebaseEvents';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const { events } = useStore();

  const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (!scanning) return;
    setScanning(false);

    try {
      // Parse the QR code data
      const qrData = JSON.parse(data);
      const { userId, eventId, timestamp } = qrData;

      // Validate QR code format
      if (!userId || !eventId || !timestamp) {
        throw new Error('Invalid QR code format');
      }

      // Check if the event exists
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Check if the event is ongoing
      if (event.status !== 'ongoing') {
        throw new Error(
          event.status === 'upcoming' 
            ? 'Event has not started yet' 
            : 'Event has already ended'
        );
      }

      // Check if the user is registered for the event
      if (!event.registeredUsers.includes(userId)) {
        throw new Error('User is not registered for this event');
      }

      // Check if QR code is expired (24 hours validity)
      const qrTimestamp = new Date(timestamp).getTime();
      const now = new Date().getTime();
      if (now - qrTimestamp > 24 * 60 * 60 * 1000) {
        throw new Error('QR code has expired');
      }

      // Get user data
      const userData = await firebaseEventsService.getUserData(userId);
      
      // Mark attendance
      await markAttendance(eventId, userId);

      Alert.alert(
        'Success',
        `Attendance marked for ${userData.name} • ${event.title}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setScanning(true);
            },
          },
        ]
      );

    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to process QR code',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanning(true);
            },
          },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.message}>Loading camera...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ThemedText style={styles.permissionTitle}>Camera Permission Required</ThemedText>
          <ThemedText style={styles.permissionMessage}>
            We need camera access to scan QR codes and mark attendance
          </ThemedText>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <ThemedText style={styles.permissionButtonText}>Grant Permission</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText style={styles.title}>
            Scan QR Code
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Point camera at student's QR code
          </ThemedText>
        </View>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
            <ThemedText style={styles.scanText}>
              {scanning ? 'Position QR code within frame' : 'Processing...'}
            </ThemedText>
          </View>
        </CameraView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.white,
    opacity: 0.8,
  },
  message: {
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  permissionMessage: {
    fontSize: FontSize.base,
    color: Colors.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  permissionButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
  },
  scanText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xl,
  },
});