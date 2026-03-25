import { Router } from "express";
import { TemplateInfo } from "../../types";

const router = Router();

const templates: TemplateInfo[] = [
  {
    id: "text-overlay",
    name: "Text Overlay",
    description:
      "Animated text on a solid or gradient background. Great for quotes, announcements, and short messages.",
    defaultDimensions: { width: 1080, height: 1080 },
    params: [
      { name: "title", type: "string", required: true, description: "Main text to display" },
      { name: "subtitle", type: "string", required: false, description: "Secondary text below the title" },
      { name: "backgroundColor", type: "string", required: false, default: "#1a1a2e", description: "Background color (hex)" },
      { name: "gradientColor", type: "string", required: false, description: "Second color for gradient background (hex)" },
      { name: "textColor", type: "string", required: false, default: "#ffffff", description: "Text color (hex)" },
      { name: "fontFamily", type: "string", required: false, default: "Arial", description: "Font family" },
      { name: "logoUrl", type: "string", required: false, description: "URL to a logo image" },
    ],
  },
  {
    id: "image-slideshow",
    name: "Image Slideshow",
    description:
      "Multiple images with smooth transitions. Perfect for carousel-style videos and photo collections.",
    defaultDimensions: { width: 1080, height: 1080 },
    params: [
      { name: "images", type: "string[]", required: true, description: "Array of image URLs (1-10)" },
      { name: "transitionDuration", type: "number", required: false, default: 15, description: "Transition duration in frames" },
      { name: "backgroundColor", type: "string", required: false, default: "#000000", description: "Background color (hex)" },
      { name: "title", type: "string", required: false, description: "Optional title text overlay" },
      { name: "textColor", type: "string", required: false, default: "#ffffff", description: "Text color (hex)" },
      { name: "logoUrl", type: "string", required: false, description: "URL to a logo image" },
    ],
  },
  {
    id: "post-promo",
    name: "Post Promo",
    description:
      "Text + image + logo composition for promoting a social media post with a call to action.",
    defaultDimensions: { width: 1080, height: 1080 },
    params: [
      { name: "title", type: "string", required: true, description: "Main headline text" },
      { name: "subtitle", type: "string", required: false, description: "Supporting text" },
      { name: "imageUrl", type: "string", required: true, description: "URL to the main image" },
      { name: "logoUrl", type: "string", required: false, description: "URL to a logo image" },
      { name: "backgroundColor", type: "string", required: false, default: "#0f0f23", description: "Background color (hex)" },
      { name: "accentColor", type: "string", required: false, default: "#e94560", description: "Accent color for highlights (hex)" },
      { name: "textColor", type: "string", required: false, default: "#ffffff", description: "Text color (hex)" },
      { name: "ctaText", type: "string", required: false, description: "Call-to-action text (e.g. 'Learn More')" },
    ],
  },
  {
    id: "html-animator",
    name: "HTML Animator",
    description:
      "Renders a campaign HTML template in an iframe and animates fields appearing sequentially. Designed for cocon.center campaign templates.",
    defaultDimensions: { width: 1080, height: 1350 },
    params: [
      { name: "templateUrl", type: "string", required: true, description: "Full URL to the campaign HTML template" },
      { name: "fields", type: "object[]", required: false, description: "Array of {placeholder, value} objects to animate into the template" },
      { name: "styles", type: "object", required: false, description: "Brand styles: primary_color, secondary_color, tertiary_color, font_family, font_family_url" },
      { name: "logo", type: "string", required: false, description: "URL to the company logo" },
    ],
  },
];

router.get("/", (_req, res) => {
  res.json({ templates });
});

export default router;
