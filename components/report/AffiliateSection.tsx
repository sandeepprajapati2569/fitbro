import { View, Text, StyleSheet } from 'react-native';
import { AffiliateCard } from '../ui/AffiliateCard';
import { COLORS, FONTS, SPACING } from '../../lib/constants';
import type { AffiliateLink } from '../../types';

interface AffiliateSectionProps {
  products: AffiliateLink[];
}

export function AffiliateSection({ products }: AffiliateSectionProps) {
  if (products.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>Recommended Products</Text>
      <Text style={styles.subtitle}>Products to support your journey</Text>
      <View style={styles.grid}>
        {products.map((product, index) => {
          const isOdd = products.length % 2 !== 0 && index === products.length - 1;
          return (
            <View key={product.id} style={isOdd ? styles.fullWidth : styles.halfWidth}>
              <AffiliateCard product={product} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...FONTS.headlineMedium,
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  halfWidth: {
    width: '50%',
  },
  fullWidth: {
    width: '100%',
  },
});
