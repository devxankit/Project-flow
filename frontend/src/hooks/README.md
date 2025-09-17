# Custom Hooks

This directory contains reusable custom hooks for the application.

## useScrollToTop

**Purpose**: Automatically scrolls to the top of the page when a component mounts.

**Usage**: Import and use this hook in any page component to ensure it starts at the top when navigated to.

```javascript
import useScrollToTop from '../hooks/useScrollToTop';

const MyPage = () => {
  // Scroll to top when component mounts
  useScrollToTop();
  
  // ... rest of component
};
```

**When to use**:
- All page components that users can navigate to
- Any component that should start at the top when loaded
- Prevents users from seeing pages in a scrolled position

**Implementation**: Uses `useEffect` with `window.scrollTo(0, 0)` to scroll to the top when the component mounts.

## Future Hooks

When creating new custom hooks:
1. Place them in this directory
2. Follow the naming convention `use[Purpose]`
3. Add documentation to this README
4. Export as default export
5. Include JSDoc comments for better IDE support
