"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(
  undefined
);

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SelectTrigger({
  className = "",
  children,
  ...props
}: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be inside Select");

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => context.setIsOpen(!context.isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be inside Select");

  return <span>{context.value || placeholder}</span>;
}

export interface SelectContentProps {
  children: React.ReactNode;
}

export function SelectContent({ children }: SelectContentProps) {
  const context = React.useContext(SelectContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        context?.setIsOpen(false);
      }
    };

    if (context?.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [context?.isOpen]);

  if (!context) throw new Error("SelectContent must be inside Select");

  if (!context.isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md"
    >
      {children}
    </div>
  );
}

export interface SelectItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function SelectItem({
  value,
  className = "",
  children,
  ...props
}: SelectItemProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be inside Select");

  return (
    <button
      type="button"
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 ${className}`}
      onClick={() => {
        context.onValueChange(value);
        context.setIsOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
