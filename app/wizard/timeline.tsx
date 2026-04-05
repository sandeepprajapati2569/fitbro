import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { StepWrapper } from '../../components/wizard/StepWrapper';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useWizardStore } from '../../store/useWizardStore';
import { isAggressiveTimeline } from '../../lib/validation';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import { Feather } from '@expo/vector-icons';

function weeksToReadable(weeks: number): string {
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'}`;
  const months = Math.round(weeks / 4.33);
  if (months < 12) return `About ${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
}

export default function TimelineScreen() {
  const router = useRouter();
  const { currentWeight, targetWeight, setTimeline, isLoading } = useWizardStore();
  const [weeks, setWeeks] = useState(12);

  const aggressive =
    currentWeight && targetWeight
      ? isAggressiveTimeline(currentWeight, targetWeight, weeks)
      : false;

  const handleGenerate = async () => {
    setTimeline(weeks);
    router.push('/wizard/report');
  };

  return (
    <StepWrapper
      footer={
        <Button
          title="Generate My Plan"
          onPress={handleGenerate}
          loading={isLoading}
        />
      }
    >
      <SectionHeader
        title="When do you want to reach your goal?"
        subtitle="Set a realistic timeframe for best results"
      />

      <Card>
        <Text style={styles.weeksValue}>{weeks}</Text>
        <Text style={styles.weeksLabel}>weeks</Text>
        <Text style={styles.readable}>{weeksToReadable(weeks)}</Text>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>1 wk</Text>
          <View style={styles.sliderWrapper}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={104}
              step={1}
              value={weeks}
              onValueChange={setWeeks}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.border}
              thumbTintColor={COLORS.primary}
            />
          </View>
          <Text style={styles.sliderLabel}>2 yr</Text>
        </View>

        <View style={styles.quickPicks}>
          {[4, 8, 12, 24, 52].map((w) => (
            <View key={w} style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}>
              <Button
                title={w < 52 ? `${w}w` : '1yr'}
                variant={weeks === w ? 'primary' : 'outline'}
                onPress={() => setWeeks(w)}
                style={styles.quickPickButton}
              />
            </View>
          ))}
        </View>
      </Card>

      {aggressive && (
        <View style={styles.warningContainer}>
          <Feather name="alert-triangle" size={18} color="#D97706" />
          <Text style={styles.warningText}>
            This is an aggressive timeline. Losing more than 1 kg/week may not be sustainable. Consider consulting a healthcare provider.
          </Text>
        </View>
      )}
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  weeksValue: {
    ...FONTS.headlineBold,
    fontSize: 48,
    color: COLORS.primary,
    textAlign: 'center',
  },
  weeksLabel: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: -4,
  },
  readable: {
    ...FONTS.bodyMedium,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sliderWrapper: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabel: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    width: 30,
    textAlign: 'center',
  },
  quickPicks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.lg,
    justifyContent: 'center',
  },
  quickPickButton: {
    height: 40,
    paddingHorizontal: SPACING.md,
    minWidth: 56,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    ...FONTS.caption,
    color: '#92400E',
    flex: 1,
    lineHeight: 20,
  },
});
