import api from './client';
import { Claim, ClaimEvent, OfficerNote } from '../types';

export const getClaims = async (params?: Record<string, any>): Promise<Claim[]> => {
  const res = await api.get('/claims', { params });
  return res.data?.data || res.data || [];
};

export const getClaimById = async (id: string): Promise<Claim> => {
  const res = await api.get(`/claims/${id}`);
  return res.data?.data || res.data;
};

export const createClaim = async (formData: FormData): Promise<Claim> => {
  const res = await api.post('/claims', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data || res.data;
};

export const updateClaimStatus = async (id: string, newStatus: string, reason?: string): Promise<Claim> => {
  const res = await api.patch(`/claims/${id}/status`, { status: newStatus, reason });
  return res.data?.data || res.data;
};

export const getClaimEvents = async (claimId: string): Promise<ClaimEvent[]> => {
  const res = await api.get(`/claims/${claimId}/events`);
  return res.data?.data || res.data || [];
};

export const getOfficerNotes = async (claimId: string): Promise<OfficerNote[]> => {
  const res = await api.get(`/claims/${claimId}/notes`);
  return res.data?.data || res.data || [];
};

export const createOfficerNote = async (claimId: string, content: string): Promise<OfficerNote> => {
  const res = await api.post(`/claims/${claimId}/notes`, { content });
  return res.data?.data || res.data;
};

export const getClaimAuditLogs = async (claimId: string): Promise<any[]> => {
  const res = await api.get(`/audit/claim/${claimId}`);
  return res.data?.data || res.data || [];
};
