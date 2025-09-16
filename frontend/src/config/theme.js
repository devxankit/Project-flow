// Centralized theme configuration
// Change the primary color here to update the entire website theme
export const theme = {
  colors: {
    primary: '#09ebcd',
    primaryHover: '#07d4b8', // Slightly darker for hover states
    primaryLight: '#4df0d9', // Lighter variant
    primaryDark: '#06c4a8', // Darker variant for gradients
  },
  
  // Font configuration
  fonts: {
    primary: 'Poppins',
    fallback: 'ui-sans-serif, system-ui, sans-serif',
  },
  
  // Convert hex to HSL for CSS variables
  getHSL: (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }
};

// Generate CSS variables for the theme
export const generateThemeCSS = () => {
  const primaryHSL = theme.getHSL(theme.colors.primary);
  const primaryHoverHSL = theme.getHSL(theme.colors.primaryHover);
  const primaryLightHSL = theme.getHSL(theme.colors.primaryLight);
  const primaryDarkHSL = theme.getHSL(theme.colors.primaryDark);

  return `
    :root {
      --primary: ${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%;
      --primary-foreground: 0 0% 100%;
      --primary-hover: ${primaryHoverHSL.h} ${primaryHoverHSL.s}% ${primaryHoverHSL.l}%;
      --primary-light: ${primaryLightHSL.h} ${primaryLightHSL.s}% ${primaryLightHSL.l}%;
      --primary-dark: ${primaryDarkHSL.h} ${primaryDarkHSL.s}% ${primaryDarkHSL.l}%;
    }
  `;
};
