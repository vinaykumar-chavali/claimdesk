import * as React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none overflow-hidden",
          {
            // Primary: Rich Navy Gradient with Specular Gloss Rim Highlight
            'bg-gradient-to-b from-navy-700 via-navy-800 to-navy-900 text-white shadow-md shadow-navy-900/20 hover:shadow-xl hover:shadow-navy-900/30 hover:-translate-y-0.5 hover:from-navy-600 hover:to-navy-900 border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4)] focus-visible:ring-navy-600': variant === 'primary',
            
            // Secondary: Golden Amber Metallic Gradient
            'bg-gradient-to-b from-gold-400 via-gold-500 to-gold-600 text-white shadow-md shadow-gold-600/20 hover:shadow-xl hover:shadow-gold-600/30 hover:-translate-y-0.5 hover:from-gold-400 hover:to-gold-700 border border-white/25 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4)] focus-visible:ring-gold-500': variant === 'secondary',
            
            // Outline: Crisp Frosted Glass Style with Aave Specular Rim
            'border border-slate-200/80 bg-white/80 hover:bg-white/95 text-slate-700 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] focus-visible:ring-slate-400': variant === 'outline',
            
            // Ghost: Subtle hover state
            'hover:bg-navy-50/70 text-slate-700 hover:text-navy-900 focus-visible:ring-navy-300': variant === 'ghost',
            
            // Danger: Crimson Red Gradient
            'bg-gradient-to-b from-red-500 via-red-600 to-red-700 text-white shadow-md shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30 hover:-translate-y-0.5 hover:from-red-500 hover:to-red-800 border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4)] focus-visible:ring-red-500': variant === 'danger',
            
            // Sizes
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 py-2 px-4.5': size === 'md',
            'h-12 px-7 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
