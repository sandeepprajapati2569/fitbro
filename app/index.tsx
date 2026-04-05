import { Redirect } from 'expo-router';
import { useWizardStore } from '../store/useWizardStore';

export default function Index() {
  const aiReport = useWizardStore((s) => s.aiReport);

  // If we have a saved report, go straight to home
  if (aiReport) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/wizard/goal" />;
}
