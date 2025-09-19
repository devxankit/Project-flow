// Console cleanup utility to suppress known development errors
// This helps clean up the console during development

// Only apply cleanup in development mode
if (import.meta.env.DEV) {
  // Suppress proxy.js errors (usually from browser extensions)
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Suppress known development errors that don't affect functionality
    if (
      message.includes('Attempting to use a disconnected port object') ||
      message.includes('proxy.js') ||
      message.includes('handleMessageFromPage') ||
      message.includes('backendManager.js') ||
      message.includes('bridge.js')
    ) {
      // Silently ignore these errors
      return;
    }
    
    // Log all other errors normally
    originalError.apply(console, args);
  };

  // Suppress specific warnings that are not actionable
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Suppress known warnings that don't affect functionality
    if (
      message.includes('React DevTools') ||
      message.includes('Redux DevTools') ||
      message.includes('Hot reload') ||
      message.includes('Extension context invalidated')
    ) {
      // Silently ignore these warnings
      return;
    }
    
    // Log all other warnings normally
    originalWarn.apply(console, args);
  };

  // Optional: Add a clean console message
  console.log('🧹 Console cleanup active - suppressing development noise');
}
