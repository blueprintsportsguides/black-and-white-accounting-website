# Black and White Accounting - Website Foundation

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The site will open automatically at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally

## Project Structure

- `index.html` - Main HTML structure with header and footer
- `styles.css` - Global styles, color tokens, components, and layout system
- `script.js` - JavaScript for navigation and interactions
- `vite.config.js` - Vite configuration
- `package.json` - Project dependencies and scripts

## Global Design System

### Color Tokens

**Gradients (for CTAs and navigation banners):**
- Gradient 1: `#fae3f0 → #fee9d9`
- Gradient 2: `#fce9d9 → #cae3f4`
- Gradient 3: `#c6e6f5 → #fae3ef`

**Backgrounds:**
- White: `#ffffff`
- Light pastel tints (derived from gradients)

### Typography & Spacing

- Font family: System font stack
- Spacing scale: 8px, 16px, 24px, 32px, 48px, 64px, 96px
- Border radius: 8px, 16px, 24px, 50% (full circle)
- Soft shadows for depth

## Reusable Components

### Section Container
```html
<section class="section">
  <div class="section-container">
    <!-- Content -->
  </div>
</section>
```

Variants:
- `.section-alt` - Light pastel background 1
- `.section-alt-2` - Light pastel background 2
- `.section-alt-3` - Light pastel background 3

### Grid System
```html
<div class="grid grid-2">
  <!-- 2 columns -->
</div>
<div class="grid grid-3">
  <!-- 3 columns -->
</div>
<div class="grid grid-4">
  <!-- 4 columns -->
</div>
```

Responsive: Automatically stacks to 1 column on mobile.

### CTA Banner Module
```html
<div class="cta-banner cta-banner-gradient-1">
  <h2>Heading</h2>
  <p>Description</p>
  <div class="cta-banner-actions">
    <a href="#" class="btn btn-primary">Button 1</a>
    <a href="#" class="btn btn-secondary">Button 2</a>
  </div>
</div>
```

Gradient variants:
- `.cta-banner-gradient-1`
- `.cta-banner-gradient-2`
- `.cta-banner-gradient-3`

### Card Component
```html
<div class="card">
  <img src="..." class="card-image" alt="...">
  <h3 class="card-title">Title</h3>
  <p class="card-description">Description</p>
  <div class="card-footer">
    <a href="#" class="btn btn-secondary">Link</a>
  </div>
</div>
```

For circular images:
```html
<img src="..." class="card-circle-image" alt="...">
```

### Buttons
- `.btn` - Base button class
- `.btn-primary` - Gradient background
- `.btn-secondary` - White with border
- `.btn-small` - Smaller size variant

## Image Placeholder System

Use named placeholder classes for images that will be replaced later:

**Circular placeholders:**
```html
<div class="img-placeholder-circle">IMG_HERO_TEAM_CIRCLE</div>
```

**Rounded rectangle placeholders:**
```html
<div class="img-placeholder-rect">IMG_OFFICE_WRAYSBURY_RECT</div>
```

When actual images are added, replace the placeholder divs with:
```html
<img src="path/to/image.jpg" alt="Description" class="card-image">
```

## Header

- Logo placeholder: `LOGO_HORIZONTAL_PLACEHOLDER`
- Navigation with mega-menu for Services
- Persistent "Phone Us" CTA (0800 140 4644)
- Mobile-responsive with hamburger menu

## Footer

- Logo placeholder
- Service links (Tax, Accounts, Advisory)
- Sector links (all 9 sectors)
- Contact information with phone number
- Office locations (Wraysbury & Herriard)
- Legal links
- Mobile-optimized layout

## Mobile Features

- Sticky bottom bar with "Call" and "Enquire" buttons (visible on mobile only)
- Responsive navigation with accordion-style mega menu
- Touch-optimized tap targets (≥48px)
- Mobile-first grid system

## Next Steps

Page content can now be added to the `<main class="main-content">` section using the reusable components and design system defined above.

