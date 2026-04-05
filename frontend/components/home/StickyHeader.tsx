import { View, Text, StyleSheet } from 'react-native';
import { Logo } from '../ui/Logo';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { CalculatedMetrics } from '../../types';

interface StickyHeaderProps {
  dailyCalories: number;
  goalText: string;
  calc: CalculatedMetrics;
}

export function StickyHeader({ dailyCalories, goalText, calc }: StickyHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Left: Logo + goal info */}
      <View style={styles.leftSection}>
        <Logo size="small" showText={false} />
        <View style={styles.infoColumn}>
          <Text style={styles.title}>
            Fit<Text style={{ color: COLORS.primary }}>Goal</Text>
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {goalText}
          </Text>
        </View>
      </View>

      {/* Right: Macro badges */}
      <View style={styles.rightSection}>
        <View style={styles.macroRow}>
          <View style={[styles.macroBadge, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[styles.macroText, { color: COLORS.protein }]}>P {calc.protein_g}g</Text>
          </View>
          <View style={[styles.macroBadge, { backgroundColor: '#FFF8E1' }]}>
            <Text style={[styles.macroText, { color: COLORS.carbs }]}>C {calc.carbs_g}g</Text>
          </View>
          <View style={[styles.macroBadge, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.macroText, { color: COLORS.fat }]}>F {calc.fat_g}g</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  infoColumn: {
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontFamily: 'Urbanist_700Bold',
    fontWeight: '700',
    color: COLORS.text,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 4,
  },
  macroBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xs,
  },
  macroText: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 10,
  },
});
