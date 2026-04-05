import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StepWrapper } from '../../components/wizard/StepWrapper';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { NumberInput } from '../../components/ui/NumberInput';
import { Button } from '../../components/ui/Button';
import { useWizardStore } from '../../store/useWizardStore';
import { weightSchema, validateWeightsForGoal } from '../../lib/validation';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { WeightUnit } from '../../types';

export default function WeightScreen() {
  const router = useRouter();
  const { goal, weightUnit, setWeights } = useWizardStore();

  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentNum = parseFloat(currentWeight);
  const targetNum = parseFloat(targetWeight);
  const hasValidNumbers = !isNaN(currentNum) && !isNaN(targetNum);

  const delta = hasValidNumbers ? Math.abs(currentNum - targetNum) : 0;
  const deltaText = hasValidNumbers && goal
    ? `You want to ${goal === 'lose_weight' ? 'lose' : 'gain'} ${delta.toFixed(1)} ${unit}`
    : '';

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};

    const result = weightSchema.safeParse({
      currentWeight: currentNum,
      targetWeight: targetNum,
    });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    if (goal) {
      const goalError = validateWeightsForGoal(currentNum, targetNum, goal);
      if (goalError) {
        newErrors.targetWeight = goalError;
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});
    setWeights(currentNum, targetNum, unit);
    router.push('/wizard/profile');
  };

  return (
    <StepWrapper
      footer={
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!hasValidNumbers}
        />
      }
    >
      <SectionHeader
        title="Tell us about your weight"
        subtitle="Enter your current and target weight"
      />

      <View style={styles.unitToggle}>
        <TouchableOpacity
          style={[styles.unitButton, unit === 'kg' && styles.unitButtonActive]}
          onPress={() => setUnit('kg')}
        >
          <Text style={[styles.unitText, unit === 'kg' && styles.unitTextActive]}>kg</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.unitButton, unit === 'lbs' && styles.unitButtonActive]}
          onPress={() => setUnit('lbs')}
        >
          <Text style={[styles.unitText, unit === 'lbs' && styles.unitTextActive]}>lbs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputs}>
        <NumberInput
          label="Current Weight"
          value={currentWeight}
          onChangeText={setCurrentWeight}
          unit={unit}
          placeholder={unit === 'kg' ? '75' : '165'}
          error={errors.currentWeight}
        />
        <NumberInput
          label="Target Weight"
          value={targetWeight}
          onChangeText={setTargetWeight}
          unit={unit}
          placeholder={unit === 'kg' ? '65' : '143'}
          error={errors.targetWeight}
        />
      </View>

      {deltaText ? (
        <View style={styles.deltaContainer}>
          <Text style={styles.deltaText}>{deltaText}</Text>
        </View>
      ) : null}
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    marginBottom: SPACING.lg,
    alignSelf: 'flex-start',
  },
  unitButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  unitButtonActive: {
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  unitText: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  unitTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  inputs: {
    gap: SPACING.sm,
  },
  deltaContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  deltaText: {
    ...FONTS.bodyMedium,
    color: COLORS.primaryDark,
  },
});
