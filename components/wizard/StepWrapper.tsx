import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

interface StepWrapperProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function StepWrapper({ children, footer }: StepWrapperProps) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background,
  },
});
