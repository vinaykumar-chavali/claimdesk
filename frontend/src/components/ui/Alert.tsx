import * as React from "react";
import { cn } from "@/utils/cn";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "error" | "success" | "warning";
  title?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:text-foreground [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11",
          {
            "bg-white text-gray-900 border-gray-200": variant === "default",
            "border-red-500/50 text-red-900 bg-red-50 dark:border-red-500 [&>svg]:text-red-600": variant === "error",
            "border-green-500/50 text-green-900 bg-green-50 dark:border-green-500 [&>svg]:text-green-600": variant === "success",
            "border-yellow-500/50 text-yellow-900 bg-yellow-50 dark:border-yellow-500 [&>svg]:text-yellow-600": variant === "warning",
          },
          className
        )}
        {...props}
      >
        {variant === "default" && <Info className="h-4 w-4" />}
        {variant === "error" && <XCircle className="h-4 w-4" />}
        {variant === "success" && <CheckCircle className="h-4 w-4" />}
        {variant === "warning" && <AlertCircle className="h-4 w-4" />}
        {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
        <div className="text-sm [&_p]:leading-relaxed">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export { Alert };
