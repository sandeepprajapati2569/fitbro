import type { AffiliateLink, AIReport } from '../types';

const AFFILIATE_CATALOG: AffiliateLink[] = [
  {
    id: 'whey-protein',
    title: 'Premium Whey Protein',
    description: '25g protein per scoop, low sugar, great taste',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=whey+protein+powder&tag=fitgoal-20',
    category: 'supplement',
    matchKeywords: ['whey protein', 'protein powder', 'protein shake', 'protein'],
  },
  {
    id: 'creatine',
    title: 'Creatine Monohydrate',
    description: 'Pure micronized creatine for strength and recovery',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=creatine+monohydrate&tag=fitgoal-20',
    category: 'supplement',
    matchKeywords: ['creatine', 'creatine monohydrate'],
  },
  {
    id: 'bcaa',
    title: 'BCAA Recovery Drink',
    description: 'Branch chain amino acids for muscle recovery',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=bcaa+recovery+drink&tag=fitgoal-20',
    category: 'supplement',
    matchKeywords: ['bcaa', 'amino acids', 'recovery'],
  },
  {
    id: 'multivitamin',
    title: 'Daily Multivitamin',
    description: 'Complete daily vitamin and mineral formula',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=daily+multivitamin&tag=fitgoal-20',
    category: 'supplement',
    matchKeywords: ['multivitamin', 'vitamin', 'vitamins', 'minerals'],
  },
  {
    id: 'fish-oil',
    title: 'Omega-3 Fish Oil',
    description: 'High potency EPA & DHA for heart and joint health',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=omega+3+fish+oil&tag=fitgoal-20',
    category: 'supplement',
    matchKeywords: ['fish oil', 'omega-3', 'omega 3', 'epa', 'dha'],
  },
  {
    id: 'pre-workout',
    title: 'Pre-Workout Energy',
    description: 'Clean energy boost for intense workouts',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=pre+workout+energy&tag=fitgoal-20',
    category: 'supplement',
    matchKeywords: ['pre-workout', 'pre workout', 'energy', 'caffeine'],
  },
  {
    id: 'meal-prep-containers',
    title: 'Meal Prep Containers (20 Pack)',
    description: 'BPA-free containers with portion control sections',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=meal+prep+containers&tag=fitgoal-20',
    category: 'meal_kit',
    matchKeywords: ['meal prep', 'food container', 'portion control'],
  },
  {
    id: 'food-scale',
    title: 'Digital Food Scale',
    description: 'Precise nutrition tracking with gram accuracy',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=digital+food+scale&tag=fitgoal-20',
    category: 'meal_kit',
    matchKeywords: ['food scale', 'kitchen scale', 'calorie counting', 'portion'],
  },
  {
    id: 'resistance-bands',
    title: 'Resistance Band Set',
    description: '5 bands with different resistance levels',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=resistance+band+set&tag=fitgoal-20',
    category: 'equipment',
    matchKeywords: ['resistance band', 'bands', 'stretching', 'warm up'],
  },
  {
    id: 'dumbbells',
    title: 'Adjustable Dumbbells',
    description: '5-52.5 lbs adjustable weight set',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=adjustable+dumbbells&tag=fitgoal-20',
    category: 'equipment',
    matchKeywords: ['dumbbell', 'dumbbells', 'weight', 'bicep curl', 'shoulder press'],
  },
  {
    id: 'yoga-mat',
    title: 'Premium Yoga Mat',
    description: 'Extra thick, non-slip exercise mat',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=premium+yoga+mat&tag=fitgoal-20',
    category: 'equipment',
    matchKeywords: ['yoga', 'stretching', 'mat', 'plank', 'core'],
  },
  {
    id: 'jump-rope',
    title: 'Speed Jump Rope',
    description: 'Adjustable weighted jump rope for cardio',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=speed+jump+rope&tag=fitgoal-20',
    category: 'equipment',
    matchKeywords: ['jump rope', 'skipping', 'cardio', 'hiit'],
  },
  {
    id: 'protein-bars',
    title: 'Protein Bar Variety Pack',
    description: '20g protein, low sugar snack bars',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=protein+bars+variety+pack&tag=fitgoal-20',
    category: 'meal_kit',
    matchKeywords: ['protein bar', 'snack', 'protein snack', 'bar'],
  },
  {
    id: 'shaker-bottle',
    title: 'Protein Shaker Bottle',
    description: 'Leak-proof blender bottle with mixing ball',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=protein+shaker+bottle&tag=fitgoal-20',
    category: 'equipment',
    matchKeywords: ['shaker', 'protein shake', 'blender bottle', 'shake'],
  },
  {
    id: 'fat-burner',
    title: 'Natural Fat Burner',
    description: 'Thermogenic supplement with green tea extract',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=natural+fat+burner+supplement&tag=fitgoal-20',
    category: 'supplement',
    matchKeywords: ['fat burner', 'thermogenic', 'green tea', 'weight loss supplement'],
  },
  {
    id: 'mass-gainer',
    title: 'Mass Gainer Protein',
    description: 'High calorie protein powder for weight gain',
    imageUrl: '',
    affiliateUrl: 'https://www.amazon.com/s?k=mass+gainer+protein&tag=fitgoal-20',
    category: 'supplement',
    matchKeywords: ['mass gainer', 'weight gainer', 'calorie surplus', 'bulk'],
  },
];

export function matchAffiliates(report: AIReport): AffiliateLink[] {
  const keywords = [
    ...report.supplementRecommendations,
    ...report.mealPlan.flatMap((d) =>
      d.meals.flatMap((m) => m.ingredients)
    ),
    ...report.workoutPlan.flatMap((d) =>
      d.exercises.map((e) => e.name)
    ),
  ].map((k) => k.toLowerCase());

  return AFFILIATE_CATALOG
    .map((product) => ({
      product,
      score: product.matchKeywords.filter((kw) =>
        keywords.some((k) => k.includes(kw.toLowerCase()))
      ).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ product }) => product);
}
