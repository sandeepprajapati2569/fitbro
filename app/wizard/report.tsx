import { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WorkoutPlan } from '../../components/report/WorkoutPlan';
import { MealPlan } from '../../components/report/MealPlan';
import { AffiliateSection } from '../../components/report/AffiliateSection';
import { useWizardStore } from '../../store/useWizardStore';
import { generateFitnessPlan } from '../../lib/generate-plan';
import { matchAffiliates } from '../../lib/affiliates';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { AffiliateLink } from '../../types';

export default function ReportScreen() {
  const {
    goal,
    currentWeight,
    targetWeight,
    weightUnit,
    timelineWeeks,
    gender,
    age,
    heightCm,
    activityLevel,
    aiReport,
    isLoading,
    error,
    setReport,
    setLoading,
    setError,
  } = useWizardStore();

  const [affiliates, setAffiliates] = useState<AffiliateLink[]>([]);

  const hasAllData = !!(goal && currentWeight && targetWeight && timelineWeeks && gender && age && heightCm && activityLevel);

  const fetchPlan = async () => {
    // Read directly from the store to avoid stale closure values
    const state = useWizardStore.getState();
    const {
      goal: g,
      currentWeight: cw,
      targetWeight: tw,
      weightUnit: wu,
      timelineWeeks: tw2,
      gender: gen,
      age: a,
      heightCm: h,
      activityLevel: al,
    } = state;

    if (!g || !cw || !tw || !tw2 || !gen || !a || !h || !al) {
      setError('Missing profile data. Please go back and fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const report = await generateFitnessPlan(g, cw, tw, wu, tw2, gen, a, h, al);
      setReport(report);
      const matched = matchAffiliates(report);
      setAffiliates(matched);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
        setError('API quota exceeded. Please wait a minute and try again.');
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        setError(msg || 'Failed to generate plan. Please try again.');
      }
    }
  };

  // Auto-fetch every time this screen gains focus, if no report exists
  useFocusEffect(
    useCallback(() => {
      const state = useWizardStore.getState();
      if (!state.aiReport) {
        fetchPlan();
      }
    }, [])
  );

  useEffect(() => {
    if (aiReport) {
      const matched = matchAffiliates(aiReport);
      setAffiliates(matched);
    }
  }, [aiReport]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button title="Try Again" onPress={() => fetchPlan()} />
      </View>
    );
  }

  if (!aiReport) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="clipboard" size={48} color={COLORS.textSecondary} />
        <Text style={styles.errorTitle}>Ready to generate your plan</Text>
        {!hasAllData && (
          <Text style={styles.errorMessage}>
            Please complete all wizard steps first (goal, weight, profile, timeline).
          </Text>
        )}
        <Button
          title="Generate Plan"
          onPress={() => fetchPlan()}
          disabled={!hasAllData}
        />
      </View>
    );
  }

  const delta = currentWeight && targetWeight ? Math.abs(currentWeight - targetWeight) : 0;
  const goalText = goal === 'lose_weight' ? 'lose' : 'gain';
  const calc = aiReport.calculated;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.reportContent}>
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.calorieCircle}>
          <Text style={styles.calorieNumber}>{aiReport.dailyCalorieTarget}</Text>
          <Text style={styles.calorieLabel}>cal/day</Text>
        </View>
        <Text style={styles.summaryTitle}>
          Your plan to {goalText} {delta.toFixed(1)} {weightUnit} in {timelineWeeks} weeks
        </Text>
        <Text style={styles.summaryText}>{aiReport.summary}</Text>
      </Card>

      {/* Calculated Metrics */}
      {calc && (
        <Card style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>Your Body Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricItem label="BMR" value={`${calc.bmr}`} unit="kcal" />
            <MetricItem label="TDEE" value={`${calc.tdee}`} unit="kcal" />
            <MetricItem label="Daily Target" value={`${calc.daily_calories}`} unit="kcal" />
            <MetricItem
              label={goal === 'lose_weight' ? 'Deficit' : 'Surplus'}
              value={`${Math.abs(calc.deficit_or_surplus)}`}
              unit="kcal"
            />
          </View>
          <View style={styles.macroRow}>
            <MacroBadge label="Protein" value={calc.protein_g} unit="g" color="#3B82F6" />
            <MacroBadge label="Carbs" value={calc.carbs_g} unit="g" color="#F59E0B" />
            <MacroBadge label="Fat" value={calc.fat_g} unit="g" color="#EF4444" />
          </View>
          <Text style={styles.rateText}>
            Weekly rate: {calc.weekly_weight_change_kg} kg/week
          </Text>
        </Card>
      )}

      {/* Workout Plan */}
      <View style={styles.section}>
        <WorkoutPlan workoutPlan={aiReport.workoutPlan} />
      </View>

      {/* Meal Plan */}
      <View style={styles.section}>
        <MealPlan mealPlan={aiReport.mealPlan} />
      </View>

      {/* Supplements */}
      {aiReport.supplementRecommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplement Recommendations</Text>
          <Card>
            {aiReport.supplementRecommendations.map((supp, i) => (
              <View key={i} style={styles.suppRow}>
                <Feather name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.suppText}>{supp}</Text>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Affiliate Products */}
      <View style={styles.section}>
        <AffiliateSection products={affiliates} />
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Feather name="info" size={14} color={COLORS.textSecondary} />
        <Text style={styles.disclaimerText}>
          This plan is AI-generated with scientifically calculated targets (Mifflin-St Jeor BMR).
          Consult a healthcare provider before starting any new fitness or nutrition program.
        </Text>
      </View>
    </ScrollView>
  );
}

const LOADING_STEPS = [
  { icon: 'cpu' as const, text: 'Computing metabolic rate' },
  { icon: 'target' as const, text: 'Setting calorie targets' },
  { icon: 'bar-chart-2' as const, text: 'Calculating macro split' },
  { icon: 'activity' as const, text: 'Building workout plan' },
  { icon: 'coffee' as const, text: 'Designing meal plan' },
];

function LoadingScreen() {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the spinner area
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Progress through steps
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(stepInterval);
  }, []);

  // Progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (activeStep + 1) / LOADING_STEPS.length,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [activeStep]);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.loadingContainer}>
      {/* Animated spinner circle */}
      <Animated.View style={[styles.spinnerCircle, { opacity: pulseAnim }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </Animated.View>

      <Text style={styles.loadingTitle}>Creating your personalized plan</Text>
      <Text style={styles.loadingSubtitle}>This may take 10-15 seconds</Text>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(((activeStep + 1) / LOADING_STEPS.length) * 100)}%</Text>
      </View>

      {/* Animated steps */}
      <View style={styles.loadingSteps}>
        {LOADING_STEPS.map((step, index) => {
          const isDone = index < activeStep;
          const isActive = index === activeStep;
          const isPending = index > activeStep;

          return (
            <View key={index} style={styles.loadingStep}>
              <View style={[
                styles.stepIconCircle,
                isDone && styles.stepIconDone,
                isActive && styles.stepIconActive,
              ]}>
                {isDone ? (
                  <Feather name="check" size={14} color="#fff" />
                ) : isActive ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Feather name={step.icon} size={14} color={COLORS.border} />
                )}
              </View>
              <Text style={[
                styles.loadingStepText,
                isDone && styles.stepTextDone,
                isActive && styles.stepTextActive,
                isPending && styles.stepTextPending,
              ]}>
                {step.text}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Elapsed time */}
      <Text style={styles.elapsedText}>{elapsed}s elapsed</Text>
    </View>
  );
}

function MetricItem({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function MacroBadge({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <View style={[styles.macroBadge, { backgroundColor: color + '15' }]}>
      <Text style={[styles.macroBadgeValue, { color }]}>{value}{unit}</Text>
      <Text style={[styles.macroBadgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  reportContent: {
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.xxl,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.screenPadding,
  },
  spinnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  loadingTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    ...FONTS.small,
    color: COLORS.primary,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  loadingSteps: {
    width: '100%',
    gap: SPACING.md,
  },
  loadingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    backgroundColor: COLORS.success,
  },
  stepIconActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  loadingStepText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  stepTextDone: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  stepTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  stepTextPending: {
    color: COLORS.border,
  },
  elapsedText: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },

  // Error
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.screenPadding,
    gap: SPACING.md,
  },
  errorTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.text,
  },
  errorMessage: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  // Summary
  summaryCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  calorieCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  calorieNumber: {
    ...FONTS.headlineBold,
    color: COLORS.primary,
    fontSize: 28,
  },
  calorieLabel: {
    ...FONTS.small,
    color: COLORS.primaryDark,
    marginTop: -2,
  },
  summaryTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  summaryText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Calculated Metrics
  metricsCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  metricsTitle: {
    ...FONTS.bodyMedium,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  metricItem: {
    alignItems: 'center',
    width: '25%',
    paddingVertical: SPACING.sm,
  },
  metricValue: {
    ...FONTS.headlineMedium,
    color: COLORS.primary,
    fontSize: 20,
  },
  metricUnit: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    marginTop: -2,
  },
  metricLabel: {
    ...FONTS.small,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  macroBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  macroBadgeValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  macroBadgeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  rateText: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  suppRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  suppText: {
    ...FONTS.body,
    color: COLORS.text,
    flex: 1,
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  disclaimerText: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
