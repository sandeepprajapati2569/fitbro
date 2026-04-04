import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StepWrapper } from '../../components/wizard/StepWrapper';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { NumberInput } from '../../components/ui/NumberInput';
import { RadioOption } from '../../components/ui/RadioOption';
import { Button } from '../../components/ui/Button';
import { useWizardStore } from '../../store/useWizardStore';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { Gender, ActivityLevel } from '../../types';

const ACTIVITY_OPTIONS: { value: ActivityLevel; title: string; desc: string; icon: string }[] = [
  { value: 'sedentary', title: 'Sedentary', desc: 'Little or no exercise', icon: 'monitor' },
  { value: 'lightly_active', title: 'Lightly Active', desc: 'Exercise 1-3 days/week', icon: 'sun' },
  { value: 'moderately_active', title: 'Moderately Active', desc: 'Exercise 3-5 days/week', icon: 'activity' },
  { value: 'very_active', title: 'Very Active', desc: 'Exercise 6-7 days/week', icon: 'zap' },
  { value: 'extra_active', title: 'Extra Active', desc: 'Intense daily exercise + physical job', icon: 'award' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { setProfile } = useWizardStore();

  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);

  const ageNum = parseInt(age, 10);
  const heightNum = parseFloat(height);
  const isValid = gender && !isNaN(ageNum) && ageNum >= 13 && ageNum <= 100
    && !isNaN(heightNum) && heightNum >= 100 && heightNum <= 250
    && activityLevel;

  const handleContinue = () => {
    if (!isValid || !gender || !activityLevel) return;
    setProfile(gender, ageNum, heightNum, activityLevel);
    router.push('/wizard/timeline');
  };

  return (
    <StepWrapper
      footer={
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!isValid}
        />
      }
    >
      <SectionHeader
        title="Tell us about yourself"
        subtitle="We need this to calculate your exact calorie needs"
      />

      {/* Gender */}
      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderRow}>
        <TouchableOpacity
          style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
          onPress={() => setGender('male')}
        >
          <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
          onPress={() => setGender('female')}
        >
          <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>Female</Text>
        </TouchableOpacity>
      </View>

      {/* Age & Height */}
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <NumberInput
            label="Age"
            value={age}
            onChangeText={setAge}
            unit="yrs"
            placeholder="25"
          />
        </View>
        <View style={styles.halfInput}>
          <NumberInput
            label="Height"
            value={height}
            onChangeText={setHeight}
            unit="cm"
            placeholder="170"
          />
        </View>
      </View>

      {/* Activity Level */}
      <Text style={[styles.label, { marginTop: SPACING.lg }]}>Activity Level</Text>
      <View style={styles.activityList}>
        {ACTIVITY_OPTIONS.map((opt) => (
          <RadioOption
            key={opt.value}
            title={opt.title}
            description={opt.desc}
            icon={opt.icon as any}
            selected={activityLevel === opt.value}
            onPress={() => setActivityLevel(opt.value)}
          />
        ))}
      </View>
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  label: {
    ...FONTS.bodyMedium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  genderText: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  genderTextActive: {
    color: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfInput: {
    flex: 1,
  },
  activityList: {
    gap: SPACING.sm,
  },
});
