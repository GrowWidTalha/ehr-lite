import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90 [a&]:hover:scale-105",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 [a&]:hover:scale-105",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 [a&]:hover:scale-105",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:scale-105",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:scale-105",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        blue: "bg-[var(--color-blue)] text-white [a&]:hover:bg-[var(--color-blue)]/90 [a&]:hover:scale-105 shadow-sm",
        green: "bg-[var(--color-green)] text-white [a&]:hover:bg-[var(--color-green)]/90 [a&]:hover:scale-105 shadow-sm",
        purple: "bg-[var(--color-purple)] text-white [a&]:hover:bg-[var(--color-purple)]/90 [a&]:hover:scale-105 shadow-sm",
        orange: "bg-[var(--color-orange)] text-white [a&]:hover:bg-[var(--color-orange)]/90 [a&]:hover:scale-105 shadow-sm",
        rose: "bg-[var(--color-rose)] text-white [a&]:hover:bg-[var(--color-rose)]/90 [a&]:hover:scale-105 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
