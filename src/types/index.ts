import { z } from "zod";

// --- Template Input Props Schemas ---

export const TextOverlayPropsSchema = z.object({
  title: z.string().default("Hello World"),
  subtitle: z.string().optional(),
  backgroundColor: z.string().default("#1a1a2e"),
  gradientColor: z.string().optional(),
  textColor: z.string().default("#ffffff"),
  fontFamily: z.string().default("Arial"),
  logoUrl: z.string().url().optional(),
});

export const ImageSlideshowPropsSchema = z.object({
  images: z.array(z.string().url()).min(1).max(10),
  transitionDuration: z.number().min(5).max(30).default(15),
  backgroundColor: z.string().default("#000000"),
  title: z.string().optional(),
  textColor: z.string().default("#ffffff"),
  logoUrl: z.string().url().optional(),
});

export const PostPromoPropsSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  imageUrl: z.string().url(),
  logoUrl: z.string().url().optional(),
  backgroundColor: z.string().default("#0f0f23"),
  accentColor: z.string().default("#e94560"),
  textColor: z.string().default("#ffffff"),
  ctaText: z.string().optional(),
});

export const HtmlAnimatorPropsSchema = z.object({
  templateUrl: z.string().min(1),
  animationStyle: z.enum([
    "field-reveal",
    "ken-burns",
    "slide-in",
    "fade-pulse",
    "typewriter",
    "zoom-bounce",
    "glitch",
    "rotate-3d",
    "blur-focus",
    "cinematic-bars",
    "text-highlight",
    "wave-distort",
    "typed",
    "anime-text",
  ]).default("field-reveal"),
});

export const VideoOverlayPropsSchema = z.object({
  url: z.string().min(1),              // iframe template URL — renders text/logo overlays
  originalVideo: z.string().min(1),    // direct video file URL — rendered natively via <OffthreadVideo>
});

// --- Inferred types ---

export type TextOverlayProps = z.infer<typeof TextOverlayPropsSchema>;
export type ImageSlideshowProps = z.infer<typeof ImageSlideshowPropsSchema>;
export type PostPromoProps = z.infer<typeof PostPromoPropsSchema>;
export type HtmlAnimatorProps = z.infer<typeof HtmlAnimatorPropsSchema>;
export type VideoOverlayProps = z.infer<typeof VideoOverlayPropsSchema>;

// --- Screenshot request schema ---

export const ScreenshotRequestSchema = z.object({
  html: z.string().min(1),
  width: z.number().int().min(1).max(3840).default(1080),
  height: z.number().int().min(1).max(2160).default(1080),
  format: z.enum(["png", "jpeg", "webp"]).default("png"),
});

export type ScreenshotRequest = z.infer<typeof ScreenshotRequestSchema>;

// --- Render request schema ---

export const RenderRequestSchema = z.object({
  template: z.enum(["text-overlay", "image-slideshow", "post-promo", "html-animator", "video-overlay"]),
  inputProps: z.record(z.unknown()),
  width: z.number().int().min(100).max(3840).default(1080),
  height: z.number().int().min(100).max(3840).default(1080),
  fps: z.number().int().min(1).max(120).default(30),
  durationInSeconds: z.number().min(1).max(120).default(5),
  codec: z.enum(["h264", "h265", "vp8", "vp9"]).default("h264"),
});

export type RenderRequest = z.infer<typeof RenderRequestSchema>;

// --- Job types ---

export type JobStatus = "queued" | "bundling" | "rendering" | "done" | "failed" | "cancelled";

export interface RenderJob {
  id: string;
  status: JobStatus;
  progress: number;
  template: string;
  inputProps: Record<string, unknown>;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  codec: string;
  outputUrl: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Template metadata ---

export interface TemplateParam {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
  description: string;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  params: TemplateParam[];
  defaultDimensions: { width: number; height: number };
}

// --- Map template ID to composition ID ---

export const TEMPLATE_TO_COMPOSITION: Record<string, string> = {
  "text-overlay": "TextOverlay",
  "image-slideshow": "ImageSlideshow",
  "post-promo": "PostPromo",
  "html-animator": "HtmlAnimator",
  "video-overlay": "VideoOverlay",
};
