import { Colors } from '@/constants/Theme';
import { useStore } from '@/hooks/useStore';
import { Tabs } from 'expo-router';
import { Calendar, Home, Search, Settings, User } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { isAuthenticated, user } = useStore();

  return (
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textTertiary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 88 : 64,
            ...Platform.select({
              ios: {
                shadowColor: Colors.shadow,
                shadowOffset: {
                  width: 0,
                  height: -2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 8,
              },
            }),
          },
        }}>
        
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Home size={size || 24} color={color} strokeWidth={2} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => (
              <Search size={size || 24} color={color} strokeWidth={2} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="events"
          options={{
            title: 'My Events',
            tabBarIcon: ({ color, size }) => (
              <Calendar size={size || 24} color={color} strokeWidth={2} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            title: isAuthenticated ? 'Profile' : 'Login',
            tabBarIcon: ({ color, size }) => (
              <User size={size || 24} color={color} strokeWidth={2} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color, size }) => (
              <Settings size={size || 24} color={color} strokeWidth={2} />
            ),
            href: user?.isAdmin ? '/admin' : null,
          }}
        />
      </Tabs>
  );
}
