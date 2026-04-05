import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StepWrapper } from '../../components/wizard/StepWrapper';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { NumberInput } from '../../components/ui/NumberInput';
import { Button } from '../../components/ui/Button';
import { useWizardStore } from '../../store/useWizardStore';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { Gender, ActivityLevel } from '../../types';

const ACTIVITY_OPTIONS: { value: ActivityLevel; title: string; desc: string; icon: keyof typeof Feather.glyphMap }[] = [
  { value: 'sedentary', title: 'Sedentary', desc: 'Little or no exercise', icon: 'monitor' },
  { value: 'lightly_active', title: 'Lightly Active', desc: '1-3 days/week', icon: 'sun' },
  { value: 'moderately_active', title: 'Moderate', desc: '3-5 days/week', icon: 'activity' },
  { value: 'very_active', title: 'Very Active', desc: '6-7 days/week', icon: 'zap' },
  { value: 'extra_active', title: 'Extra Active', desc: 'Intense daily + job', icon: 'award' },
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
          <Feather name="user" size={18} color={gender === 'male' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
          onPress={() => setGender('female')}
        >
          <Feather name="user" size={18} color={gender === 'female' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>Female</Text>
        </TouchableOpacity>
      </View>

      {/* Age & Height side by side */}
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

      {/* Activity Level - compact list */}
      <Text style={styles.label}>Activity Level</Text>
      <View style={styles.activityList}>
        {ACTIVITY_OPTIONS.map((opt) => {
          const isSelected = activityLevel === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.activityItem, isSelected && styles.activityItemActive]}
              onPress={() => setActivityLevel(opt.value)}
              activeOpacity={0.7}
            >
              <Feather
                name={opt.icon}
                size={20}
                color={isSelected ? COLORS.primary : COLORS.textSecondary}
              />
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, isSelected && styles.activityTitleActive]}>
                  {opt.title}
                </Text>
                <Text style={styles.activityDesc}>{opt.desc}</Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: SPACING.md,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F1F5F9',
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
    marginBottom: SPACING.xs,
  },
  halfInput: {
    flex: 1,
  },
  activityList: {
    gap: SPACING.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  activityItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  activityTextContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  activityTitle: {
    ...FONTS.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  activityTitleActive: {
    color: COLORS.primaryDark,
  },
  activityDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
});
