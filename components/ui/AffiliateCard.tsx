import { View, Text, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { AffiliateLink } from '../../types';

interface AffiliateCardProps {
  product: AffiliateLink;
}

export function AffiliateCard({ product }: AffiliateCardProps) {
  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(product.affiliateUrl);
      if (supported) {
        await Linking.openURL(product.affiliateUrl);
      }
    } catch {
      // silently ignore if link can't be opened
    }
  };

  const getCategoryIcon = (): keyof typeof Feather.glyphMap => {
    switch (product.category) {
      case 'supplement': return 'package';
      case 'meal_kit': return 'box';
      case 'equipment': return 'activity';
      case 'app': return 'smartphone';
      default: return 'shopping-bag';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Feather name={getCategoryIcon()} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
      <View style={styles.shopButton}>
        <Text style={styles.shopText}>Shop Now</Text>
        <Feather name="external-link" size={14} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    flex: 1,
    margin: SPACING.xs,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    ...FONTS.captionMedium,
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
  },
  shopText: {
    ...FONTS.captionMedium,
    color: COLORS.primary,
  },
});
