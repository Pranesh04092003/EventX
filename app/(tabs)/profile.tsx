import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/Theme';
import { useStore } from '@/hooks/useStore';
import { router } from 'expo-router';
import { Award, Building, Calendar, GraduationCap, LogOut, Mail, Phone, Settings, User } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, events } = useStore();
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notLoggedIn}>
          <User size={64} color={Colors.textTertiary} />
          <ThemedText type="title" style={styles.notLoggedInTitle}>
            Welcome to EventX
          </ThemedText>
          <ThemedText style={styles.notLoggedInText}>
            Login to access your profile and manage your events
          </ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <ThemedText style={styles.loginButtonText}>Login</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
          >
            <ThemedText style={styles.registerButtonText}>Create Account</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const registeredEvents = events.filter(event => 
    user?.registeredEvents.includes(event.id)
  );

  const handleLogout = () => {
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

  const ProfileItem = ({ icon, label, value, onPress }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.profileItemLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View>
          <ThemedText style={styles.profileLabel}>{label}</ThemedText>
          <ThemedText style={styles.profileValue}>{value}</ThemedText>
        </View>
      </View>
      {onPress && (
        <View style={styles.arrow}>
          <ThemedText style={styles.arrowText}>›</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.xl
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color={Colors.white} />
            </View>
            {user?.isAdmin && (
              <View style={styles.adminBadge}>
                <ThemedText style={styles.adminBadgeText}>Admin</ThemedText>
              </View>
            )}
          </View>
          <ThemedText type="title" style={styles.name}>
            {user?.name}
          </ThemedText>
          <ThemedText style={styles.email}>
            {user?.email}
          </ThemedText>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Calendar size={20} color={Colors.primary} />
            <ThemedText style={styles.statNumber}>{registeredEvents.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Events</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Award size={20} color={Colors.success} />
            <ThemedText style={styles.statNumber}>
              {events.filter(e => e.status === 'completed' && user?.registeredEvents.includes(e.id)).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Completed</ThemedText>
          </View>
          <View style={styles.statCard}>
            <GraduationCap size={20} color={Colors.warning} />
            <ThemedText style={styles.statNumber}>1</ThemedText>
            <ThemedText style={styles.statLabel}>College</ThemedText>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Profile Information
          </ThemedText>
          <View style={styles.profileCard}>
            <ProfileItem
              icon={<Mail size={20} color={Colors.primary} />}
              label="Email"
              value={user?.email || ''}
            />
            <ProfileItem
              icon={<Phone size={20} color={Colors.primary} />}
              label="Phone"
              value={user?.phone || 'Not provided'}
            />
            <ProfileItem
              icon={<Building size={20} color={Colors.primary} />}
              label="College"
              value={user?.college || ''}
            />
            <ProfileItem
              icon={<GraduationCap size={20} color={Colors.primary} />}
              label="Department"
              value={user?.department || ''}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.profileCard}>
            <ProfileItem
              icon={<Calendar size={20} color={Colors.primary} />}
              label="My Events"
              value="View registered events"
              onPress={() => router.push({
                pathname: '/(tabs)/events',
                params: { filter: 'registered' }
              })}
            />
            {user?.isAdmin && (
              <ProfileItem
                icon={<Settings size={20} color={Colors.primary} />}
                label="Admin Dashboard"
                value="Manage events and users"
                onPress={() => router.push('/admin')}
              />
            )}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.error} />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  adminBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  statCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
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
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  profileLabel: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  profileValue: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  arrow: {
    marginLeft: Spacing.sm,
  },
  arrowText: {
    fontSize: FontSize.xl,
    color: Colors.textTertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSize.base,
    fontWeight: '600',
    marginLeft: Spacing.sm,
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
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    alignItems: 'center',
  },
  registerButtonText: {
    color: Colors.primary,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: Spacing.xxxxl,
  },
});
