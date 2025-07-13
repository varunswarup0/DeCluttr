import { VariantProps, cva } from 'class-variance-authority';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import { UITextView } from 'react-native-uitextview';
import { px } from '~/lib/pixelPerfect';

import { cn } from '~/lib/cn';

cssInterop(UITextView, { className: 'style' });

const textVariants = cva('text-foreground', {
  variants: {
    variant: {
      largeTitle: 'leading-10',
      title1: 'leading-8',
      title2: 'leading-7',
      title3: 'leading-7',
      heading: 'leading-6 font-semibold',
      body: 'leading-6',
      callout: 'leading-6',
      subhead: 'leading-6',
      footnote: 'leading-5',
      caption1: 'leading-4',
      caption2: 'leading-4',
    },
    color: {
      primary: '',
      secondary: 'text-secondary-foreground/90',
      tertiary: 'text-muted-foreground/90',
      quarternary: 'text-muted-foreground/50',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'primary',
  },
});

const fontSizes = {
  largeTitle: px(34),
  title1: px(28),
  title2: px(22),
  title3: px(20),
  heading: px(17),
  body: px(17),
  callout: px(16),
  subhead: px(15),
  footnote: px(13),
  caption1: px(12),
  caption2: px(11),
} as const;

// Default to the sans font family (Quicksand)
const TextClassContext = React.createContext<string | undefined>('font-sans');

function Text({
  className,
  variant,
  color,
  ...props
}: React.ComponentPropsWithoutRef<typeof UITextView> & VariantProps<typeof textVariants>) {
  const textClassName = React.useContext(TextClassContext);
  const fontSize = fontSizes[(variant as keyof typeof fontSizes) ?? 'body'];
  return (
    <UITextView
      className={cn(textVariants({ variant, color }), textClassName, className)}
      style={[{ fontSize }, props.style]}
      {...props}
    />
  );
}

export { Text, TextClassContext, textVariants };
