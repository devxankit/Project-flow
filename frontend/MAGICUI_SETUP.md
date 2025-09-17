# Magic UI Component Setup Guide

## Overview
This guide explains how to properly set up Magic UI components in your project to ensure they install in the correct directory structure with proper import paths.

## Current Setup
- All Magic UI components are organized in `src/components/magicui/`
- Components are installed directly in the `magicui` directory (no nested directories)
- Import paths are correctly configured to use `../../lib/utils`

## Installation Process

### 1. Install Magic UI Components
Use the standard shadcn command to install Magic UI components:
```bash
npx shadcn@latest add @magicui/[component-name] --yes
```

### 2. Fix Installation Issues (Automatic)
After installing any Magic UI component, run the fix script to correct directory structure and import paths:
```bash
.\fix-magicui-components.ps1
```

## What the Fix Script Does

The `fix-magicui-components.ps1` script automatically:

1. **Moves Components**: Moves components from nested `ui/` directories to the correct `magicui/` directory
2. **Fixes Import Paths**: Corrects import statements from `"src/lib/utils"` to `"../../lib/utils"`
3. **Cleans Up**: Removes empty nested directories
4. **Verifies**: Checks all components for correct import paths

## Configuration Files

### components.json
```json
{
  "aliases": {
    "components": "src/components/magicui",
    "magicui": "src/components/magicui",
    "utils": "src/lib/utils"
  },
  "registries": {
    "@magicui": "https://magicui.design/r/{name}.json"
  }
}
```

## Available Components

The following Magic UI components are currently installed and working:

- animated-circular-progress-bar
- animated-list
- avatar-circles
- border-beam
- button
- card
- dock
- floating-elements
- globe
- highlighter
- input
- magic-card
- marquee
- particles
- ripple-button
- shiny-button

## Usage Example

```jsx
import { Highlighter } from '../components/magicui/highlighter';
import { MagicCard } from '../components/magicui/magic-card';
import { RippleButton } from '../components/magicui/ripple-button';

function MyComponent() {
  return (
    <MagicCard>
      <Highlighter>This text will be highlighted</Highlighter>
      <RippleButton>Click me</RippleButton>
    </MagicCard>
  );
}
```

## Troubleshooting

### Issue: Components install in nested directories
**Solution**: Run the fix script after installation
```bash
.\fix-magicui-components.ps1
```

### Issue: Import path errors
**Solution**: The fix script automatically corrects these, but you can manually fix by changing:
```javascript
// Wrong
import { cn } from "src/lib/utils";

// Correct
import { cn } from "../../lib/utils";
```

### Issue: Component not found in registry
**Solution**: Check the component name and ensure it exists in the Magic UI registry. Some components may have different names or may not be available.

## Best Practices

1. **Always run the fix script** after installing new Magic UI components
2. **Use the correct import paths** when importing components in your code
3. **Keep components organized** in the `magicui` directory
4. **Test components** after installation to ensure they work correctly

## Future Improvements

- Consider creating a custom CLI wrapper that automatically runs the fix script
- Add component validation to ensure all imports are correct
- Create a component template system for consistent structure
