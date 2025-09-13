# Theme Configuration Guide

This guide explains how to change the website's theme colors.

## Quick Theme Change

To change the primary color of the entire website, simply update the color values in `src/config/theme.js`:

```javascript
export const theme = {
  colors: {
    primary: '#09ebcd',        // Main color
    primaryHover: '#07d4b8',   // Hover state
    primaryLight: '#4df0d9',   // Light variant
    primaryDark: '#06c4a8',    // Dark variant for gradients
  },
  // ... rest of the config
};
```

## How It Works

1. **Theme Configuration**: The `src/config/theme.js` file contains all theme colors
2. **CSS Variables**: Colors are automatically converted to HSL and applied as CSS variables in `src/index.css`
3. **Tailwind Integration**: The `tailwind.config.js` file maps these CSS variables to Tailwind classes
4. **Component Usage**: All components use Tailwind classes like `bg-primary`, `text-primary`, etc.

## Available Theme Classes

- `bg-primary` - Primary background color
- `text-primary` - Primary text color
- `border-primary` - Primary border color
- `bg-primary-hover` - Primary hover background
- `bg-primary-light` - Light variant background
- `bg-primary-dark` - Dark variant background

## Components Using Theme Colors

- **Navbar**: Logo gradient, CTA buttons
- **Hero**: Decorative elements, CTA button
- **Floating Elements**: Background animations
- **Button Component**: Default primary button styling

## Changing Colors

1. Update the hex color in `src/config/theme.js`
2. The HSL conversion happens automatically
3. All components will automatically use the new color
4. No need to update individual components

## Example: Changing to Blue Theme

```javascript
export const theme = {
  colors: {
    primary: '#3b82f6',        // Blue-500
    primaryHover: '#2563eb',   // Blue-600
    primaryLight: '#60a5fa',   // Blue-400
    primaryDark: '#1d4ed8',    // Blue-700
  },
  // ... rest of the config
};
```

This will automatically update all buttons, gradients, and theme elements across the entire website.
