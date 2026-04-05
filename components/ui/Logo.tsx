import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';
import { COLORS, FONTS } from '../../lib/constants';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const SIZES = {
  small: { icon: 34, fontSize: 17, gap: 8 },
  medium: { icon: 50, fontSize: 24, gap: 10 },
  large: { icon: 76, fontSize: 34, gap: 12 },
};

function LogoIcon({ size }: { size: number }) {
  const r = size * 0.22; // corner radius

  return (
    <View style={[styles.iconShadow, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#14B8A6" />
            <Stop offset="100%" stopColor="#0D7377" />
          </LinearGradient>
          <LinearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#5EEAD4" />
            <Stop offset="100%" stopColor="#2DD4BF" />
          </LinearGradient>
        </Defs>

        {/* Rounded square background */}
        <Rect x="0" y="0" width="100" height="100" rx="22" ry="22" fill="url(#bgGrad)" />

        {/* Stylized bolt / lightning — represents energy & fitness */}
        <Path
          d="M 56 16 L 34 50 L 48 50 L 42 84 L 68 46 L 53 46 Z"
          fill="white"
          opacity={0.95}
        />

        {/* Small accent dot — top right */}
        <Circle cx="74" cy="24" r="6" fill="url(#accentGrad)" opacity={0.8} />
      </Svg>
    </View>
  );
}

export function Logo({ size = 'medium', showText = true }: LogoProps) {
  const s = SIZES[size];

  return (
    <View style={styles.container}>
      <LogoIcon size={s.icon} />
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
  iconShadow: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
