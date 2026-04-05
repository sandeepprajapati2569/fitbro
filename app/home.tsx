import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWizardStore } from '../store/useWizardStore';
import { matchAffiliates } from '../lib/affiliates';
import { StickyHeader } from '../components/home/StickyHeader';
import { SegmentedControl } from '../components/home/SegmentedControl';
import { TodayTab } from '../components/home/TodayTab';
import { WorkoutTab } from '../components/home/WorkoutTab';
import { MealsTab } from '../components/home/MealsTab';
import { MoreTab } from '../components/home/MoreTab';
import { COLORS } from '../lib/constants';
import type { SegmentKey } from '../components/home/SegmentedControl';
import type { AffiliateLink } from '../types';

function getTodayIndex(dayNames: string[]): number {
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = weekdays[new Date().getDay()];
  const idx = dayNames.findIndex((d) => d.toLowerCase() === todayName);
  return idx >= 0 ? idx : 0;
}

export default function HomeScreen() {
  const router = useRouter();
  const { goal, currentWeight, targetWeight, weightUnit, timelineWeeks, aiReport, reset } =
    useWizardStore();

  const [activeSegment, setActiveSegment] = useState<SegmentKey>('today');
  const [affiliates, setAffiliates] = useState<AffiliateLink[]>([]);

  useEffect(() => {
    if (aiReport) {
      setAffiliates(matchAffiliates(aiReport));
    }
  }, [aiReport]);

  // If no report, redirect to wizard
  useEffect(() => {
    if (!aiReport) {
      router.replace('/wizard/goal');
    }
  }, [aiReport]);

  if (!aiReport) return null;

  const delta = currentWeight && targetWeight ? Math.abs(currentWeight - targetWeight) : 0;
  const goalText =
    goal === 'lose_weight'
      ? `Lose ${delta.toFixed(1)} ${weightUnit} in ${timelineWeeks}w`
      : `Gain ${delta.toFixed(1)} ${weightUnit} in ${timelineWeeks}w`;
  const calc = aiReport.calculated;

  const todayIndex = getTodayIndex(aiReport.workoutPlan.map((d) => d.day));

  const handleNewPlan = () => {
    reset();
    router.replace('/wizard/goal');
  };

  const renderContent = () => {
    switch (activeSegment) {
      case 'today':
        return (
          <TodayTab
            report={aiReport}
            goal={goal || ''}
            todayIndex={todayIndex}
            onViewWorkout={() => setActiveSegment('workout')}
            onViewMeals={() => setActiveSegment('meals')}
          />
        );
      case 'workout':
        return <WorkoutTab workoutPlan={aiReport.workoutPlan} todayIndex={todayIndex} />;
      case 'meals':
        return <MealsTab mealPlan={aiReport.mealPlan} todayIndex={todayIndex} />;
      case 'more':
        return (
          <MoreTab
            report={aiReport}
            goal={goal || ''}
            currentWeight={currentWeight || 0}
            targetWeight={targetWeight || 0}
            weightUnit={weightUnit}
            timelineWeeks={timelineWeeks || 0}
            affiliates={affiliates}
            onNewPlan={handleNewPlan}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StickyHeader
        dailyCalories={aiReport.dailyCalorieTarget}
        goalText={goalText}
        calc={calc}
        onNewPlan={handleNewPlan}
      />
      <SegmentedControl activeSegment={activeSegment} onSegmentChange={setActiveSegment} />
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
});
