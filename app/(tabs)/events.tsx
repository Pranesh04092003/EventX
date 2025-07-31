import { EventCard } from '@/components/EventCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/Theme';
import { useStore } from '@/hooks/useStore';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EventsScreen() {
  const { events, loadEvents, user, isAuthenticated, registerForEvent } = useStore();
  const insets = useSafeAreaInsets();
  const { filter } = useLocalSearchParams<{ filter: string }>();

  // Load events when component mounts
  React.useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Calendar size={64} color={Colors.textTertiary} />
          <ThemedText type="title" style={styles.notLoggedInTitle}>
            Login Required
          </ThemedText>
          <ThemedText style={styles.notLoggedInText}>
            Please login to view your registered events
          </ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <ThemedText style={styles.loginButtonText}>Login</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Get filtered events based on the filter parameter
  const getFilteredEvents = () => {
    switch (filter) {
      case 'upcoming':
        return events.filter(event => event.status === 'upcoming');
      case 'ongoing':
        return events.filter(event => event.status === 'ongoing');
      case 'registered':
        return events.filter(event => user?.registeredEvents.includes(event.id));
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  // Get title and subtitle based on filter
  const getTitleAndSubtitle = () => {
    switch (filter) {
      case 'upcoming':
        return {
          title: 'Upcoming Events',
          subtitle: `${filteredEvents.length} upcoming events`
        };
      case 'ongoing':
        return {
          title: 'Ongoing Events',
          subtitle: `${filteredEvents.length} live events`
        };
      case 'registered':
        return {
          title: 'My Events',
          subtitle: `${filteredEvents.length} registered events`
        };
      default:
        return {
          title: 'All Events',
          subtitle: `${filteredEvents.length} events`
        };
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  const handleEventPress = (event: any) => {
    router.push(`/event-details?id=${event.id}`);
  };

  const handleRegister = (eventId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    registerForEvent(eventId);
  };

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
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          </View>
        </View>

        {/* Events List */}
        {filteredEvents.length > 0 ? (
          <View style={styles.eventsContainer}>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
                onRegister={() => handleRegister(event.id)}
                isRegistered={user?.registeredEvents.includes(event.id) || false}
                showRegisterButton={filter !== 'registered'}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={64} color={Colors.textTertiary} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No Events Found
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {filter === 'registered' 
                ? "You haven't registered for any events yet. Explore events to get started!"
                : "No events match your current filter. Try exploring all events!"
              }
            </ThemedText>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <ThemedText style={styles.exploreButtonText}>
                {filter === 'registered' ? 'Explore Events' : 'View All Events'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.xl,
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
    fontSize: FontSize.xxxl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },

  eventsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  exploreButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  notLoggedInTitle: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  notLoggedInText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: Spacing.xxxxl,
  },
});
