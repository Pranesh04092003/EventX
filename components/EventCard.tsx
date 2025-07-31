import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Event } from '@/hooks/useStore';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onRegister?: () => void;
  showRegisterButton?: boolean;
  isRegistered?: boolean;
}

export function EventCard({ 
  event, 
  onPress, 
  onRegister, 
  showRegisterButton = true,
  isRegistered = false 
}: EventCardProps) {
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
      case 'ongoing': return 'Ongoing';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <ThemedView style={styles.card}>
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.image} />
        )}
        
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title} numberOfLines={2}>
              {event.title}
            </ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
              <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
            </View>
          </View>

          <ThemedText style={styles.description} numberOfLines={2}>
            {event.description}
          </ThemedText>

          <View style={styles.details}>
            <ThemedText style={styles.detailText}>📅 {event.date} • {event.time}</ThemedText>
            <ThemedText style={styles.detailText}>🏫 {event.college}</ThemedText>
            <ThemedText style={styles.detailText}>📍 {event.location}</ThemedText>
            <ThemedText style={styles.detailText}>
              👥 {event.registeredUsers.length}/{event.maxCapacity}
            </ThemedText>
          </View>

          {showRegisterButton && event.status === 'upcoming' && (
            <TouchableOpacity
              style={[
                styles.registerButton,
                isRegistered && styles.registeredButton
              ]}
              onPress={onRegister}
              disabled={isRegistered}
            >
              <Text style={[
                styles.registerButtonText,
                isRegistered && styles.registeredButtonText
              ]}>
                {isRegistered ? 'Registered ✓' : 'Register'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    marginBottom: 12,
    opacity: 0.8,
    lineHeight: 20,
  },
  details: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  registeredButton: {
    backgroundColor: '#10B981',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registeredButtonText: {
    color: 'white',
  },
});
