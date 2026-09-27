import api from './client';
import { Policy } from '../types';

export const getPolicies = async (search?: string): Promise<Policy[]> => {
  const res = await api.get('/policies', { params: { search } });
  return res.data?.data || res.data || [];
};

export const getPolicyByNumber = async (policyNumber: string): Promise<Policy> => {
  const res = await api.get(`/policies/${policyNumber}`);
  return res.data?.data || res.data;
};
