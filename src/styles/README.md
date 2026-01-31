# Design System

This directory contains the design tokens and theme system for the Scale Master application.

## Design Tokens

All design values are centralized in `tokens.css` using CSS custom properties (variables). This provides:

- **Consistency** - Single source of truth for all design values
- **Maintainability** - Easy to update theme-wide values
- **Flexibility** - Simple to add theme switching in the future
- **Performance** - Native CSS with no runtime cost

## Token Categories

### Colors

#### Background Colors
- `--color-bg-primary` - Darkest background (#0f0f0f)
- `--color-bg-secondary` - Mid-dark background (#1a1a1a)
- `--color-bg-tertiary` - Lighter background (#242424)
- `--color-bg-elevated` - Elevated elements (#2a2a2a)

#### Text Colors
- `--color-text-primary` - Primary text (#ffffff)
- `--color-text-secondary` - Secondary text (#d1d5db)
- `--color-text-tertiary` - Tertiary text (#9ca3af)
- `--color-text-muted` - Muted text (#6b7280)
- `--color-text-disabled` - Disabled text (#4b5563)

#### Brand Colors
- `--color-brand-primary` - Primary brand color (#646cff)
- `--color-brand-primary-hover` - Brand hover state (#747bff)
- `--color-brand-primary-active` - Brand active state (#535bf2)

#### Semantic Colors
Each semantic color has background, text, and light variants:
- **Success** - Green colors for positive states
- **Error** - Red colors for error states
- **Info** - Blue colors for informational states
- **Warning** - Orange colors for warning states

#### Border Colors
- `--color-border-primary` - Default borders (#333333)
- `--color-border-secondary` - Secondary borders (#404040)
- `--color-border-focus` - Focus state borders (brand color)

### Spacing

8-point grid system (multiples of 4px):
- `--spacing-xs` - 4px
- `--spacing-sm` - 8px
- `--spacing-md` - 12px
- `--spacing-lg` - 16px
- `--spacing-xl` - 24px
- `--spacing-2xl` - 32px
- `--spacing-3xl` - 40px
- `--spacing-4xl` - 48px

### Typography

#### Font Families
- `--font-sans` - System font stack for body text
- `--font-mono` - Monospace font for code

#### Font Sizes
- `--font-size-xs` through `--font-size-3xl`
- Base size: 16px (1rem)

#### Font Weights
- `--font-weight-normal` - 400
- `--font-weight-medium` - 500
- `--font-weight-semibold` - 600
- `--font-weight-bold` - 700

#### Line Heights
- `--line-height-tight` - 1.25
- `--line-height-normal` - 1.5
- `--line-height-relaxed` - 1.75

#### Letter Spacing
- `--letter-spacing-tight` through `--letter-spacing-wider`

### Layout

- `--radius-sm` through `--radius-full` - Border radius values
- `--shadow-sm` through `--shadow-error` - Box shadow variants
- `--transition-fast`, `--transition-base`, `--transition-slow` - Transition durations
- `--z-base` through `--z-tooltip` - Z-index scale

### Grid System

- `--grid-gap` - Gap between grid items
- `--grid-columns-mobile` - 1 column
- `--grid-columns-tablet` - 2 columns
- `--grid-columns-desktop` - 3 columns

## Usage

### In CSS Files

```css
.my-component {
  /* Colors */
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);

  /* Spacing */
  padding: var(--spacing-lg);
  margin: var(--spacing-2xl) 0;
  gap: var(--spacing-md);

  /* Typography */
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);

  /* Layout */
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}
```

### Best Practices

1. **Always use tokens** - Never hardcode color/spacing values
2. **Semantic naming** - Use semantic color variables for meaning (success, error, etc.)
3. **Consistent spacing** - Stick to the spacing scale for all margins/padding
4. **Responsive design** - Use provided breakpoint variables
5. **Accessible contrast** - Token colors are designed for WCAG compliance

## Future Enhancements

- Light theme support
- High contrast theme
- User theme preferences
- Theme switching animation
- Per-component theme overrides

## File Structure

```
src/styles/
├── tokens.css       # Design tokens (CSS variables)
└── README.md        # This file
```
