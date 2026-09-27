import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { convertCurrency } from "../../api/fx";
import { Card, CardContent } from "../ui/Card";
import { Select } from "../ui/Select";
import { formatCurrency } from "../../utils/formatters";
import { RefreshCcw } from "lucide-react";

export function FxWidget({ amount, sourceCurrency }: { amount: number, sourceCurrency: string }) {
  const [targetCurrency, setTargetCurrency] = useState(sourceCurrency === 'USD' ? 'EUR' : 'USD');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['fx', amount, sourceCurrency, targetCurrency],
    queryFn: () => convertCurrency(amount, sourceCurrency, targetCurrency),
    enabled: amount > 0,
  });

  return (
    <Card className="bg-navy-50 border-navy-100">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-navy-900 flex items-center space-x-2">
            <span>{formatCurrency(amount, sourceCurrency)}</span>
            <RefreshCcw className="h-3 w-3 text-navy-500" />
            {sourceCurrency === targetCurrency ? (
              <span>{formatCurrency(amount, targetCurrency)}</span>
            ) : isLoading ? (
              <span className="text-navy-500">Loading...</span>
            ) : isError ? (
              <span className="text-red-500 text-xs">Rate unavailable</span>
            ) : (
              <span className="font-bold">{formatCurrency(data || amount, targetCurrency)}</span>
            )}
          </p>
          <p className="text-[10px] text-navy-500 mt-1">Reference rate only. Not an insurance payout calculation.</p>
        </div>
        <div className="w-24">
          <Select 
            value={targetCurrency} 
            onChange={(e) => setTargetCurrency(e.target.value)}
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
              { value: 'INR', label: 'INR' },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
}
