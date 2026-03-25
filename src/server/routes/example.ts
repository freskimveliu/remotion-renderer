import { Router } from "express";

const router = Router();

/**
 * GET /api/examples — Returns example API calls for each template.
 * Useful as a quick reference for the Laravel integration.
 */
router.get("/", (_req, res) => {
  res.json({
    description: "Example API calls for each template. Copy any 'body' object and POST it to /api/render.",
    examples: [
      {
        name: "Text Overlay — Instagram Square",
        method: "POST",
        url: "/api/render",
        headers: { "Content-Type": "application/json", "X-API-Key": "your-api-key" },
        body: {
          template: "text-overlay",
          inputProps: {
            title: "Check out our new post!",
            subtitle: "Follow us for more",
            backgroundColor: "#1a1a2e",
            gradientColor: "#16213e",
            textColor: "#ffffff",
          },
          width: 1080,
          height: 1080,
          fps: 30,
          durationInSeconds: 5,
        },
      },
      {
        name: "Text Overlay — YouTube Landscape",
        method: "POST",
        url: "/api/render",
        headers: { "Content-Type": "application/json", "X-API-Key": "your-api-key" },
        body: {
          template: "text-overlay",
          inputProps: {
            title: "Big Announcement!",
            subtitle: "Watch now",
            backgroundColor: "#0a0a23",
            textColor: "#00d4ff",
          },
          width: 1920,
          height: 1080,
          fps: 30,
          durationInSeconds: 6,
        },
      },
      {
        name: "Text Overlay — Stories/Reels Vertical",
        method: "POST",
        url: "/api/render",
        headers: { "Content-Type": "application/json", "X-API-Key": "your-api-key" },
        body: {
          template: "text-overlay",
          inputProps: {
            title: "Swipe Up!",
            subtitle: "Limited time offer",
            backgroundColor: "#e94560",
            textColor: "#ffffff",
          },
          width: 1080,
          height: 1920,
          fps: 30,
          durationInSeconds: 4,
        },
      },
      {
        name: "Image Slideshow — 3 images",
        method: "POST",
        url: "/api/render",
        headers: { "Content-Type": "application/json", "X-API-Key": "your-api-key" },
        body: {
          template: "image-slideshow",
          inputProps: {
            images: [
              "https://picsum.photos/seed/slide1/1080/1080",
              "https://picsum.photos/seed/slide2/1080/1080",
              "https://picsum.photos/seed/slide3/1080/1080",
            ],
            transitionDuration: 15,
            title: "Our Latest Collection",
            backgroundColor: "#000000",
            textColor: "#ffffff",
          },
          width: 1080,
          height: 1080,
          fps: 30,
          durationInSeconds: 9,
        },
      },
      {
        name: "Post Promo — with CTA",
        method: "POST",
        url: "/api/render",
        headers: { "Content-Type": "application/json", "X-API-Key": "your-api-key" },
        body: {
          template: "post-promo",
          inputProps: {
            title: "New Product Launch",
            subtitle: "Discover what's next for your workflow",
            imageUrl: "https://picsum.photos/seed/promo/1080/1080",
            backgroundColor: "#0f0f23",
            accentColor: "#e94560",
            textColor: "#ffffff",
            ctaText: "Shop Now",
          },
          width: 1080,
          height: 1080,
          fps: 30,
          durationInSeconds: 6,
        },
      },
    ],
  });
});

export default router;
