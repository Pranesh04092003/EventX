import { CustomButton } from '@/components/CustomButton';
import RegisteredStudentsModal from '@/components/RegisteredStudentsModal';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/Theme';
import { useStore } from '@/hooks/useStore';
import { firebaseEventsService } from '@/services/firebaseEvents';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, Edit, MapPin, Plus, Trash2, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  college: string;
  department: string;
  organizer: string;
  maxCapacity: number;
  registeredUsers: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  imageUrl?: string;
  createdAt: any;
  updatedAt: any;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  createButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  eventTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.white,
  },
  eventActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  deleteButton: {
    backgroundColor: Colors.errorLight,
  },
  eventDescription: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  organizerText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    flex: 1,
    flexWrap: 'wrap',
    marginRight: Spacing.md,
  },
  statusToggleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusToggleText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    minWidth: 150,
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

export default function ManageEventsScreen() {
  const { user, isAuthenticated } = useStore();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null);
  const [studentsModalVisible, setStudentsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    try {
      console.log('Manage Events: Starting to fetch events...');
      console.log('Manage Events: firebaseEventsService available:', !!firebaseEventsService);
      
      if (!firebaseEventsService) {
        throw new Error('Firebase Events Service not available');
      }
      
      const eventsData = await firebaseEventsService.getAllEvents();
      console.log('Manage Events: Successfully fetched events:', eventsData.length);
      setEvents(eventsData);
    } catch (error: any) {
      console.error('Manage Events: Error fetching events:', error);
      console.error('Manage Events: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      Alert.alert('Error', `Failed to fetch events: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };



  const handleEditEvent = (event: Event) => {
    router.push({
      pathname: '/admin/edit-event',
      params: { eventId: event.id }
    });
  };

  const handleDeleteEvent = async (event: Event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingEvent(event.id);
            try {
              await firebaseEventsService.deleteEvent(event.id);
              // Refresh events in the store
              const { loadEvents } = useStore.getState();
              await loadEvents();
              Alert.alert('Success', 'Event deleted successfully');
            } catch (error: any) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            } finally {
              setDeletingEvent(null);
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async (event: Event) => {
    const newStatus = event.status === 'upcoming' ? 'ongoing' : 
                     event.status === 'ongoing' ? 'completed' : 'upcoming';
    
    try {
      await firebaseEventsService.updateEvent(event.id, { status: newStatus });
      
      // Refresh events in the store
      const { loadEvents } = useStore.getState();
      await loadEvents();
      
      Alert.alert('Success', `Event status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating event status:', error);
      Alert.alert('Error', 'Failed to update event status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return Colors.primary;
      case 'ongoing': return Colors.success;
      case 'completed': return Colors.textTertiary;
      default: return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'Live';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleContainer}>
          <ThemedText style={styles.eventTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <ThemedText style={styles.statusText}>
              {getStatusText(item.status)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.eventActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditEvent(item)}
          >
            <Edit size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteEvent(item)}
            disabled={deletingEvent === item.id}
          >
            <Trash2 size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ThemedText style={styles.eventDescription} numberOfLines={2}>
        {item.description}
      </ThemedText>

      <View style={styles.eventDetails}>
        <View style={styles.detailRow}>
          <Calendar size={14} color={Colors.textSecondary} />
          <ThemedText style={styles.detailText}>
            {item.date} at {item.time}
          </ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={14} color={Colors.textSecondary} />
          <ThemedText style={styles.detailText} numberOfLines={1}>
            {item.location}
          </ThemedText>
        </View>
        
        <TouchableOpacity 
          style={styles.detailRow}
          onPress={() => {
            setSelectedEvent(item);
            setStudentsModalVisible(true);
          }}
        >
          <Users size={14} color={Colors.primary} />
          <ThemedText style={[styles.detailText, { color: Colors.primary }]}>
            {item.registeredUsers.length}/{item.maxCapacity} registered
          </ThemedText>
        </TouchableOpacity>

      </View>

      <View style={styles.eventFooter}>
        <ThemedText style={styles.organizerText} numberOfLines={2}>
          Organized by {item.organizer}
        </ThemedText>
        <TouchableOpacity
          style={styles.statusToggleButton}
          onPress={() => handleToggleStatus(item)}
        >
          <ThemedText style={styles.statusToggleText}>
            {item.status === 'upcoming' ? 'Mark as Live' : 
             item.status === 'ongoing' ? 'Mark as Complete' : 
             'Reset to Upcoming'}
          </ThemedText>
        </TouchableOpacity>
      </View>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.title}>
            Manage Events
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {events.length} events total
          </ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/admin/create-event')}
        >
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar size={48} color={Colors.textTertiary} />
            <ThemedText style={styles.emptyTitle}>
              {loading ? 'Loading Events...' : 'No Events Found'}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {loading 
                ? 'Please wait while we fetch your events...'
                : 'Create your first event to get started'
              }
            </ThemedText>
            {!loading && (
              <CustomButton
                title="Create Event"
                onPress={() => router.push('/admin/create-event')}
                style={styles.emptyButton}
              />
            )}
          </View>
        }
      />
      
      {/* Registered Students Modal */}
      <RegisteredStudentsModal
        visible={studentsModalVisible}
        onClose={() => {
          setStudentsModalVisible(false);
          setSelectedEvent(null);
        }}
        eventId={selectedEvent?.id || ''}
        eventTitle={selectedEvent?.title || ''}
      />
    </SafeAreaView>
  );
}