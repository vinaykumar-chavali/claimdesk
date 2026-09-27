import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export function Spinner({ className, size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) {
  return (
    <Loader2 
      className={cn(
        "animate-spin text-navy-600", 
        {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        },
        className
      )} 
    />
  );
}
