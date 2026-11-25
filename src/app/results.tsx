import { useLocalSearchParams } from 'expo-router';

import { isCategoryId } from '@/domain/categories/category.catalog';
import { SearchView } from '@/features/search/SearchView';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ q?: string; intent?: string; category?: string }>();
  return (
    <SearchView
      mode="results"
      initialQuery={params.q}
      intentId={params.intent}
      categoryId={isCategoryId(params.category) ? params.category : null}
    />
  );
}
