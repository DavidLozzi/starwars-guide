# Star Wars Guide

A Jekyll-based Star Wars fan creation website featuring The Ultimate Star Wars Timeline, SWordle word game, HyperPanels comics, and Star Wars news and updates.

## Tech Stack

- **Framework**: Jekyll 4.3.2
- **CSS**: Tailwind CSS 3.4
- **Hosting**: Netlify Pages
- **Font**: JetBrains Mono

## Development Setup

### Prerequisites
- Ruby (for Jekyll)
- Node.js (for Tailwind CSS)
- Bundle (Ruby gem manager)

### Installation

1. Install Ruby dependencies:
```bash
bundle install
```

2. Install Node.js dependencies:
```bash
npm install
```

### Development Workflow

1. **Start development server**:
```bash
npm run dev
```
This builds the CSS and starts Jekyll with file watching.

2. **Build for production**:
```bash
npm run build
```

3. **CSS Development**:
- Edit `src/input.css` for custom styles
- Tailwind classes are available throughout all templates
- Custom Star Wars theme colors: `sw-black`, `sw-white`, `sw-red-400`, `sw-yellow-400`, `sw-blue-400`, `sw-green-400`, `sw-pink-400`, `sw-orange-400`

### Project Structure
```
├── _layouts/          # Jekyll layout templates
├── _includes/         # Jekyll includes (header, footer, etc.)
├── _sass/             # Legacy SCSS files (no longer used)
├── src/               # Tailwind CSS source
│   └── input.css      # Main Tailwind input file
├── assets/
│   ├── css/
│   │   └── main.css   # Built Tailwind CSS (generated)
│   └── ...            # Images, cards, etc.
├── tailwind.config.js # Tailwind configuration
├── package.json       # Node.js dependencies & scripts
└── _config.yml        # Jekyll configuration
```

## Star Wars Theme

The site uses a custom Star Wars-inspired design system built with Tailwind CSS:

- **Colors**: Custom SW- prefixed color palette
- **Typography**: JetBrains Mono monospace font
- **Components**: Cards, buttons, navigation with hover effects
- **Responsive**: Mobile-first design with custom nav breakpoint at 1000px

## Features

- **Timeline**: Interactive Star Wars chronology
- **SWordle**: Star Wars-themed word game  
- **HyperPanels**: Star Wars comic responses
- **News**: Latest Star Wars content and updates
- **Character Pages**: Detailed character information

## Contributing

This is a fan creation project. When making changes:

1. Follow the existing Tailwind CSS patterns
2. Use SW- prefixed colors for consistency
3. Test responsiveness, especially the 1000px navigation breakpoint
4. Ensure SEO tags (title, description, image, date) are included in frontmatter

## License

MIT License - This is an unofficial fan site, not affiliated with Disney or Lucasfilm.
