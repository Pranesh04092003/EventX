import { Colors, FontSize, Spacing } from '@/constants/Theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Loading EventX...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  text: {
    marginTop: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
