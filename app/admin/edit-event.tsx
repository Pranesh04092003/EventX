import { CustomButton } from '@/components/CustomButton';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '@/constants/Theme';
import { useStore } from '@/hooks/useStore';
import { firebaseEventsService } from '@/services/firebaseEvents';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const colleges = ['MIT College', 'Stanford University', 'Harvard University', 'UC Berkeley'];
const departments = ['Computer Science', 'Engineering', 'Arts & Culture', 'Science', 'Business', 'Medicine'];

export default function EditEventScreen() {
  const { user, isAuthenticated } = useStore();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<any>(null);
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
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed'
  });

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    if (!eventId) return;

    try {
      const eventData = await firebaseEventsService.getEventById(eventId);
      if (eventData) {
        setEvent(eventData);
        setFormData({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          college: eventData.college,
          department: eventData.department,
          organizer: eventData.organizer,
          maxCapacity: eventData.maxCapacity.toString(),
          imageUrl: eventData.imageUrl || '',
          status: eventData.status
        });
      } else {
        Alert.alert('Error', 'Event not found');
        router.back();
      }
    } catch (error: any) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'Failed to fetch event details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

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

  const handleUpdateEvent = async () => {
    if (!validateForm()) return;
    if (!isAuthenticated || !user?.isAdmin) {
      Alert.alert('Error', 'Admin privileges required');
      return;
    }
    if (!eventId) {
      Alert.alert('Error', 'Event ID not found');
      return;
    }

    setSaving(true);

    try {
      await firebaseEventsService.updateEvent(eventId, {
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
        status: formData.status
      });

      Alert.alert(
        'Success', 
        'Event updated successfully!',
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
      console.error('Update event error:', error);
      Alert.alert('Error', error.message || 'Failed to update event. Please try again.');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading event details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Event not found</ThemedText>
          <CustomButton
            title="Go Back"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
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
              Edit Event
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Update event details
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

          {/* Update Button */}
          <CustomButton
            title={saving ? "Updating Event..." : "Update Event"}
            onPress={handleUpdateEvent}
            disabled={saving}
            style={styles.updateButton}
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
  updateButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorButton: {
    minWidth: 120,
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
  inputText: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
  },
  placeholderText: {
    color: Colors.textTertiary,
    fontSize: FontSize.base,
  },
  datePickerIOS: {
    width: '100%',
    height: 200,
  }
});