import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { DaySelectorStrip } from './DaySelectorStrip';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { MealDay } from '../../types';

interface MealsTabProps {
  mealPlan: MealDay[];
  todayIndex: number;
}

const MEAL_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  breakfast: 'sunrise',
  lunch: 'sun',
  dinner: 'moon',
  snack: 'coffee',
};
const MEAL_COLORS: Record<string, string> = {
  breakfast: '#FFD740',
  lunch: '#60A5FA',
  dinner: '#E040FB',
  snack: '#00E676',
};
const MEAL_BG_COLORS: Record<string, string> = {
  breakfast: '#2B2508',
  lunch: '#0D1A2B',
  dinner: '#1F0D2B',
  snack: '#0D2B1A',
};

export function MealsTab({ mealPlan, todayIndex }: MealsTabProps) {
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const day = mealPlan[selectedDay];

  return (
    <View style={styles.container}>
      <DaySelectorStrip
        days={mealPlan.map((d) => d.day)}
        selectedIndex={selectedDay}
        onSelect={(i) => {
          setSelectedDay(i);
          setExpandedMeal(null);
        }}
        todayIndex={todayIndex}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Day total */}
        <Card style={styles.totalCard}>
          <View style={styles.totalRow}>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: COLORS.primary }]}>
                {day?.totalCalories || 0}
              </Text>
              <Text style={styles.totalLabel}>Total Cal</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: '#60A5FA' }]}>
                {day?.meals.reduce((s, m) => s + m.protein, 0) || 0}g
              </Text>
              <Text style={styles.totalLabel}>Protein</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: COLORS.xpGold }]}>
                {day?.meals.reduce((s, m) => s + m.carbs, 0) || 0}g
              </Text>
              <Text style={styles.totalLabel}>Carbs</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: '#FF5252' }]}>
                {day?.meals.reduce((s, m) => s + m.fat, 0) || 0}g
              </Text>
              <Text style={styles.totalLabel}>Fat</Text>
            </View>
          </View>
        </Card>

        {day?.meals.map((meal, i) => {
          const isExpanded = expandedMeal === i;
          const mealColor = MEAL_COLORS[meal.type] || COLORS.primary;
          return (
            <Card key={i} style={styles.mealCard}>
              <TouchableOpacity
                style={styles.mealHeader}
                onPress={() => setExpandedMeal(isExpanded ? null : i)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.mealIcon,
                    { backgroundColor: MEAL_BG_COLORS[meal.type] || '#0D2B1A' },
                  ]}
                >
                  <Feather name={MEAL_ICONS[meal.type] || 'coffee'} size={18} color={mealColor} />
                </View>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealType}>{meal.type}</Text>
                  <Text style={styles.mealName} numberOfLines={1}>
                    {meal.name}
                  </Text>
                </View>
                <View style={styles.mealRight}>
                  <Text style={styles.mealCal}>{meal.calories} cal</Text>
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={COLORS.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.macroBar}>
                <View
                  style={[styles.macroSegment, { flex: meal.protein, backgroundColor: '#60A5FA' }]}
                />
                <View
                  style={[
                    styles.macroSegment,
                    { flex: meal.carbs, backgroundColor: COLORS.xpGold },
                  ]}
                />
                <View
                  style={[styles.macroSegment, { flex: meal.fat, backgroundColor: '#FF5252' }]}
                />
              </View>
              <View style={styles.macroLabels}>
                <Text style={[styles.macroLabel, { color: '#60A5FA' }]}>P: {meal.protein}g</Text>
                <Text style={[styles.macroLabel, { color: COLORS.xpGold }]}>C: {meal.carbs}g</Text>
                <Text style={[styles.macroLabel, { color: '#FF5252' }]}>F: {meal.fat}g</Text>
              </View>

              {isExpanded && meal.ingredients.length > 0 && (
                <View style={styles.ingredients}>
                  <Text style={styles.ingredientsTitle}>Ingredients</Text>
                  {meal.ingredients.map((ing, j) => (
                    <View key={j} style={styles.ingredientRow}>
                      <View style={styles.ingredientDot} />
                      <Text style={styles.ingredientText}>{ing}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
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
  totalCard: { padding: SPACING.md },
  totalRow: { flexDirection: 'row', alignItems: 'center' },
  totalItem: { flex: 1, alignItems: 'center' },
  totalValue: { fontFamily: 'Urbanist_800ExtraBold', fontSize: 17 },
  totalLabel: { ...FONTS.small, color: COLORS.textMuted, marginTop: 2, fontSize: 10 },
  totalDivider: { width: 1, height: 28, backgroundColor: COLORS.borderLight },
  mealCard: { padding: SPACING.md },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealInfo: { flex: 1 },
  mealType: { ...FONTS.small, color: COLORS.textMuted, textTransform: 'capitalize' },
  mealName: { ...FONTS.captionMedium, color: COLORS.text, fontWeight: '600' },
  mealRight: { alignItems: 'flex-end', gap: 2 },
  mealCal: { ...FONTS.captionMedium, color: COLORS.primary, fontWeight: '700' },
  macroBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: SPACING.sm,
    gap: 2,
  },
  macroSegment: { borderRadius: 2 },
  macroLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  macroLabel: { fontSize: 10, fontWeight: '600' },
  ingredients: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  ingredientsTitle: {
    ...FONTS.small,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 3,
  },
  ingredientDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary },
  ingredientText: { ...FONTS.small, color: COLORS.textSecondary, flex: 1 },
});
