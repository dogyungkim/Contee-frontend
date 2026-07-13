import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "type-control inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-none hover:bg-[#1a1a1a]',
        destructive:
          'bg-destructive text-white shadow-none hover:bg-destructive/90 focus-visible:ring-destructive/20',
        outline:
          'border border-border bg-background text-foreground shadow-none hover:bg-accent',
        secondary:
          'bg-accent text-secondary-foreground shadow-none hover:bg-[#e8e8ec]',
        ghost:
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'rounded-none p-0 text-[#0d74ce] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-[18px] has-[>svg]:px-4',
        icon: 'size-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
