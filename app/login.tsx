import { CustomButton } from '@/components/CustomButton';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/constants/Theme';
import { useStore } from '@/hooks/useStore';
import { firebaseAuthService } from '@/services/firebaseAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();
  
  const { login } = useStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Call Firebase authentication
      const user = await firebaseAuthService.login({
        email,
        password,
        isAdmin
      });

      await login(user);
      
      Alert.alert(
        'Success', 
        `Welcome ${user.name}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (isAdmin) {
                router.replace('/admin');
              } else {
                router.replace('/(tabs)');
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Welcome Back</ThemedText>
          <ThemedText style={styles.subtitle}>Sign in to your account</ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[styles.switchOption, !isAdmin && styles.switchActive]}
              onPress={() => setIsAdmin(false)}
            >
              <Text style={[styles.switchText, !isAdmin && styles.switchTextActive]}>
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchOption, isAdmin && styles.switchActive]}
              onPress={() => setIsAdmin(true)}
            >
              <Text style={[styles.switchText, isAdmin && styles.switchTextActive]}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title={loading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          />

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Don't have an account?{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <ThemedText style={styles.linkText}>Sign up</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backText}>← Back to Home</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    paddingRight: Spacing.xl + 20, // Extra space for eye icon
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: Spacing.xs,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.xxl,
  },
  switchOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  switchActive: {
    backgroundColor: Colors.primary,
  },
  switchText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  switchTextActive: {
    color: Colors.white,
  },
  loginButton: {
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  backText: {
    fontSize: FontSize.base,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
});
