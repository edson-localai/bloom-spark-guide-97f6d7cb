I will implement the HCB Ar Condicionado Automotivo landing page following the provided prompt.

### Design System & Setup
- Configure `src/index.css` with the custom color palette, fonts (Bebas Neue, Rajdhani, Inter), and global styles including glassmorphism and glow effects.
- Update `index.html` to include Google Fonts.

### Component Development (Single Page Architecture)
- **Header**: Sticky navigation with glassmorphism, SVG logo, and WhatsApp CTA.
- **HeroSection**: High-impact introduction with animated CSS backgrounds (radial gradients, grids, floating elements) and primary CTAs.
- **StatsBar**: Quick credential bar highlighting key business metrics with Lucide icons.
- **ProductsSection**: Grid of product cards (Compressors, Condensers, etc.) with hover effects.
- **SegmentsSection**: Breakdown of served markets (Light, Heavy, Off-road) with tailored icons.
- **WhyUsSection**: Detailed value propositions and a highlight card for the Denso partnership.
- **GuaranteeSection**: Trust-building section focusing on the 8-month warranty and original parts.
- **CTASection**: Final conversion point with large buttons and location details.
- **Footer**: Brand summary, navigation links, and legal information.

### Interactions & Polish
- Use **Framer Motion** for scroll-reveal animations (fade-in, slide-up, stagger) on all sections.
- Implement smooth scrolling for all internal navigation links.
- Ensure 100% responsiveness from mobile to desktop.
- Strictly use CSS/SVG for all visuals as requested (no external images).

### Technical Details
- **Stack**: React, TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- **No External Assets**: All icons from Lucide, all graphics via CSS/SVG.
- **Contact Integration**: All links mapped to the provided WhatsApp, Instagram, and Google Maps URLs.