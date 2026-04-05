import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { AIReport } from '../../types';

interface TodayTabProps {
  report: AIReport;
  goal: string;
  todayIndex: number;
  onViewWorkout: () => void;
  onViewMeals: () => void;
}

export function TodayTab({ report, goal, todayIndex, onViewWorkout, onViewMeals }: TodayTabProps) {
  const todayWorkout = report.workoutPlan[todayIndex];
  const todayMeals = report.mealPlan[todayIndex];
  const calc = report.calculated;
  const [showSupplements, setShowSupplements] = useState(false);
  const isRestDay = !todayWorkout?.exercises?.length;

  // Gamification data
  const streakDays = 7;
  const currentXP = 2450;
  const levelXP = 3000;
  const level = 5;
  const xpProgress = currentXP / levelXP;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Gamification Stats Bar */}
      <View style={styles.gamificationBar}>
        <View style={styles.gameStat}>
          <View style={styles.streakIcon}>
            <Feather name="zap" size={16} color={COLORS.streak} />
          </View>
          <View>
            <Text style={styles.gameStatValue}>{streakDays}</Text>
            <Text style={styles.gameStatLabel}>Day Streak</Text>
          </View>
        </View>
        <View style={styles.gameDivider} />
        <View style={styles.gameStat}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
          <View>
            <Text style={styles.gameStatValue}>Level {level}</Text>
            <View style={styles.xpBarContainer}>
              <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
            </View>
          </View>
        </View>
        <View style={styles.gameDivider} />
        <View style={styles.gameStat}>
          <View style={styles.xpIcon}>
            <Feather name="star" size={16} color={COLORS.xpGold} />
          </View>
          <View>
            <Text style={styles.gameStatValue}>{currentXP}</Text>
            <Text style={styles.gameStatLabel}>XP Total</Text>
          </View>
        </View>
      </View>

      {/* Daily Calorie Target Card */}
      <Card glow style={styles.calorieCard}>
        <View style={styles.calorieRow}>
          <View style={styles.calorieRing}>
            <Text style={styles.calorieNum}>{calc.daily_calories}</Text>
            <Text style={styles.calorieSuffix}>kcal</Text>
          </View>
          <View style={styles.calorieInfo}>
            <Text style={styles.calorieTitle}>Daily Target</Text>
            <Text style={styles.calorieSub}>
              {goal === 'lose_weight' ? 'Deficit' : 'Surplus'}: {Math.abs(calc.deficit_or_surplus)}{' '}
              kcal
            </Text>
            <View style={styles.macroMiniRow}>
              <Text style={[styles.macroMini, { color: COLORS.protein }]}>P:{calc.protein_g}g</Text>
              <Text style={[styles.macroMini, { color: COLORS.carbs }]}>C:{calc.carbs_g}g</Text>
              <Text style={[styles.macroMini, { color: COLORS.fat }]}>F:{calc.fat_g}g</Text>
            </View>
          </View>
          <View style={styles.xpReward}>
            <Feather name="star" size={12} color={COLORS.xpGold} />
            <Text style={styles.xpRewardText}>+50 XP</Text>
          </View>
        </View>
      </Card>

      {/* Today's Workout */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.iconCircle, { backgroundColor: '#0D1A2B' }]}>
              <Feather name="activity" size={18} color={COLORS.protein} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Today's Workout</Text>
              <Text style={styles.cardSubtitle}>{todayWorkout?.day || 'Rest Day'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewAllBtn} onPress={onViewWorkout} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>Full Week</Text>
            <Feather name="chevron-right" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {isRestDay ? (
          <View style={styles.restDay}>
            <View style={styles.restDayIcon}>
              <Feather name="moon" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.restDayText}>Rest Day - Active Recovery</Text>
            <Text style={styles.restDayHint}>Go for a walk, stretch, or do light yoga</Text>
          </View>
        ) : (
          <View>
            <View style={styles.workoutStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{todayWorkout.exercises.length}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{todayWorkout.durationMinutes}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {todayWorkout.exercises.reduce((sum, e) => sum + e.sets, 0)}
                </Text>
                <Text style={styles.statLabel}>Total Sets</Text>
              </View>
            </View>
            {todayWorkout.exercises.slice(0, 3).map((ex, i) => (
              <View key={i} style={styles.exercisePreview}>
                <View style={styles.exerciseDot} />
                <Text style={styles.exerciseName} numberOfLines={1}>
                  {ex.name}
                </Text>
                <Text style={styles.exerciseDetail}>
                  {ex.sets}x{ex.reps}
                </Text>
              </View>
            ))}
            {todayWorkout.exercises.length > 3 && (
              <Text style={styles.moreText}>
                +{todayWorkout.exercises.length - 3} more exercises
              </Text>
            )}
          </View>
        )}
      </Card>

      {/* Today's Meals */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.iconCircle, { backgroundColor: '#2B2508' }]}>
              <Feather name="coffee" size={18} color={COLORS.xpGold} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Today's Meals</Text>
              <Text style={styles.cardSubtitle}>{todayMeals?.totalCalories || 0} cal total</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewAllBtn} onPress={onViewMeals} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>Full Week</Text>
            <Feather name="chevron-right" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {todayMeals?.meals.map((meal, i) => (
          <View key={i} style={styles.mealRow}>
            <View
              style={[
                styles.mealIcon,
                {
                  backgroundColor:
                    meal.type === 'breakfast'
                      ? '#2B2508'
                      : meal.type === 'lunch'
                        ? '#0D1A2B'
                        : meal.type === 'dinner'
                          ? '#1F0D2B'
                          : COLORS.primaryLight,
                },
              ]}
            >
              <Feather
                name={
                  meal.type === 'breakfast'
                    ? 'sunrise'
                    : meal.type === 'lunch'
                      ? 'sun'
                      : meal.type === 'dinner'
                        ? 'moon'
                        : 'coffee'
                }
                size={14}
                color={
                  meal.type === 'breakfast'
                    ? COLORS.carbs
                    : meal.type === 'lunch'
                      ? COLORS.protein
                      : meal.type === 'dinner'
                        ? COLORS.badge
                        : COLORS.primary
                }
              />
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName} numberOfLines={1}>
                {meal.name}
              </Text>
              <View style={styles.mealMacros}>
                <Text style={[styles.microMacro, { color: COLORS.protein }]}>
                  P:{meal.protein}g
                </Text>
                <Text style={[styles.microMacro, { color: COLORS.carbs }]}>C:{meal.carbs}g</Text>
                <Text style={[styles.microMacro, { color: COLORS.fat }]}>F:{meal.fat}g</Text>
              </View>
            </View>
            <Text style={styles.mealCal}>{meal.calories}</Text>
          </View>
        ))}
      </Card>

      {/* Metrics */}
      <Card style={styles.metricsCard}>
        <Text style={styles.metricsTitle}>Body Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricTile label="BMR" value={calc.bmr} color={COLORS.badge} />
          <MetricTile label="TDEE" value={calc.tdee} color={COLORS.protein} />
          <MetricTile label="Target" value={calc.daily_calories} color={COLORS.primary} />
          <MetricTile
            label={goal === 'lose_weight' ? 'Deficit' : 'Surplus'}
            value={Math.abs(calc.deficit_or_surplus)}
            color={COLORS.xpGold}
          />
        </View>
        <Text style={styles.rateText}>Weekly rate: {calc.weekly_weight_change_kg} kg/week</Text>
      </Card>

      {/* Supplements */}
      {report.supplementRecommendations.length > 0 && (
        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.collapsibleHeader}
            onPress={() => setShowSupplements(!showSupplements)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight }]}>
                <Feather name="shield" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Supplements</Text>
                <Text style={styles.cardSubtitle}>
                  {report.supplementRecommendations.length} recommended
                </Text>
              </View>
            </View>
            <Feather
              name={showSupplements ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          {showSupplements && (
            <View style={styles.supplementList}>
              {report.supplementRecommendations.map((supp, i) => (
                <View key={i} style={styles.suppRow}>
                  <Feather name="check-circle" size={14} color={COLORS.primary} />
                  <Text style={styles.suppText}>{supp}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Feather name="info" size={12} color={COLORS.textMuted} />
        <Text style={styles.disclaimerText}>
          AI-generated plan with Mifflin-St Jeor BMR calculations. Consult a healthcare provider
          before starting.
        </Text>
      </View>
    </ScrollView>
  );
}

function MetricTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.metricTile}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },

  // Gamification bar
  gamificationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  gameStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  gameDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 4,
  },
  streakIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2B1508',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  levelText: {
    fontFamily: 'Urbanist_800ExtraBold',
    fontSize: 12,
    color: COLORS.primary,
  },
  xpIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2B2508',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameStatValue: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
    color: COLORS.text,
  },
  gameStatLabel: {
    fontFamily: 'Urbanist_400Regular',
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  xpBarContainer: {
    width: 42,
    height: 3.5,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 2,
    marginTop: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  // Calorie card
  calorieCard: {
    padding: SPACING.md,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  calorieRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  calorieNum: {
    fontFamily: 'Urbanist_800ExtraBold',
    fontSize: 17,
    color: COLORS.primary,
    lineHeight: 20,
  },
  calorieSuffix: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 9,
    color: COLORS.primary,
    marginTop: -1,
  },
  calorieInfo: {
    flex: 1,
  },
  calorieTitle: {
    ...FONTS.bodySemiBold,
    color: COLORS.text,
    fontSize: 15,
  },
  calorieSub: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  macroMiniRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  macroMini: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 11,
  },
  xpReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#2B2508',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#2B2508',
  },
  xpRewardText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 10,
    color: COLORS.xpGold,
  },

  // Cards
  card: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...FONTS.captionMedium,
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
  cardSubtitle: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewAllText: {
    ...FONTS.smallMedium,
    color: COLORS.primary,
  },

  // Rest day
  restDay: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  restDayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  restDayText: {
    ...FONTS.bodySemiBold,
    color: COLORS.text,
  },
  restDayHint: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },

  // Workout
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Urbanist_800ExtraBold',
    color: COLORS.primary,
    fontSize: 20,
  },
  statLabel: {
    ...FONTS.small,
    color: COLORS.textMuted,
    marginTop: 2,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.borderLight,
  },
  exercisePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    gap: SPACING.sm,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  exerciseName: {
    ...FONTS.caption,
    color: COLORS.text,
    flex: 1,
  },
  exerciseDetail: {
    ...FONTS.smallMedium,
    color: COLORS.primary,
  },
  moreText: {
    ...FONTS.smallMedium,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Meals
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 10,
  },
  mealIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...FONTS.captionMedium,
    color: COLORS.text,
  },
  mealMacros: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },
  microMacro: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 10,
  },
  mealCal: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 13,
    color: COLORS.primary,
  },

  // Metrics
  metricsCard: {
    padding: SPACING.md,
  },
  metricsTitle: {
    ...FONTS.bodySemiBold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontSize: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  metricTile: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontFamily: 'Urbanist_800ExtraBold',
    fontSize: 20,
  },
  metricLabel: {
    ...FONTS.small,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 3,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  rateText: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
  },

  // Supplements
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supplementList: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  suppRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  suppText: {
    ...FONTS.caption,
    color: COLORS.text,
    flex: 1,
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  disclaimerText: {
    fontFamily: 'Urbanist_400Regular',
    fontSize: 10,
    color: COLORS.textMuted,
    flex: 1,
    lineHeight: 15,
  },
});
