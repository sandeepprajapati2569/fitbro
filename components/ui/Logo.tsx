import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const SIZES = {
  small: { icon: 18, circle: 34, fontSize: 17, gap: 8 },
  medium: { icon: 28, circle: 50, fontSize: 24, gap: 10 },
  large: { icon: 40, circle: 76, fontSize: 34, gap: 12 },
};

export function Logo({ size = 'medium', showText = true }: LogoProps) {
  const s = SIZES[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { width: s.circle, height: s.circle, borderRadius: s.circle / 2 },
        ]}
      >
        <View
          style={[
            styles.innerRing,
            { width: s.circle - 6, height: s.circle - 6, borderRadius: (s.circle - 6) / 2 },
          ]}
        >
          <Feather name="trending-up" size={s.icon * 0.6} color="#000" />
        </View>
      </View>
      {showText && (
        <View style={{ marginLeft: s.gap }}>
          <Text style={[styles.logoText, { fontSize: s.fontSize }]}>
            Fit<Text style={styles.logoAccent}>Goal</Text>
          </Text>
          {size === 'large' && <Text style={styles.tagline}>Your AI Fitness Coach</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  innerRing: {
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Urbanist_700Bold',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  tagline: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 0,
    letterSpacing: 0.5,
  },
});
