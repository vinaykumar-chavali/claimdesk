export interface UserPayload {
  id: string;
  email: string;
  role: 'claimant' | 'officer' | 'supervisor';
  full_name: string;
}
