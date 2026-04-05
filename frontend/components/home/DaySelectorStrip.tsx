import { useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';

interface DaySelectorStripProps {
  days: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  todayIndex?: number;
}

function getShortDay(day: string): string {
  const map: Record<string, string> = {
    monday: 'MON',
    tuesday: 'TUE',
    wednesday: 'WED',
    thursday: 'THU',
    friday: 'FRI',
    saturday: 'SAT',
    sunday: 'SUN',
  };
  return map[day.toLowerCase()] || day.slice(0, 3).toUpperCase();
}

function getDayNum(day: string, index: number): string {
  // Show a simple day number
  return String(index + 1);
}

export function DaySelectorStrip({
  days,
  selectedIndex,
  onSelect,
  todayIndex,
}: DaySelectorStripProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollRef.current && selectedIndex > 2) {
      scrollRef.current.scrollTo({ x: (selectedIndex - 2) * 72, animated: true });
    }
  }, [selectedIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day, index) => {
        const isSelected = index === selectedIndex;
        const isToday = index === todayIndex;

        return (
          <TouchableOpacity
            key={day}
            style={[styles.dayPill, isSelected && styles.dayPillSelected]}
            onPress={() => onSelect(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayShort, isSelected && styles.dayShortSelected]}>
              {getShortDay(day)}
            </Text>
            <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
              {getDayNum(day, index)}
            </Text>
            {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.screenPadding,
    gap: 8,
    paddingBottom: SPACING.sm,
  },
  dayPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minWidth: 54,
    gap: 2,
  },
  dayPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  dayShort: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  dayShortSelected: {
    color: 'rgba(0,0,0,0.7)',
  },
  dayNum: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  dayNumSelected: {
    color: '#000',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  todayDotSelected: {
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
});
