import { config } from '../config';

export type SortCategory = 'task' | 'event' | 'reminder' | 'thought' | 'worry' | 'idea';
export type SortPriority = 'high' | 'medium' | 'low';

export interface SortedItem {
  text: string;
  category: SortCategory;
  priority: SortPriority;
  dueDate?: string;
  start?: string;
  end?: string;
}

interface SortResponse {
  sorted: SortedItem[];
}

const ALLOWED_CATEGORIES: SortCategory[] = [
  'task',
  'event',
  'reminder',
  'thought',
  'worry',
  'idea',
];

const ALLOWED_PRIORITIES: SortPriority[] = ['high', 'medium', 'low'];

function isSortedItem(value: unknown): value is SortedItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.text === 'string' &&
    ALLOWED_CATEGORIES.includes(candidate.category as SortCategory) &&
    ALLOWED_PRIORITIES.includes(candidate.priority as SortPriority)
  );
}

function assertSortResponse(value: unknown): SortResponse {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid AI sort response payload.');
  }

  const response = value as Record<string, unknown>;
  if (!Array.isArray(response.sorted) || !response.sorted.every(isSortedItem)) {
    throw new Error('Invalid AI sort response schema.');
  }

  return {
    sorted: response.sorted,
  };
}

const AISortService = {
  async sortItems(items: string[], timezone?: string): Promise<SortedItem[]> {
    const cleanedItems = items
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 100);

    if (cleanedItems.length === 0) {
      return [];
    }

    const response = await fetch(`${config.apiBaseUrl}/api/sort`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cleanedItems,
        timezone,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      const message =
        payload && typeof payload.error === 'string'
          ? payload.error
          : 'Unable to sort items right now.';
      throw new Error(message);
    }

    return assertSortResponse(payload).sorted;
  },
};

export default AISortService;
