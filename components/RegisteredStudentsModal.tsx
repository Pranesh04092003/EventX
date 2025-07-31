import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/Theme';
import { firebaseEventsService } from '@/services/firebaseEvents';
import { X, User, Mail, Phone, GraduationCap, Building } from 'lucide-react-native';

interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  phone: string;
  registeredAt: string;
}

interface RegisteredStudentsModalProps {
  visible: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

export default function RegisteredStudentsModal({
  visible,
  onClose,
  eventId,
  eventTitle,
}: RegisteredStudentsModalProps) {
  const [students, setStudents] = useState<RegisteredStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && eventId) {
      fetchRegisteredStudents();
    }
  }, [visible, eventId]);

  const fetchRegisteredStudents = async () => {
    setLoading(true);
    try {
      const registeredStudents = await firebaseEventsService.getRegisteredStudents(eventId);
      setStudents(registeredStudents);
    } catch (error: any) {
      console.error('Error fetching registered students:', error);
      Alert.alert('Error', 'Failed to load registered students');
    } finally {
      setLoading(false);
    }
  };

  const renderStudent = ({ item }: { item: RegisteredStudent }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.avatarContainer}>
          <User size={24} color={Colors.primary} />
        </View>
        <View style={styles.studentInfo}>
          <ThemedText style={styles.studentName}>{item.name}</ThemedText>
          <ThemedText style={styles.studentEmail}>{item.email}</ThemedText>
        </View>
      </View>
      
      <View style={styles.studentDetails}>
        <View style={styles.detailRow}>
          <Building size={16} color={Colors.textSecondary} />
          <ThemedText style={styles.detailText}>{item.college}</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <GraduationCap size={16} color={Colors.textSecondary} />
          <ThemedText style={styles.detailText}>{item.department}</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <Phone size={16} color={Colors.textSecondary} />
          <ThemedText style={styles.detailText}>{item.phone}</ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.title}>Registered Students</ThemedText>
            <ThemedText style={styles.subtitle} numberOfLines={1}>
              {eventTitle}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <ThemedText style={styles.statsText}>
            Total Registered: {students.length}
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <ThemedText style={styles.loadingText}>Loading students...</ThemedText>
          </View>
        ) : students.length === 0 ? (
          <View style={styles.emptyContainer}>
            <User size={48} color={Colors.textTertiary} />
            <ThemedText style={styles.emptyText}>No students registered yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Students will appear here once they register for this event
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={students}
            renderItem={renderStudent}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  closeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
  },
  statsText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    padding: Spacing.lg,
  },
  studentCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  studentEmail: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  studentDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    flex: 1,
  },
});
