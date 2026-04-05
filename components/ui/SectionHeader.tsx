import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../lib/constants';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...FONTS.headlineBold,
    color: COLORS.text,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});
