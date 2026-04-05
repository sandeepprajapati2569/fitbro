import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { DaySelectorStrip } from './DaySelectorStrip';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { WorkoutDay } from '../../types';

interface WorkoutTabProps {
  workoutPlan: WorkoutDay[];
  todayIndex: number;
}

export function WorkoutTab({ workoutPlan, todayIndex }: WorkoutTabProps) {
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const day = workoutPlan[selectedDay];
  const isRestDay = !day?.exercises?.length;

  return (
    <View style={styles.container}>
      <DaySelectorStrip
        days={workoutPlan.map((d) => d.day)}
        selectedIndex={selectedDay}
        onSelect={setSelectedDay}
        todayIndex={todayIndex}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isRestDay ? (
          <Card style={styles.restCard}>
            <View style={styles.restDay}>
              <View style={styles.restIcon}>
                <Feather name="moon" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.restTitle}>Rest Day</Text>
              <Text style={styles.restSubtitle}>Active Recovery</Text>
              <View style={styles.restTips}>
                {[
                  'Light walking (20-30 min)',
                  'Stretching or yoga',
                  'Foam rolling',
                  'Stay hydrated',
                ].map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Feather name="check" size={14} color={COLORS.primary} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        ) : (
          <>
            <Card style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#0D1A2B' }]}>
                    <Feather name="zap" size={16} color="#60A5FA" />
                  </View>
                  <Text style={styles.statValue}>{day.exercises.length}</Text>
                  <Text style={styles.statLabel}>Exercises</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#2B2508' }]}>
                    <Feather name="clock" size={16} color={COLORS.xpGold} />
                  </View>
                  <Text style={styles.statValue}>{day.durationMinutes}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: COLORS.primaryLight }]}>
                    <Feather name="layers" size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.statValue}>
                    {day.exercises.reduce((sum, e) => sum + e.sets, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Total Sets</Text>
                </View>
              </View>
              {/* XP reward */}
              <View style={styles.xpBanner}>
                <Feather name="star" size={12} color={COLORS.xpGold} />
                <Text style={styles.xpBannerText}>Complete this workout to earn +100 XP</Text>
              </View>
            </Card>

            {day.exercises.map((exercise, i) => (
              <Card key={i} style={styles.exerciseCard}>
                <View style={styles.exerciseRow}>
                  <View style={styles.exerciseIndex}>
                    <Text style={styles.exerciseIndexText}>{i + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.exerciseMeta}>
                      <View style={styles.metaChip}>
                        <Feather name="layers" size={10} color={COLORS.primary} />
                        <Text style={styles.metaText}>{exercise.sets} sets</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Feather name="repeat" size={10} color="#60A5FA" />
                        <Text style={styles.metaText}>{exercise.reps} reps</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Feather name="clock" size={10} color={COLORS.xpGold} />
                        <Text style={styles.metaText}>{exercise.restSeconds}s rest</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: SPACING.sm },
  scroll: { flex: 1 },
  scrollContent: {
    padding: SPACING.screenPadding,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  statsCard: { padding: SPACING.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'Urbanist_800ExtraBold',
    color: COLORS.primary,
    fontSize: 22,
  },
  statLabel: { ...FONTS.small, color: COLORS.textMuted },
  xpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.md,
    backgroundColor: '#2B2508',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2B2508',
  },
  xpBannerText: { fontSize: 11, fontWeight: '600', color: COLORS.xpGold },
  exerciseCard: { padding: SPACING.md },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  exerciseIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
  },
  exerciseIndexText: {
    fontFamily: 'Urbanist_700Bold',
    color: COLORS.primary,
    fontSize: 14,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: {
    ...FONTS.captionMedium,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  exerciseMeta: { flexDirection: 'row', gap: SPACING.sm },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  metaText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  restCard: { padding: SPACING.lg },
  restDay: { alignItems: 'center', gap: SPACING.sm },
  restIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
  },
  restTitle: { ...FONTS.headlineMedium, color: COLORS.text },
  restSubtitle: { ...FONTS.caption, color: COLORS.textSecondary },
  restTips: {
    width: '100%',
    marginTop: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  tipText: { ...FONTS.caption, color: COLORS.text },
});
