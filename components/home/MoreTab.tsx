import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AffiliateSection } from '../report/AffiliateSection';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { AIReport, AffiliateLink } from '../../types';

interface MoreTabProps {
  report: AIReport;
  goal: string;
  currentWeight: number;
  targetWeight: number;
  weightUnit: string;
  timelineWeeks: number;
  affiliates: AffiliateLink[];
  onNewPlan: () => void;
}

export function MoreTab({
  report,
  goal,
  currentWeight,
  targetWeight,
  weightUnit,
  timelineWeeks,
  affiliates,
  onNewPlan,
}: MoreTabProps) {
  const calc = report.calculated;
  const delta = Math.abs(currentWeight - targetWeight);
  const goalText = goal === 'lose_weight' ? 'lose' : 'gain';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Achievements Preview */}
      <Card glow style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#1F0D2B' }]}>
            <Feather name="award" size={18} color={COLORS.badge} />
          </View>
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>
        <View style={styles.achievementGrid}>
          <AchievementBadge icon="zap" label="First Plan" unlocked />
          <AchievementBadge icon="target" label="Goal Setter" unlocked />
          <AchievementBadge icon="trending-up" label="Week 1" unlocked={false} />
          <AchievementBadge icon="award" label="Consistent" unlocked={false} />
        </View>
      </Card>

      {/* Plan Overview */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight }]}>
            <Feather name="target" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionTitle}>Plan Overview</Text>
        </View>
        <View style={styles.overviewGrid}>
          <OverviewItem
            icon="flag"
            label="Goal"
            value={`${goalText} ${delta.toFixed(1)} ${weightUnit}`}
          />
          <OverviewItem icon="calendar" label="Timeline" value={`${timelineWeeks} weeks`} />
          <OverviewItem
            icon="trending-down"
            label="Weekly Rate"
            value={`${calc.weekly_weight_change_kg} kg/wk`}
          />
          <OverviewItem icon="zap" label="Daily Calories" value={`${calc.daily_calories} kcal`} />
        </View>
      </Card>

      {/* Detailed Metrics */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#0D1A2B' }]}>
            <Feather name="bar-chart-2" size={18} color="#60A5FA" />
          </View>
          <Text style={styles.sectionTitle}>Detailed Metrics</Text>
        </View>
        <View style={styles.metricsGrid}>
          <MetricRow label="BMR (Basal Metabolic Rate)" value={`${calc.bmr} kcal`} />
          <MetricRow label="TDEE (Total Daily Expenditure)" value={`${calc.tdee} kcal`} />
          <MetricRow label="Daily Calorie Target" value={`${calc.daily_calories} kcal`} highlight />
          <MetricRow
            label={goal === 'lose_weight' ? 'Caloric Deficit' : 'Caloric Surplus'}
            value={`${Math.abs(calc.deficit_or_surplus)} kcal`}
          />
        </View>
        <View style={styles.macroBars}>
          <MacroBar
            label="Protein"
            value={calc.protein_g}
            max={calc.protein_g + calc.carbs_g + calc.fat_g}
            color="#60A5FA"
          />
          <MacroBar
            label="Carbs"
            value={calc.carbs_g}
            max={calc.protein_g + calc.carbs_g + calc.fat_g}
            color={COLORS.xpGold}
          />
          <MacroBar
            label="Fat"
            value={calc.fat_g}
            max={calc.protein_g + calc.carbs_g + calc.fat_g}
            color="#FF5252"
          />
        </View>
      </Card>

      {/* Supplements */}
      {report.supplementRecommendations.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight }]}>
              <Feather name="shield" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Supplements</Text>
          </View>
          {report.supplementRecommendations.map((supp, i) => (
            <View key={i} style={styles.suppRow}>
              <Feather name="check-circle" size={14} color={COLORS.primary} />
              <Text style={styles.suppText}>{supp}</Text>
            </View>
          ))}
        </Card>
      )}

      {affiliates.length > 0 && <AffiliateSection products={affiliates} />}

      {/* AI Summary */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#2B2508' }]}>
            <Feather name="cpu" size={18} color={COLORS.xpGold} />
          </View>
          <Text style={styles.sectionTitle}>AI Summary</Text>
        </View>
        <Text style={styles.summaryText}>{report.summary}</Text>
      </Card>

      <View style={styles.disclaimer}>
        <Feather name="info" size={12} color={COLORS.textMuted} />
        <Text style={styles.disclaimerText}>
          AI-generated plan with Mifflin-St Jeor BMR. Consult a healthcare provider before starting.
        </Text>
      </View>

      <View style={styles.newPlanSection}>
        <Button title="Generate New Plan" onPress={onNewPlan} variant="outline" />
      </View>
    </ScrollView>
  );
}

function AchievementBadge({
  icon,
  label,
  unlocked,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  unlocked: boolean;
}) {
  return (
    <View style={[styles.badge, unlocked && styles.badgeUnlocked]}>
      <View style={[styles.badgeIcon, unlocked && styles.badgeIconUnlocked]}>
        <Feather name={icon} size={18} color={unlocked ? COLORS.xpGold : COLORS.textMuted} />
      </View>
      <Text style={[styles.badgeLabel, unlocked && styles.badgeLabelUnlocked]}>{label}</Text>
    </View>
  );
}

function OverviewItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.overviewItem}>
      <Feather name={icon} size={14} color={COLORS.primary} />
      <View style={styles.overviewTextCol}>
        <Text style={styles.overviewLabel}>{label}</Text>
        <Text style={styles.overviewValue}>{value}</Text>
      </View>
    </View>
  );
}

function MetricRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, highlight && { color: COLORS.primary }]}>{value}</Text>
    </View>
  );
}

function MacroBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={styles.macroBarRow}>
      <View style={styles.macroBarLabelRow}>
        <Text style={[styles.macroBarLabel, { color }]}>{label}</Text>
        <Text style={styles.macroBarValue}>{value}g</Text>
      </View>
      <View style={styles.macroBarTrack}>
        <View style={[styles.macroBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.screenPadding, paddingBottom: SPACING.xxl, gap: SPACING.md },
  card: { padding: SPACING.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontFamily: 'Urbanist_700Bold', color: COLORS.text, fontSize: 16 },

  // Achievements
  achievementGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  badge: { alignItems: 'center', gap: 4, opacity: 0.4 },
  badgeUnlocked: { opacity: 1 },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  badgeIconUnlocked: {
    backgroundColor: '#2B2508',
    borderColor: COLORS.xpGold,
    shadowColor: COLORS.xpGold,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600' },
  badgeLabelUnlocked: { color: COLORS.xpGold },

  // Overview
  overviewGrid: { gap: SPACING.sm },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  overviewTextCol: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  overviewLabel: { ...FONTS.caption, color: COLORS.textSecondary },
  overviewValue: { fontFamily: 'Urbanist_600SemiBold', color: COLORS.text, fontSize: 14 },

  // Metrics
  metricsGrid: { gap: 2, marginBottom: SPACING.md },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  metricLabel: { ...FONTS.caption, color: COLORS.textSecondary, flex: 1 },
  metricValue: { fontFamily: 'Urbanist_700Bold', color: COLORS.text, fontSize: 14 },

  // Macro bars
  macroBars: { gap: SPACING.sm },
  macroBarRow: { gap: 4 },
  macroBarLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroBarLabel: { ...FONTS.small, fontWeight: '600' },
  macroBarValue: { ...FONTS.small, color: COLORS.textSecondary, fontWeight: '600' },
  macroBarTrack: {
    height: 6,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBarFill: { height: '100%', borderRadius: 3 },

  // Supplements
  suppRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 6 },
  suppText: { ...FONTS.caption, color: COLORS.text, flex: 1 },

  // Summary
  summaryText: { ...FONTS.caption, color: COLORS.textSecondary, lineHeight: 22 },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  disclaimerText: { fontSize: 10, color: COLORS.textMuted, flex: 1, lineHeight: 14 },
  newPlanSection: { paddingBottom: SPACING.lg },
});
