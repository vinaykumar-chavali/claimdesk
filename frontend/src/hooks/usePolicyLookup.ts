import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { getPolicies } from '../api/policies';
import { Policy } from '../types';

// Policy numbers are 12-14 chars (e.g. AV-AUTO-00101, AV-HLTH-00201).
// Only fire the lookup once the user has entered enough characters to form
// a plausibly complete policy number — avoids flashing partial matches mid-typing.
const MIN_POLICY_LENGTH = 10;

export function usePolicyLookup(searchQuery: string): ReturnType<typeof useQuery<Policy | null>> {
  const debouncedQuery = useDebounce(searchQuery, 400);

  return useQuery({
    queryKey: ['policy', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      const policies = await getPolicies(debouncedQuery);
      return policies[0] || null;
    },
    enabled: !!debouncedQuery && debouncedQuery.trim().length >= MIN_POLICY_LENGTH,
  });
}
