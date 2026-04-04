import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
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

  const fetchPlan = useCallback(async () => {
    if (!goal || !currentWeight || !targetWeight || !timelineWeeks || !gender || !age || !heightCm || !activityLevel) return;

    setLoading(true);
    setError(null);

    try {
      const report = await generateFitnessPlan(
        goal,
        currentWeight,
        targetWeight,
        weightUnit,
        timelineWeeks,
        gender,
        age,
        heightCm,
        activityLevel
      );
      setReport(report);
      const matched = matchAffiliates(report);
      setAffiliates(matched);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
        setError('API quota exceeded. Please wait a minute and try again.');
      } else {
        setError(msg || 'Failed to generate plan. Please try again.');
      }
    }
  }, [goal, currentWeight, targetWeight, weightUnit, timelineWeeks, gender, age, heightCm, activityLevel]);

  useEffect(() => {
    if (!aiReport && !isLoading) {
      fetchPlan();
    }
  }, [aiReport, isLoading]);

  useEffect(() => {
    if (aiReport) {
      const matched = matchAffiliates(aiReport);
      setAffiliates(matched);
    }
  }, [aiReport]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingTitle}>Creating your personalized plan...</Text>
        <Text style={styles.loadingSubtitle}>Calculating your BMR, TDEE & macros</Text>
        <View style={styles.loadingSteps}>
          <LoadingStep icon="cpu" text="Computing metabolic rate" />
          <LoadingStep icon="target" text="Setting calorie targets" />
          <LoadingStep icon="activity" text="Building workout plan" />
          <LoadingStep icon="coffee" text="Designing meal plan" />
        </View>
      </View>
    );
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
        <Text style={styles.errorTitle}>No data available</Text>
        <Button title="Generate Plan" onPress={() => fetchPlan()} />
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

function LoadingStep({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.loadingStep}>
      <Feather name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.loadingStepText}>{text}</Text>
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
  loadingTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.text,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  loadingSteps: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  loadingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingStepText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
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
