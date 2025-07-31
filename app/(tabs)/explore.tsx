import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EventCard } from '@/components/EventCard';
import { FilterBar } from '@/components/FilterBar';
import { useStore, mockEvents, Event } from '@/hooks/useStore';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/Theme';

type TabType = 'upcoming' | 'ongoing' | 'completed';

export default function ExploreScreen() {
  const { 
    events, 
    setEvents, 
    user, 
    isAuthenticated, 
    registerForEvent,
    filterCollege,
    filterDepartment,
    filterDate,
    setFilters
  } = useStore();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Initialize with mock data if empty
    if (events.length === 0) {
      setEvents(mockEvents);
    }
  }, [events.length, setEvents]);

  const filterEvents = (eventList: Event[], status: TabType) => {
    let filtered = eventList.filter(event => event.status === status);

    // Apply college filter
    if (filterCollege) {
      filtered = filtered.filter(event => event.college === filterCollege);
    }

    // Apply department filter
    if (filterDepartment) {
      filtered = filtered.filter(event => event.department === filterDepartment);
    }

    // Apply date filter (simplified for demo)
    if (filterDate && filterDate !== 'All') {
      const today = new Date();
      const eventDate = new Date(filtered[0]?.date || today);
      
      switch (filterDate) {
        case 'Today':
          filtered = filtered.filter(event => {
            const eDate = new Date(event.date);
            return eDate.toDateString() === today.toDateString();
          });
          break;
        case 'This Week':
          // Simplified week filter
          break;
        case 'This Month':
          filtered = filtered.filter(event => {
            const eDate = new Date(event.date);
            return eDate.getMonth() === today.getMonth() && eDate.getFullYear() === today.getFullYear();
          });
          break;
      }
    }

    return filtered;
  };

  const filteredEvents = filterEvents(events, activeTab);

  const handleEventPress = (event: Event) => {
    router.push(`/event-details?id=${event.id}`);
  };

  const handleRegister = (eventId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    registerForEvent(eventId);
  };

  const handleClearFilters = () => {
    setFilters({ filterCollege: '', filterDepartment: '', filterDate: '' });
  };

  const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <ThemedText style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderEventCard = ({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={() => handleEventPress(item)}
      onRegister={() => handleRegister(item.id)}
      isRegistered={user?.registeredEvents.includes(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Explore Events
        </ThemedText>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <ThemedText style={styles.filterButtonText}>
            {showFilters ? 'Hide Filters' : 'Filters'} 🔍
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <FilterBar
          selectedCollege={filterCollege}
          selectedDepartment={filterDepartment}
          selectedDate={filterDate}
          onCollegeChange={(college) => setFilters({ filterCollege: college })}
          onDepartmentChange={(department) => setFilters({ filterDepartment: department })}
          onDateChange={(date) => setFilters({ filterDate: date })}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Upcoming"
          isActive={activeTab === 'upcoming'}
          onPress={() => setActiveTab('upcoming')}
        />
        <TabButton
          title="Ongoing"
          isActive={activeTab === 'ongoing'}
          onPress={() => setActiveTab('ongoing')}
        />
        <TabButton
          title="Completed"
          isActive={activeTab === 'completed'}
          onPress={() => setActiveTab('completed')}
        />
      </View>

      {/* Events List */}
      <View style={styles.eventsContainer}>
        {filteredEvents.length > 0 ? (
          <FlatList
            data={filteredEvents}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.eventsList,
              { paddingBottom: insets.bottom + Spacing.xl }
            ]}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No Events Found
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {activeTab === 'upcoming' && 'No upcoming events match your criteria.'}
              {activeTab === 'ongoing' && 'No events are currently ongoing.'}
              {activeTab === 'completed' && 'No completed events match your criteria.'}
            </ThemedText>
            {(filterCollege || filterDepartment || filterDate) && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={handleClearFilters}
              >
                <ThemedText style={styles.clearFiltersText}>
                  Clear Filters
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xs,
    backgroundColor: Colors.backgroundTertiary,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  tabButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  eventsList: {
    paddingBottom: Spacing.xxxxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxxxl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  clearFiltersButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
  },
  clearFiltersText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
