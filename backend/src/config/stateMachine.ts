export const TRANSITIONS: Record<string, string[]> = {
  submitted:    ['under_review'],
  under_review: ['approved', 'rejected'],
  approved:     [],
  rejected:     [],
  closed:       [],
};

export const SUPERVISOR_TRANSITIONS: Record<string, string[]> = {
  approved: ['closed'],
  rejected: ['closed'],
  closed:   ['submitted', 'under_review'],  // supervisor can reopen
};

export function canTransition(from: string, to: string, role: string): boolean {
  if (role === 'supervisor') {
    const allowed = [...(TRANSITIONS[from] ?? []), ...(SUPERVISOR_TRANSITIONS[from] ?? [])];
    return allowed.includes(to);
  }
  if (role === 'officer') {
    return (TRANSITIONS[from] ?? []).includes(to);
  }
  return false;
}
