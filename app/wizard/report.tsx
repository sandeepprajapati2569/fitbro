import { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { useWizardStore } from '../../store/useWizardStore';
import { generateFitnessPlan } from '../../lib/generate-plan';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';

export default function ReportScreen() {
  const router = useRouter();
  const {
    aiReport,
    isLoading,
    error,
    setReport,
    setLoading,
    setError,
  } = useWizardStore();

  const fetchPlan = async () => {
    const state = useWizardStore.getState();
    const {
      goal: g,
      currentWeight: cw,
      targetWeight: tw,
      weightUnit: wu,
      timelineWeeks: tw2,
      gender: gen,
      age: a,
      heightCm: h,
      activityLevel: al,
    } = state;

    if (!g || !cw || !tw || !tw2 || !gen || !a || !h || !al) {
      setError('Missing profile data. Please go back and fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Run fetch and minimum display timer in parallel
      // 6s minimum so all 5 loading steps complete visually
      const minDelay = new Promise((resolve) => setTimeout(resolve, 6000));
      const [report] = await Promise.all([
        generateFitnessPlan(g, cw, tw, wu, tw2, gen, a, h, al),
        minDelay,
      ]);
      setReport(report);
      // Navigate to home screen after successful generation
      router.replace('/home');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
        setError('API quota exceeded. Please wait a minute and try again.');
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        setError(msg || 'Failed to generate plan. Please try again.');
      }
    }
  };

  // Auto-fetch when screen gains focus and no report exists
  useFocusEffect(
    useCallback(() => {
      const state = useWizardStore.getState();
      if (!state.aiReport && !state.isLoading) {
        fetchPlan();
      } else if (state.aiReport) {
        // Already have a report, go to home
        router.replace('/home');
      }
    }, [])
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button title="Try Again" onPress={() => fetchPlan()} />
      </View>
    );
  }

  // Always show loading screen while generating
  return <LoadingScreen />;
}

const LOADING_STEPS = [
  { icon: 'cpu' as const, text: 'Computing metabolic rate' },
  { icon: 'target' as const, text: 'Setting calorie targets' },
  { icon: 'bar-chart-2' as const, text: 'Calculating macro split' },
  { icon: 'activity' as const, text: 'Building workout plan' },
  { icon: 'coffee' as const, text: 'Designing meal plan' },
];

function LoadingScreen() {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the spinner area
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Progress through steps — 1s per step so all 5 complete in ~5s
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(stepInterval);
  }, []);

  // Progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (activeStep + 1) / LOADING_STEPS.length,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [activeStep]);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.loadingContainer}>
      {/* Animated spinner circle */}
      <Animated.View style={[styles.spinnerCircle, { opacity: pulseAnim }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </Animated.View>

      <Text style={styles.loadingTitle}>Creating your personalized plan</Text>
      <Text style={styles.loadingSubtitle}>This may take a few seconds</Text>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressText}>
          {Math.round(((activeStep + 1) / LOADING_STEPS.length) * 100)}%
        </Text>
      </View>

      {/* Animated steps */}
      <View style={styles.loadingSteps}>
        {LOADING_STEPS.map((step, index) => {
          const isDone = index < activeStep;
          const isActive = index === activeStep;
          const isPending = index > activeStep;

          return (
            <View key={index} style={styles.loadingStep}>
              <View
                style={[
                  styles.stepIconCircle,
                  isDone && styles.stepIconDone,
                  isActive && styles.stepIconActive,
                ]}
              >
                {isDone ? (
                  <Feather name="check" size={14} color="#fff" />
                ) : isActive ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Feather name={step.icon} size={14} color={COLORS.border} />
                )}
              </View>
              <Text
                style={[
                  styles.loadingStepText,
                  isDone && styles.stepTextDone,
                  isActive && styles.stepTextActive,
                  isPending && styles.stepTextPending,
                ]}
              >
                {step.text}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Elapsed time */}
      <Text style={styles.elapsedText}>{elapsed}s elapsed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.screenPadding,
  },
  spinnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  loadingTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    ...FONTS.small,
    color: COLORS.primary,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  loadingSteps: {
    width: '100%',
    gap: SPACING.md,
  },
  loadingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    backgroundColor: COLORS.success,
  },
  stepIconActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  loadingStepText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  stepTextDone: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  stepTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  stepTextPending: {
    color: COLORS.border,
  },
  elapsedText: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },

  // Error
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.screenPadding,
    gap: SPACING.md,
  },
  errorTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.text,
  },
  errorMessage: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});
