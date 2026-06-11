import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide cursor-pointer transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-[3px] border-foreground bg-primary text-primary-foreground shadow-brutal-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
        brutal:
          "border-[3px] border-foreground bg-primary text-primary-foreground shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:[box-shadow:8px_8px_0_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-none",
        secondary:
          "border-[3px] border-foreground bg-secondary text-secondary-foreground shadow-brutal-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
        destructive:
          "border-[3px] border-foreground bg-destructive text-destructive-foreground shadow-brutal-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
        outline:
          "border-[3px] border-foreground bg-card text-foreground shadow-brutal-sm hover:bg-muted active:translate-y-0 active:shadow-none",
        ghost: "text-foreground hover:bg-muted",
        link: "text-foreground underline underline-offset-4 font-semibold normal-case tracking-normal",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-14 px-7 text-base",
        xl: "h-16 px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
