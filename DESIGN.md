---
name: Artesano Premium
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#53443a'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#867369'
  outline-variant: '#d8c2b6'
  surface-tint: '#8e4e1e'
  primary: '#8b4b1c'
  on-primary: '#ffffff'
  primary-container: '#a96332'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb688'
  secondary: '#9c432e'
  on-secondary: '#ffffff'
  secondary-container: '#fe8f75'
  on-secondary-container: '#762714'
  tertiary: '#5d5c58'
  on-tertiary: '#ffffff'
  tertiary-container: '#767470'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc7'
  primary-fixed-dim: '#ffb688'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#713707'
  secondary-fixed: '#ffdad2'
  secondary-fixed-dim: '#ffb4a3'
  on-secondary-fixed: '#3d0700'
  on-secondary-fixed-variant: '#7d2c19'
  tertiary-fixed: '#e6e2dd'
  tertiary-fixed-dim: '#c9c6c1'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#484743'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
  section-gap: 120px
---

## Brand & Style
The brand personality is a sophisticated fusion of traditional Argentine bakery heritage and modern culinary precision. It targets a discerning audience that values artisanal craftsmanship, slow living, and high-quality ingredients. The emotional response should be one of "nostalgic warmth"—evoking the smell of freshly baked sourdough and dulce de leche in a contemporary, sun-drenched space.

The design style is **Editorial Minimalism**. It prioritizes heavy whitespace to allow high-fidelity photography of textures (flour, golden crusts, melting caramel) to act as the primary visual driver. The aesthetic is clean and structured but avoids clinical coldness through the use of organic colors, subtle film grain, and "soft-touch" digital surfaces.

## Colors
The palette is rooted in the earth and the oven. The primary **Dulce de Leche** caramel provides a rich, appetizing warmth used for calls to action and highlights. The **Terracotta** secondary color is reserved for accents and artisanal validation (e.g., badges or "baked today" indicators).

The background uses **Bone**, a warm cream that prevents the "digital glare" of pure white, creating a paper-like, tactile quality. Text is set in **Ink**, a near-black that maintains high legibility while appearing softer and more organic than a true hex black.

## Typography
The typography follows an editorial hierarchy. **Libre Caslon Text** is used for headlines to convey a sense of history, literature, and artisanal authority. Its classic proportions feel premium and established.

For body text and functional UI elements, **DM Sans** provides a clean, geometric contrast. Its low-contrast strokes ensure maximum readability on digital screens without distracting from the characterful serif headlines. Labels should frequently use uppercase styling with slight letter spacing to mimic high-end product packaging.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop (12 columns) to maintain an editorial "magazine" feel, transitioning to a fluid single-column layout on mobile. 

Generous whitespace is the key differentiator; section gaps are intentionally large to allow the brand to breathe and feel exclusive. Alignment should favor asymmetrical compositions for lifestyle sections and strict, centered alignment for product displays. 
- **Mobile:** 20px margins, 16px gutters.
- **Desktop:** 80px margins, 24px gutters, max-width of 1440px.

## Elevation & Depth
This design system avoids heavy drop shadows in favor of **Tonal Layers**. Depth is created by placing cards or containers that are slightly lighter or darker than the base Bone background (using 5% opacity shifts).

When physical depth is required (e.g., for "Order Now" drawers or navigation menus), use **Ambient Shadows**: extremely soft, long-range blurs with a very low opacity (5-8%) tinted with the primary caramel color (#B36B39) rather than pure grey. This maintains the "warm" atmosphere even in the UI's functional layers.

## Shapes
The shape language is **Soft (0.25rem)**. This subtle rounding removes the aggressive sharpness of digital edges while maintaining a disciplined, professional appearance. 

Buttons and input fields should utilize this consistent soft corner. Photography should generally remain sharp-edged (0px) to preserve its editorial, high-end look, unless used in a "profile" or "story" context where a circular crop is appropriate.

## Components
- **Buttons:** Primary buttons use a solid Dulce de Leche (#B36B39) fill with Ink (#1A1A1A) text. Secondary buttons are outlined in Ink with a 1px stroke. All buttons use the `label-md` type style.
- **Input Fields:** Underlined or soft-bordered with the Bone background. Labels should sit above the field in uppercase `caption` style.
- **Cards:** Use a minimal 1px border of 10% Ink opacity. No shadows. Focus on the image aspect ratio (usually 4:5 for an editorial feel).
- **Chips/Badges:** Small, Terracotta-colored (#A64B35) circular badges for "New" or "Limited" items, using white text.
- **Lists:** Clean dividers using 1px lines in 10% Ink. Use the serif `headline-md` for product names within the list to maintain the artisanal feel.
- **Specialty Component - "The Baker's Note":** A callout box with a creamier background than the base, using the serif font in italic to denote a personal message or ingredient origin story.