import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WizardState, FitnessGoal, WeightUnit, Gender, ActivityLevel, AIReport } from '../types';

interface WizardActions {
  setGoal: (goal: FitnessGoal) => void;
  setWeights: (current: number, target: number, unit: WeightUnit) => void;
  setProfile: (gender: Gender, age: number, heightCm: number, activityLevel: ActivityLevel) => void;
  setTimeline: (weeks: number) => void;
  setReport: (report: AIReport) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: WizardState = {
  goal: null,
  currentWeight: null,
  targetWeight: null,
  weightUnit: 'kg',
  timelineWeeks: null,
  gender: null,
  age: null,
  heightCm: null,
  activityLevel: null,
  aiReport: null,
  isLoading: false,
  error: null,
};

export const useWizardStore = create<WizardState & WizardActions>()(
  persist(
    (set) => ({
      ...initialState,
      setGoal: (goal) => set({ goal, aiReport: null, error: null }),
      setWeights: (currentWeight, targetWeight, weightUnit) =>
        set({ currentWeight, targetWeight, weightUnit, aiReport: null, error: null }),
      setProfile: (gender, age, heightCm, activityLevel) =>
        set({ gender, age, heightCm, activityLevel, aiReport: null, error: null }),
      setTimeline: (timelineWeeks) => set({ timelineWeeks, aiReport: null, error: null }),
      setReport: (aiReport) => set({ aiReport, isLoading: false, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      reset: () => set(initialState),
    }),
    {
      name: 'wizard-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist user data and report, but NOT loading/error transient state
        goal: state.goal,
        currentWeight: state.currentWeight,
        targetWeight: state.targetWeight,
        weightUnit: state.weightUnit,
        timelineWeeks: state.timelineWeeks,
        gender: state.gender,
        age: state.age,
        heightCm: state.heightCm,
        activityLevel: state.activityLevel,
        aiReport: state.aiReport,
      }),
    }
  )
);
