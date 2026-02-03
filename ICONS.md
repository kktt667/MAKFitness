# App Icons Setup

MAKFitness needs the following icon files in the `public/` directory for PWA functionality:

## Required Icons

### 1. App Icons
- **icon-192.png** (192x192px) - Android and general use
- **icon-512.png** (512x512px) - High-res Android and splash screens
- **apple-touch-icon.png** (180x180px) - iOS home screen icon

### 2. Optional Screenshots (for app stores)
- **screenshot-feed.png** (390x844px) - Shows the feed page
- **screenshot-checkin.png** (390x844px) - Shows the check-in form

## Design Guidelines

### Brand Colors
- Primary: `#FF5C9A` (pastel pink)
- Background: `#FFD6E8` (lighter pink)
- Accent: `#0EA5E9` (bright blue)

### Icon Design
The icon should:
- Be simple and recognizable at small sizes
- Use the brand's pastel pink color scheme
- Represent fitness, community, or progress
- Work well on both light and dark backgrounds

### Suggestions
- A flame (🔥) for streaks - stylized and rounded
- An abstract "M" lettermark with gradient
- A circular progress ring with friendly vibes
- Heart + dumbbell combination

## Creating Icons

### Option 1: Use an Icon Generator
1. Visit [https://www.pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator)
2. Upload a 512x512px source image
3. Download the generated icon pack
4. Move the required files to `/public/`

### Option 2: Design Tool (Figma/Canva)
1. Create a 512x512px artboard
2. Design your icon with safe area (keep content within 80% of canvas)
3. Export as PNG at different sizes:
   - 192x192px → `icon-192.png`
   - 512x512px → `icon-512.png`
   - 180x180px → `apple-touch-icon.png`

### Option 3: Quick Placeholder
Use an emoji or simple design:
```bash
# Install ImageMagick (if needed)
# macOS: brew install imagemagick

# Create placeholder icons (pink background with white text)
convert -size 512x512 -background "#FF5C9A" -fill white \
  -font Arial-Bold -pointsize 300 -gravity center \
  label:"M" icon-512.png

convert icon-512.png -resize 192x192 icon-192.png
convert icon-512.png -resize 180x180 apple-touch-icon.png
```

## Verification

After adding icons:

1. **Test PWA Installation**
   - Open app in mobile Safari (iOS) or Chrome (Android)
   - Tap Share → "Add to Home Screen"
   - Verify icon appears correctly

2. **Check Manifest**
   - Visit `/manifest.json` in browser
   - Verify all paths are correct

3. **iOS Safari Check**
   - Icon should be 180x180px
   - No transparent areas (iOS adds rounded corners automatically)
   - Test on actual device for best results

## Current Status

⚠️ **Icons needed!** The app will work without icons, but users won't be able to install it as a PWA until these files are added.

Placeholder icons can be created quickly using the ImageMagick commands above, or design custom icons for a polished look.
