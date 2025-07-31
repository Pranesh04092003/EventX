import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/constants/Theme';
import { useStore } from '@/hooks/useStore';
import { firebaseEventsService } from '@/services/firebaseEvents';
import { router } from 'expo-router';
import { Calendar, Edit, LogOut, Plus, QrCode, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


interface Registrant {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  phone: string;
  registeredAt: string;
  isPresent?: boolean;
}

export default function AdminScreen() {
  const { user, isAuthenticated, logout, events } = useStore();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const insets = useSafeAreaInsets();

  const [registrants, setRegistrants] = useState<Registrant[]>([]);

  // Fetch registrants when an event is selected
  useEffect(() => {
    const fetchRegistrants = async () => {
      if (!selectedEvent) {
        setRegistrants([]);
        return;
      }

      try {
        // Find the selected event
        const event = events.find(e => e.id === selectedEvent);
        if (!event) return;

        // Get registered users data and attendance status from firestore
        const users = await Promise.all(
          event.registeredUsers.map(async (userId) => {
            const userData = await firebaseEventsService.getUserData(userId);
            const isPresent = event.attendees?.includes(userId) || false;
            
            return {
              id: userId,
              name: userData.name || 'Unknown',
              email: userData.email || '',
              college: userData.college || '',
              department: userData.department || '',
              phone: userData.phone || '',
              registeredAt: userData.registeredAt || new Date().toISOString(),
              isPresent
            };
          })
        );

        setRegistrants(users);
      } catch (error) {
        console.error('Error fetching registrants:', error);
        Alert.alert('Error', 'Failed to fetch registrants');
      }
    };

    fetchRegistrants();
  }, [selectedEvent, events]);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || !user?.isAdmin) {
      Alert.alert(
        'Access Denied',
        'You need admin privileges to access this page.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const handleScanQR = () => {
    router.push('/admin/qr-scanner');
  };

  const handleCreateEvent = () => {
    router.push('/admin/create-event');
  };

  const handleManageEvents = () => {
    router.push('/admin/manage-events');
  };

  const renderRegistrant = ({ item }: { item: Registrant }) => (
    <View style={styles.registrantCard}>
      <View style={styles.registrantInfo}>
        <View style={styles.registrantHeader}>
          <ThemedText style={styles.registrantName}>{item.name}</ThemedText>
          {item.isPresent && (
            <View style={styles.presentBadge}>
              <ThemedText style={styles.presentBadgeText}>Present</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={styles.registrantDetail}>{item.email}</ThemedText>
        <ThemedText style={styles.registrantDetail}>{item.college}</ThemedText>
        <ThemedText style={styles.registrantDetail}>{item.department}</ThemedText>
        <ThemedText style={styles.registrantDetail}>{item.phone}</ThemedText>
        <ThemedText style={styles.registrantDate}>
          Registered: {new Date(item.registeredAt).toLocaleDateString()}
        </ThemedText>
      </View>
      {!item.isPresent && (
        <TouchableOpacity
          style={styles.markAttendanceButton}
          onPress={() => Alert.alert('Notice', 'Please use QR scanner to mark attendance')}
        >
          <ThemedText style={styles.markAttendanceText}>Not Present</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <ThemedText type="title" style={styles.accessDeniedTitle}>Access Denied</ThemedText>
          <ThemedText style={styles.accessDeniedText}>
            Admin privileges required
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + Spacing.xl
          }}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.title}>
              Admin Dashboard
            </ThemedText>
            <ThemedText style={styles.welcomeText}>
              Welcome, {user.name}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color={Colors.white} />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={handleCreateEvent}>
            <Plus size={24} color={Colors.primary} />
            <ThemedText style={styles.actionTitle}>Create Event</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Add new event</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleManageEvents}>
            <Edit size={24} color={Colors.primary} />
            <ThemedText style={styles.actionTitle}>Manage Events</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Edit & delete events</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Calendar size={20} color={Colors.primary} />
            <ThemedText style={styles.statNumber}>{events.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Events</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Users size={20} color={Colors.success} />
            <ThemedText style={styles.statNumber}>{registrants.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Registrants</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Calendar size={20} color={Colors.warning} />
            <ThemedText style={styles.statNumber}>
              {events.filter(e => e.status === 'ongoing').length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Live Events</ThemedText>
          </View>
        </View>

        {/* QR Scanner Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            QR Code Scanner
          </ThemedText>
          <TouchableOpacity style={styles.scanCard} onPress={handleScanQR}>
            <QrCode size={32} color={Colors.primary} />
            <ThemedText style={styles.scanTitle}>Scan QR Code</ThemedText>
            <ThemedText style={styles.scanDescription}>
              Scan student QR codes to mark attendance
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Event Selector */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Select Event
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.eventSelector}>
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.eventChip,
                    selectedEvent === event.id && styles.eventChipSelected
                  ]}
                  onPress={() => setSelectedEvent(event.id)}
                >
                  <ThemedText style={[
                    styles.eventChipText,
                    selectedEvent === event.id && styles.eventChipTextSelected
                  ]}>
                    {event.title}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Registrants List */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Event Registrants
          </ThemedText>
          {selectedEvent ? (
            <FlatList
              data={registrants}
              renderItem={renderRegistrant}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noEventSelected}>
              <ThemedText style={styles.noEventText}>
                Select an event to view registrants
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  welcomeText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.error,
    gap: Spacing.xs,
  },
  logoutText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  actionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  actionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minWidth: 80,
    ...Shadow.sm,
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  scanCard: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  scanTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  scanDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  eventSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  eventChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  eventChipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  eventChipTextSelected: {
    color: Colors.white,
  },
  registrantCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadow.sm,
  },
  registrantInfo: {
    flex: 1,
  },
  registrantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  registrantName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  presentBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  presentBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  registrantDetail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  registrantDate: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  markAttendanceButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.success,
  },
  markAttendanceText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  noEventSelected: {
    padding: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
  },
  noEventText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  accessDeniedTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  accessDeniedText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
