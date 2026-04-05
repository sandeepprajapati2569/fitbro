import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Logo } from '../ui/Logo';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { CalculatedMetrics } from '../../types';

interface StickyHeaderProps {
  dailyCalories: number;
  goalText: string;
  calc: CalculatedMetrics;
  onNewPlan: () => void;
}

export function StickyHeader({ dailyCalories, goalText, calc, onNewPlan }: StickyHeaderProps) {
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

      {/* Right: Macro badges + refresh */}
      <View style={styles.rightSection}>
        <View style={styles.macroRow}>
          <View style={[styles.macroBadge, { backgroundColor: '#0D1A2B' }]}>
            <Text style={[styles.macroText, { color: COLORS.protein }]}>P {calc.protein_g}g</Text>
          </View>
          <View style={[styles.macroBadge, { backgroundColor: '#2B2508' }]}>
            <Text style={[styles.macroText, { color: COLORS.carbs }]}>C {calc.carbs_g}g</Text>
          </View>
          <View style={[styles.macroBadge, { backgroundColor: '#2B0D0D' }]}>
            <Text style={[styles.macroText, { color: COLORS.fat }]}>F {calc.fat_g}g</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onNewPlan} activeOpacity={0.7}>
          <Feather name="refresh-cw" size={15} color={COLORS.primary} />
        </TouchableOpacity>
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
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
  },
});
