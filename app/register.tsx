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

const colleges = ['MIT College', 'Stanford University', 'Harvard University', 'UC Berkeley'];
const departments = ['Computer Science', 'Engineering', 'Arts & Culture', 'Science', 'Business', 'Medicine'];

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const insets = useSafeAreaInsets();
  
  const { login } = useStore();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, phone, college, department, password, confirmPassword } = formData;
    
    if (!name || !email || !phone || !college || !department || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Call Firebase authentication
      const newUser = await firebaseAuthService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        department: formData.department,
        password: formData.password
      });

      await login(newUser);
      
      Alert.alert(
        'Success', 
        'Account created successfully! Welcome to EventX!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: insets.bottom + Spacing.xl
          }}
        >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Join EventX! 🎉
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Create your account to discover amazing events
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Full Name</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Phone Number</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>College</ThemedText>
            <View style={styles.pickerContainer}>
              {colleges.map((college) => (
                <TouchableOpacity
                  key={college}
                  style={[
                    styles.pickerOption,
                    formData.college === college && styles.pickerOptionSelected
                  ]}
                  onPress={() => updateField('college', college)}
                >
                  <Text style={[
                    styles.pickerText,
                    formData.college === college && styles.pickerTextSelected
                  ]}>
                    {college}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Department</ThemedText>
            <View style={styles.pickerContainer}>
              {departments.map((department) => (
                <TouchableOpacity
                  key={department}
                  style={[
                    styles.pickerOption,
                    formData.department === department && styles.pickerOptionSelected
                  ]}
                  onPress={() => updateField('department', department)}
                >
                  <Text style={[
                    styles.pickerText,
                    formData.department === department && styles.pickerTextSelected
                  ]}>
                    {department}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
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

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Confirm Password</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <CustomButton
            title={loading ? "Creating Account..." : "Create Account"}
            onPress={handleRegister}
            disabled={loading}
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Already have an account?{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <ThemedText style={styles.linkText}>Sign in</ThemedText>
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
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
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pickerOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  pickerTextSelected: {
    color: Colors.white,
  },
  registerButton: {
    marginTop: Spacing.md,
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
