import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';

export type SegmentKey = 'today' | 'workout' | 'meals' | 'more';

interface Segment {
  key: SegmentKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const SEGMENTS: Segment[] = [
  { key: 'today', label: 'Today', icon: 'home' },
  { key: 'workout', label: 'Workout', icon: 'activity' },
  { key: 'meals', label: 'Meals', icon: 'coffee' },
  { key: 'more', label: 'More', icon: 'grid' },
];

interface SegmentedControlProps {
  activeSegment: SegmentKey;
  onSegmentChange: (key: SegmentKey) => void;
}

export function SegmentedControl({ activeSegment, onSegmentChange }: SegmentedControlProps) {
  const activeIndex = SEGMENTS.findIndex((s) => s.key === activeSegment);
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const segmentWidth = containerWidth > 0 ? (containerWidth - 8) / SEGMENTS.length : 0;

  useEffect(() => {
    if (segmentWidth > 0) {
      Animated.spring(translateX, {
        toValue: activeIndex * segmentWidth,
        damping: 22,
        stiffness: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [activeIndex, segmentWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: segmentWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}
      {SEGMENTS.map((seg) => {
        const isActive = seg.key === activeSegment;
        return (
          <TouchableOpacity
            key={seg.key}
            style={styles.segment}
            onPress={() => onSegmentChange(seg.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Feather
              name={seg.icon}
              size={16}
              color={isActive ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
              {seg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    padding: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: '#0D2B1A',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 5,
    zIndex: 1,
  },
  segmentLabel: {
    ...FONTS.smallMedium,
    color: COLORS.textMuted,
  },
  segmentLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
