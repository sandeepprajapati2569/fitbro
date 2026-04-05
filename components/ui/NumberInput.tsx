import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
  placeholder?: string;
  error?: string;
}

export function NumberInput({ label, value, onChangeText, unit, placeholder, error }: NumberInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9.]/g, '');
            onChangeText(cleaned);
          }}
          keyboardType="decimal-pad"
          placeholder={placeholder || '0'}
          placeholderTextColor={COLORS.border}
        />
        <View style={styles.unitContainer}>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...FONTS.captionMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    height: 56,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    ...FONTS.body,
    fontSize: 18,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    height: '100%',
  },
  unitContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING.md,
    height: '100%',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  unit: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  error: {
    ...FONTS.small,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});
