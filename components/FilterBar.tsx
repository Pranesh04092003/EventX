import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface FilterBarProps {
  selectedCollege: string;
  selectedDepartment: string;
  selectedDate: string;
  onCollegeChange: (college: string) => void;
  onDepartmentChange: (department: string) => void;
  onDateChange: (date: string) => void;
  onClearFilters: () => void;
}

const colleges = ['All', 'MIT College', 'Stanford University', 'Harvard University'];
const departments = ['All', 'Computer Science', 'Arts & Culture', 'Sports', 'Science', 'Engineering'];
const dateFilters = ['All', 'Today', 'This Week', 'This Month'];

export function FilterBar({
  selectedCollege,
  selectedDepartment,
  selectedDate,
  onCollegeChange,
  onDepartmentChange,
  onDateChange,
  onClearFilters,
}: FilterBarProps) {
  const FilterChip = ({ 
    title, 
    isSelected, 
    onPress 
  }: { 
    title: string; 
    isSelected: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.selectedChip]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>Filters</ThemedText>
        <TouchableOpacity onPress={onClearFilters}>
          <ThemedText style={styles.clearButton}>Clear All</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>College</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {colleges.map((college) => (
            <FilterChip
              key={college}
              title={college}
              isSelected={selectedCollege === college || (selectedCollege === '' && college === 'All')}
              onPress={() => onCollegeChange(college === 'All' ? '' : college)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Department</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {departments.map((department) => (
            <FilterChip
              key={department}
              title={department}
              isSelected={selectedDepartment === department || (selectedDepartment === '' && department === 'All')}
              onPress={() => onDepartmentChange(department === 'All' ? '' : department)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Date</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {dateFilters.map((date) => (
            <FilterChip
              key={date}
              title={date}
              isSelected={selectedDate === date || (selectedDate === '' && date === 'All')}
              onPress={() => onDateChange(date === 'All' ? '' : date)}
            />
          ))}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.7,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedChipText: {
    color: 'white',
  },
});
