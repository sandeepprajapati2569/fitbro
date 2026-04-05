import { View, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

interface ProgressBarProps {
  steps: number;
  currentStep: number;
  onStepPress?: (step: number) => void;
}

export function ProgressBar({ steps, currentStep, onStepPress }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: steps }).map((_, i) => (
        <View key={i} style={[styles.stepRow, i === steps - 1 && styles.lastStepRow]}>
          <Pressable
            onPress={() => onStepPress?.(i)}
            hitSlop={8}
            disabled={i >= currentStep}
          >
            <View
              style={[
                styles.dot,
                i <= currentStep ? styles.dotActive : styles.dotInactive,
              ]}
            />
          </Pressable>
          {i < steps - 1 && (
            <View
              style={[
                styles.line,
                i < currentStep ? styles.lineActive : styles.lineInactive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    alignSelf: 'center',
    width: '70%',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lastStepRow: {
    flex: 0,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    backgroundColor: COLORS.border,
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  lineActive: {
    backgroundColor: COLORS.primary,
  },
  lineInactive: {
    backgroundColor: COLORS.border,
  },
});
