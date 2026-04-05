import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { MealDay, Meal } from '../../types';

interface MealPlanProps {
  mealPlan: MealDay[];
}

const MEAL_ICONS: Record<Meal['type'], keyof typeof Feather.glyphMap> = {
  breakfast: 'sunrise',
  lunch: 'sun',
  dinner: 'moon',
  snack: 'coffee',
};

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[pillStyles.container, { backgroundColor: color + '15' }]}>
      <Text style={[pillStyles.text, { color }]}>
        {label}: {value}g
      </Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export function MealPlan({ mealPlan }: MealPlanProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(mealPlan[0]?.day || null);

  return (
    <View>
      <Text style={styles.sectionTitle}>Meal Plan</Text>
      {mealPlan.map((day) => (
        <Card key={day.day} style={styles.dayCard}>
          <TouchableOpacity
            style={styles.dayHeader}
            onPress={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
            activeOpacity={0.7}
          >
            <View style={styles.dayInfo}>
              <Feather name="calendar" size={18} color={COLORS.primary} />
              <Text style={styles.dayName}>{day.day}</Text>
            </View>
            <View style={styles.dayMeta}>
              <Text style={styles.calories}>{day.totalCalories} cal</Text>
              <Feather
                name={expandedDay === day.day ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {expandedDay === day.day && (
            <View style={styles.meals}>
              {day.meals.map((meal, i) => (
                <View key={i} style={styles.mealRow}>
                  <View style={styles.mealHeader}>
                    <Feather
                      name={MEAL_ICONS[meal.type] || 'coffee'}
                      size={16}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.mealType}>{meal.type}</Text>
                    <Text style={styles.mealCal}>{meal.calories} cal</Text>
                  </View>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <View style={styles.macros}>
                    <MacroPill label="P" value={meal.protein} color="#3B82F6" />
                    <MacroPill label="C" value={meal.carbs} color="#F59E0B" />
                    <MacroPill label="F" value={meal.fat} color="#EF4444" />
                  </View>
                  {meal.ingredients.length > 0 && (
                    <Text style={styles.ingredients}>
                      {meal.ingredients.join(' · ')}
                    </Text>
                  )}
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
  calories: {
    ...FONTS.caption,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  meals: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  mealRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: SPACING.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  mealType: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    flex: 1,
  },
  mealCal: {
    ...FONTS.small,
    color: COLORS.textSecondary,
  },
  mealName: {
    ...FONTS.captionMedium,
    color: COLORS.text,
    marginBottom: 6,
  },
  macros: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  ingredients: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
