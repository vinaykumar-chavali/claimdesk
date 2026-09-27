export const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return String(dateStr);
  }
};

export const formatCurrency = (amount?: number | string | null, currency: string = 'USD') => {
  const num = typeof amount === 'number' ? amount : (Number(amount) || 0);
  const safeCurrency = (currency && typeof currency === 'string' && currency.length === 3 && /^[A-Za-z]{3}$/.test(currency)) 
    ? currency.toUpperCase() 
    : 'USD';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
    }).format(num);
  } catch {
    return `$${num.toLocaleString()}`;
  }
};

export const formatStatus = (status?: string | null) => {
  if (!status) return 'Unknown';
  return String(status).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};
