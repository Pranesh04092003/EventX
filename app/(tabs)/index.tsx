import { CustomButton } from '@/components/CustomButton';
import { EventCard } from '@/components/EventCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/constants/Theme';
import { useStore } from '@/hooks/useStore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { events, loadEvents, user, isAuthenticated, registerForEvent, testFirebaseConnection } = useStore();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load events from Firebase when component mounts
    loadEvents();
  }, [loadEvents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  

  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: '/event-details',
      params: { id: eventId }
    });
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
        contentContainerStyle={{
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
      >
        {/* Welcome Banner */}
        <ThemedView style={styles.banner}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Welcome to EventX! 🎉
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            Discover amazing events from colleges around you
          </ThemedText>
        </ThemedView>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push({
              pathname: '/(tabs)/events',
              params: { filter: 'upcoming' }
            })}
          >
            <ThemedText type="subtitle" style={styles.statNumber}>
              {events.filter(e => e.status === 'upcoming').length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Upcoming</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push({
              pathname: '/(tabs)/events',
              params: { filter: 'ongoing' }
            })}
          >
            <ThemedText type="subtitle" style={styles.statNumber}>
              {events.filter(e => e.status === 'ongoing').length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Ongoing</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push({
              pathname: '/(tabs)/events',
              params: { filter: 'registered' }
            })}
          >
            <ThemedText type="subtitle" style={styles.statNumber}>
              {user?.registeredEvents.length || 0}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Registered</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Test Button - Temporary */}
        <View style={styles.ctaContainer}>
         
          
          <CustomButton
            title="Explore Events"
            onPress={() => router.push('/(tabs)/explore')}
            size="large"
            style={styles.ctaButton}
          />
          {!isAuthenticated && (
            <View style={styles.authSection}>
              <View style={styles.authHeader}>
                <ThemedText type="subtitle" style={styles.authTitle}>
                  Join EventX
                </ThemedText>
                <ThemedText style={styles.authSubtitle}>
                  Create an account to register for events and track your activities
                </ThemedText>
              </View>
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => router.push('/login')}
                >
                  <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => router.push('/register')}
                >
                  <ThemedText style={styles.registerButtonText}>Create Account</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Upcoming Events Preview */}
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Upcoming Events
            </ThemedText>
            <TouchableOpacity onPress={() => router.push({
              pathname: '/(tabs)/events',
              params: { filter: 'upcoming' }
            })}>
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          
          {events
            .filter(event => event.status === 'upcoming')
            .slice(0, 3)
            .map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event.id)}
                onRegister={() => handleRegister(event.id)}
                isRegistered={user?.registeredEvents.includes(event.id) || false}
              />
            ))}
        </View>

        {/* Ongoing Events Preview */}
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Happening Now
            </ThemedText>
            <TouchableOpacity onPress={() => router.push({
              pathname: '/(tabs)/events',
              params: { filter: 'ongoing' }
            })}>
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          
          {events
            .filter(event => event.status === 'ongoing')
            .slice(0, 2)
            .map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event.id)}
                onRegister={() => handleRegister(event.id)}
                isRegistered={user?.registeredEvents.includes(event.id) || false}
              />
            ))}
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
  banner: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: FontSize.base,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    marginBottom: Spacing.xl,
  },
  authSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.lg,
    ...Shadow.md,
  },
  authHeader: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  authSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  authButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  loginButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  registerButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  registerButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  eventsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  testButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  testButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
});
