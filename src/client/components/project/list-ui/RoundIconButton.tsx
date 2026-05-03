import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/client/lib/utils';

type Variant = 'default' | 'success' | 'destructive';
type Size = 'sm' | 'touch';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
};

const VARIANT_HOVER: Record<Variant, string> = {
    default: 'hover:border-foreground hover:text-foreground',
    success: 'hover:border-success hover:text-success',
    destructive: 'hover:border-destructive hover:text-destructive',
};

const SIZE_CLASS: Record<Size, string> = {
    sm: 'h-9 w-9',
    touch: 'h-11 w-11 sm:h-9 sm:w-9',
};

export const RoundIconButton = forwardRef<HTMLButtonElement, Props>(
    ({ variant = 'default', size = 'touch', className, type = 'button', ...rest }, ref) => (
        <button
            ref={ref}
            type={type}
            className={cn(
                'inline-flex items-center justify-center rounded-full border border-border text-muted-foreground transition-colors',
                SIZE_CLASS[size],
                VARIANT_HOVER[variant],
                className
            )}
            {...rest}
        />
    )
);
RoundIconButton.displayName = 'RoundIconButton';
