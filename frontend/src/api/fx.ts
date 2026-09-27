import api from './client';

export const convertCurrency = async (amount: number, from: string, to: string): Promise<number> => {
  try {
    const res = await api.get('/fx/convert', {
      params: { base: from, target: to, amount: String(amount) }
    });
    const data = res.data?.data || res.data;
    return data?.convertedAmount ?? amount;
  } catch {
    return amount;
  }
};
