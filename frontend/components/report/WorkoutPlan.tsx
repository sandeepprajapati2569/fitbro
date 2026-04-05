import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { WorkoutDay } from '../../types';

interface WorkoutPlanProps {
  workoutPlan: WorkoutDay[];
}

export function WorkoutPlan({ workoutPlan }: WorkoutPlanProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(workoutPlan[0]?.day || null);

  return (
    <View>
      <Text style={styles.sectionTitle}>Workout Plan</Text>
      {workoutPlan.map((day) => (
        <Card key={day.day} style={styles.dayCard}>
          <TouchableOpacity
            style={styles.dayHeader}
            onPress={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
            activeOpacity={0.7}
          >
            <View style={styles.dayInfo}>
              <Feather name="activity" size={18} color={COLORS.primary} />
              <Text style={styles.dayName}>{day.day}</Text>
            </View>
            <View style={styles.dayMeta}>
              <Text style={styles.duration}>{day.durationMinutes} min</Text>
              <Feather
                name={expandedDay === day.day ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {expandedDay === day.day && (
            <View style={styles.exercises}>
              {day.exercises.map((exercise, i) => (
                <View key={i} style={styles.exerciseRow}>
                  <View style={styles.exerciseIndex}>
                    <Text style={styles.exerciseIndexText}>{i + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetail}>
                      {exercise.sets} sets x {exercise.reps} · {exercise.restSeconds}s rest
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  dayCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dayName: {
    ...FONTS.bodyMedium,
    color: COLORS.text,
    fontWeight: '600',
  },
  dayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  duration: {
    ...FONTS.caption,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  exercises: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  exerciseIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...FONTS.caption,
    color: COLORS.text,
    fontWeight: '500',
  },
  exerciseDetail: {
    ...FONTS.small,
    color: COLORS.textSecondary,
  },
});
