import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StepWrapper } from '../../components/wizard/StepWrapper';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { RadioOption } from '../../components/ui/RadioOption';
import { Button } from '../../components/ui/Button';
import { useWizardStore } from '../../store/useWizardStore';
import { SPACING } from '../../lib/constants';
import type { FitnessGoal } from '../../types';

export default function GoalScreen() {
  const router = useRouter();
  const { goal, setGoal } = useWizardStore();

  return (
    <StepWrapper
      footer={
        <Button
          title="Continue"
          onPress={() => router.push('/wizard/weight')}
          disabled={!goal}
        />
      }
    >
      <SectionHeader
        title="What's your fitness goal?"
        subtitle="Choose one to get started"
      />

      <View style={styles.options}>
        <RadioOption
          title="Lose Weight"
          description="Burn fat and get lean"
          icon="trending-down"
          selected={goal === 'lose_weight'}
          onPress={() => setGoal('lose_weight')}
        />
        <RadioOption
          title="Gain Weight"
          description="Build muscle and bulk up"
          icon="trending-up"
          selected={goal === 'gain_weight'}
          onPress={() => setGoal('gain_weight')}
        />
      </View>
    </StepWrapper>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
});
