import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { getPolicies } from '../api/policies';
import { Policy } from '../types';

export function usePolicyLookup(searchQuery: string): ReturnType<typeof useQuery<Policy | null>> {
  const debouncedQuery = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: ['policy', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      const policies = await getPolicies(debouncedQuery);
      return policies[0] || null;
    },
    enabled: !!debouncedQuery && debouncedQuery.trim().length > 0,
  });
}
