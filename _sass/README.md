# Legacy SCSS Files

**Note: These SCSS files are legacy and are no longer used.**

This project has been refactored to use **Tailwind CSS** instead of these custom SCSS files.

## Current Setup
- **CSS Framework**: Tailwind CSS
- **Main CSS Input**: `src/input.css`
- **Built CSS Output**: `assets/css/main.css`
- **Configuration**: `tailwind.config.js`

## Legacy Files
The files in this directory (`_sass/`) were the original custom SCSS implementation:
- `_new-design.scss` - Main design system with utility classes
- `_custom.scss` - Custom component styles
- `_character.scss` - Character page specific styles  
- `_deathstar.scss` - Death Star themed styles

These files contained custom utility classes that mimicked Tailwind's approach but are now replaced by actual Tailwind CSS.

## Development Workflow
To work with the CSS:
1. Edit `src/input.css` for custom styles
2. Run `npm run build:css` to build the CSS
3. Use `npm run dev` for development with CSS watching

## Star Wars Theme
The Tailwind configuration includes custom Star Wars colors:
- `sw-black` / `sw-white` 
- `sw-red-400` / `sw-yellow-400` / `sw-blue-400` / `sw-green-400`
- `sw-pink-400` / `sw-orange-400`