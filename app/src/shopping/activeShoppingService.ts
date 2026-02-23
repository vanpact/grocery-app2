import { type Item } from '../types';

export function getActiveShoppingItems(items: Item[]): Item[] {
  const validated = items.filter((item) => item.status === 'validated');

  return [...validated].sort((left, right) => {
    const aisleCompare = (left.aisleKey ?? '').localeCompare(right.aisleKey ?? '');
    if (aisleCompare !== 0) {
      return aisleCompare;
    }

    return left.nameSlug.localeCompare(right.nameSlug);
  });
}
