import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "outline";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-transparent bg-slate-900 text-white",
      destructive: "border-transparent bg-red-500 text-white",
      outline: "text-slate-950 border-slate-200",
    };

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
