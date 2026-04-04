import { Stack, usePathname, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { COLORS, SPACING } from '../../lib/constants';

const STEPS = [
  { path: '/wizard/goal', label: 'Goal' },
  { path: '/wizard/weight', label: 'Weight' },
  { path: '/wizard/profile', label: 'Profile' },
  { path: '/wizard/timeline', label: 'Timeline' },
  { path: '/wizard/report', label: 'Report' },
];

export default function WizardLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const currentStep = STEPS.findIndex((s) => s.path === pathname);

  const handleStepPress = (step: number) => {
    if (step < currentStep) {
      router.push(STEPS[step].path as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <ProgressBar steps={STEPS.length} currentStep={currentStep} onStepPress={handleStepPress} />
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
});
