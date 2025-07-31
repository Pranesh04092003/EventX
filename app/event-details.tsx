import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { CustomButton } from '@/components/CustomButton';
import { useStore, Event } from '@/hooks/useStore';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/Theme';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, user, isAuthenticated, registerForEvent } = useStore();
  const [event, setEvent] = useState<Event | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (id) {
      const foundEvent = events.find(e => e.id === id);
      setEvent(foundEvent || null);
    }
  }, [id, events]);

  const isRegistered = user?.registeredEvents.includes(id || '') || false;
  const canRegister = event?.status === 'upcoming' && !isRegistered && isAuthenticated;

  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to register for events',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') }
        ]
      );
      return;
    }

    if (event && canRegister && !isRegistering) {
      setIsRegistering(true);
      try {
        await registerForEvent(event.id);
        Alert.alert('Success', 'You have successfully registered for this event!');
      } catch (error) {
        Alert.alert('Error', 'Failed to register for event. Please try again.');
        console.error('Registration error:', error);
      } finally {
        setIsRegistering(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#3B82F6';
      case 'ongoing': return '#10B981';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'Live Now';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  if (!event) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText type="title">Event Not Found</ThemedText>
          <ThemedText style={styles.errorText}>
            The event you're looking for doesn't exist.
          </ThemedText>
          <CustomButton
            title="Go Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.xl
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>← Back</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Event Image */}
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
        )}

        {/* Event Info */}
        <View style={styles.content}>
          <View style={styles.eventCard}>
            <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
            <ThemedText style={styles.eventDate}>{event.date}</ThemedText>
            <ThemedText style={styles.eventLocation}>{event.location}</ThemedText>
            <ThemedText style={styles.eventCollege}>{event.college}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
              <ThemedText style={styles.statusText}>{getStatusText(event.status)}</ThemedText>
            </View>
            <ThemedText style={styles.description}>{event.description}</ThemedText>
          </View>

          {/* Event Details */}
          <View style={styles.detailsSection}>
            <ThemedText style={styles.sectionTitle}>Event Details</ThemedText>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Date & Time</ThemedText>
              <ThemedText style={styles.detailValue}>{event.date} at {event.time}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>College</ThemedText>
              <ThemedText style={styles.detailValue}>{event.college}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Department</ThemedText>
              <ThemedText style={styles.detailValue}>{event.department}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Location</ThemedText>
              <ThemedText style={styles.detailValue}>{event.location}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Organizer</ThemedText>
              <ThemedText style={styles.detailValue}>{event.organizer}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Capacity</ThemedText>
              <ThemedText style={styles.detailValue}>{event.registeredUsers.length} / {event.maxCapacity} registered</ThemedText>
            </View>
          </View>

          {/* QR Code for registered users */}
          {isRegistered && (
            <View style={styles.qrSection}>
              <ThemedText type="subtitle" style={styles.qrTitle}>
                Your Event QR Code
              </ThemedText>
              <ThemedText style={styles.qrText}>
                Show this QR code at the event for quick check-in
              </ThemedText>
              <View style={styles.qrCode}>
                <QRCode
                  value={JSON.stringify({
                    eventId: event.id,
                    userId: user?.id,
                    userName: user?.name,
                    timestamp: Date.now()
                  })}
                  size={200}
                  backgroundColor="white"
                  color="black"
                />
              </View>
            </View>
          )}

          {/* Registration Button */}
          <View style={styles.actionsContainer}>
            {canRegister && (
              <CustomButton
                title={isRegistering ? "Registering..." : "Register for Event"}
                onPress={handleRegister}
                size="large"
                style={styles.registerButton}
                disabled={isRegistering}
              />
            )}

            {isRegistered && (
              <View style={styles.registeredContainer}>
                <ThemedText style={styles.registeredText}>
                  ✅ You are registered for this event
                </ThemedText>
              </View>
            )}

            {event.status === 'completed' && (
              <View style={styles.completedContainer}>
                <ThemedText style={styles.completedText}>
                  This event has been completed
                </ThemedText>
              </View>
            )}

            {!isAuthenticated && event.status === 'upcoming' && (
              <CustomButton
                title="Login to Register"
                onPress={() => router.push('/login')}
                variant="outline"
                size="large"
                style={styles.loginButton}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.md,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  eventTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  eventDate: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  eventLocation: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  eventCollege: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  detailsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundTertiary,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  detailValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  qrSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    ...Shadow.md,
  },
  qrTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  qrCode: {
    marginBottom: Spacing.md,
  },
  qrText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingBottom: Spacing.xl,
  },
  registerButton: {
    marginBottom: Spacing.md,
  },
  loginButton: {
    marginBottom: Spacing.md,
  },
  registeredContainer: {
    backgroundColor: Colors.success,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  registeredText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  completedContainer: {
    backgroundColor: Colors.backgroundTertiary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  completedText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginVertical: 16,
  },
  errorBackButton: {
    marginTop: 24,
  },
});
