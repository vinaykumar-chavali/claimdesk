import api from './client';

export const login = async (credentials: any) => {
  const res = await api.post('/auth/login', credentials);
  return res.data?.data || res.data;
};

export const register = async (userData: any) => {
  const res = await api.post('/auth/register', userData);
  return res.data?.data || res.data;
};
