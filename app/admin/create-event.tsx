import { CustomButton } from '@/components/CustomButton';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/constants/Theme';
import { useStore } from '@/hooks/useStore';
import { firebaseEventsService } from '@/services/firebaseEvents';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const colleges = ['MIT College', 'Stanford University', 'Harvard University', 'UC Berkeley'];
const departments = ['Computer Science', 'Engineering', 'Arts & Culture', 'Science', 'Business', 'Medicine'];

export default function CreateEventScreen() {
  const { user, isAuthenticated } = useStore();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    college: '',
    department: '',
    organizer: '',
    maxCapacity: '',
    imageUrl: '',
    status: 'upcoming'
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || tempDate;
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTempDate(currentDate);
      const formattedDate = currentDate.toISOString().split('T')[0];
      updateField('date', formattedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || tempDate;
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTempDate(currentTime);
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
      updateField('time', formattedTime);
    }
  };

  const validateForm = () => {
    const { title, description, date, time, location, college, department, organizer, maxCapacity } = formData;
    
    if (!title || !description || !date || !time || !location || !college || !department || !organizer || !maxCapacity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (parseInt(maxCapacity) <= 0) {
      Alert.alert('Error', 'Maximum capacity must be greater than 0');
      return false;
    }

    return true;
  };



  const handleCreateEvent = async () => {
    if (!validateForm()) return;
    if (!isAuthenticated || !user?.isAdmin) {
      Alert.alert('Error', 'Admin privileges required');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating event with data:', formData);
      
      // Create event using Firebase events service
      const newEvent = await firebaseEventsService.createEvent({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        college: formData.college,
        department: formData.department,
        organizer: formData.organizer,
        maxCapacity: parseInt(formData.maxCapacity),
        imageUrl: formData.imageUrl || undefined,
        status: formData.status as 'upcoming' | 'ongoing' | 'completed'
      }, user.id);
      
      console.log('Event created successfully:', newEvent);

      Alert.alert(
        'Success', 
        'Event created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Refresh events in the store
              const { loadEvents } = useStore.getState();
              loadEvents();
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Create event error:', error);
      Alert.alert('Error', error.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              Create Event
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Add a new event to EventX
            </ThemedText>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Basic Information */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Basic Information
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Event Title *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter event title"
                value={formData.title}
                onChangeText={(value) => updateField('title', value)}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Description *</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your event"
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                multiline
                numberOfLines={4}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Organizer *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Event organizer name"
                value={formData.organizer}
                onChangeText={(value) => updateField('organizer', value)}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Date & Time
            </ThemedText>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <ThemedText style={styles.label}>Date *</ThemedText>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <ThemedText style={formData.date ? styles.inputText : styles.placeholderText}>
                    {formData.date || 'Select date'}
                  </ThemedText>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    testID="datePicker"
                    value={tempDate}
                    mode="date"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    positiveButton={{ label: 'OK' }}
                    negativeButton={{ label: 'Cancel' }}
                  />
                )}
              </View>
              
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <ThemedText style={styles.label}>Time *</ThemedText>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowTimePicker(true)}
                >
                  <ThemedText style={formData.time ? styles.inputText : styles.placeholderText}>
                    {formData.time || 'Select time'}
                  </ThemedText>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    testID="timePicker"
                    value={tempDate}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    positiveButton={{ label: 'OK' }}
                    negativeButton={{ label: 'Cancel' }}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Location
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Venue *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Event location"
                value={formData.location}
                onChangeText={(value) => updateField('location', value)}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* College & Department */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              College & Department
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>College *</ThemedText>
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
                    <ThemedText style={[
                      styles.pickerText,
                      formData.college === college && styles.pickerTextSelected
                    ]}>
                      {college}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Department *</ThemedText>
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
                    <ThemedText style={[
                      styles.pickerText,
                      formData.department === department && styles.pickerTextSelected
                    ]}>
                      {department}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Capacity */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Capacity
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Maximum Capacity *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter maximum number of attendees"
                value={formData.maxCapacity}
                onChangeText={(value) => updateField('maxCapacity', value)}
                keyboardType="numeric"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          {/* Image URL */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Event Image (Optional)
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Image URL</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChangeText={(value) => updateField('imageUrl', value)}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>



          {/* Create Button */}
          <CustomButton
            title={loading ? "Creating Event..." : "Create Event"}
            onPress={handleCreateEvent}
            disabled={loading}
            style={styles.createButton}
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  inputText: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
  },
  placeholderText: {
    color: Colors.textTertiary,
    fontSize: FontSize.base,
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
  form: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
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

  createButton: {
    marginBottom: Spacing.xl,
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
  datePickerIOS: {
    width: '100%',
    height: 200,
  },
}); 