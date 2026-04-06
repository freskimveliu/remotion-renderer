import { Router } from "express";
import path from "path";
import fs from "fs";

const logFile = path.resolve("./storage/logs/render-debug.log");
function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const line = data
    ? `[${timestamp}] ${message}\n${JSON.stringify(data, null, 2)}\n`
    : `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, line);
}
import { v4 as uuidv4 } from "uuid";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import {
  RenderRequestSchema,
  RenderJob,
  TEMPLATE_TO_COMPOSITION,
  TextOverlayPropsSchema,
  ImageSlideshowPropsSchema,
  PostPromoPropsSchema,
  HtmlAnimatorPropsSchema,
  VideoOverlayPropsSchema,
} from "../../types";
import { jobQueue } from "../queue";

const router = Router();

const outputDir = path.resolve(process.env.OUTPUT_DIR || "./public/output");

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

// Cache the bundle location so we only bundle once
let bundleLocationCache: string | null = null;

async function getBundleLocation(): Promise<string> {
  if (bundleLocationCache) return bundleLocationCache;

  const entryPoint = path.resolve(__dirname, "../../remotion/index.tsx");
  bundleLocationCache = await bundle({
    entryPoint,
    onProgress: (progress) => {
      if (Math.round(progress * 100) % 25 === 0) {
        console.log(`Bundling: ${Math.round(progress * 100)}%`);
      }
    },
  });
  return bundleLocationCache;
}

function validateInputProps(
  template: string,
  inputProps: Record<string, unknown>
): { success: boolean; error?: string; data?: Record<string, unknown> } {
  const schemas: Record<string, { safeParse: (data: unknown) => { success: boolean; data?: unknown; error?: { issues: { path: (string | number)[]; message: string }[] } } }> = {
    "text-overlay": TextOverlayPropsSchema,
    "image-slideshow": ImageSlideshowPropsSchema,
    "post-promo": PostPromoPropsSchema,
    "html-animator": HtmlAnimatorPropsSchema,
    "video-overlay": VideoOverlayPropsSchema,
  };

  const schema = schemas[template];
  if (!schema) {
    return { success: false, error: `Unknown template: ${template}` };
  }

  const result = schema.safeParse(inputProps);
  if (!result.success) {
    return {
      success: false,
      error: result.error?.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") ?? "Validation failed",
    };
  }

  return { success: true, data: result.data as Record<string, unknown> };
}

// Set up the job processor
jobQueue.setProcessor(async (job: RenderJob) => {
  try {
    // Check if already cancelled
    if (job.status === "cancelled") return;

    jobQueue.updateJob(job.id, { status: "bundling", progress: 0 });

    const bundleLocation = await getBundleLocation();

    // Check if cancelled during bundling
    const currentJob = jobQueue.getJob(job.id);
    if (currentJob?.status === "cancelled") return;

    jobQueue.updateJob(job.id, { status: "rendering", progress: 0 });

    const compositionId = TEMPLATE_TO_COMPOSITION[job.template];

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: job.inputProps,
      logLevel: "error",
    });

    // Override composition dimensions and duration from the job request
    const compositionWithOverrides = {
      ...composition,
      width: job.width,
      height: job.height,
      fps: job.fps,
      durationInFrames: job.durationInFrames,
    };

    const outputFile = `${job.id}.mp4`;
    const outputLocation = path.join(outputDir, outputFile);

    await renderMedia({
      serveUrl: bundleLocation,
      codec: job.codec as "h264",
      composition: compositionWithOverrides,
      outputLocation,
      inputProps: job.inputProps,
      timeoutInMilliseconds: 120000,
      onProgress: ({ progress }) => {
        const currentJob = jobQueue.getJob(job.id);
        if (currentJob?.status === "cancelled") {
          throw new Error("Render cancelled");
        }
        jobQueue.updateJob(job.id, { progress: Math.round(progress * 100) });
      },
      chromiumOptions: {
        disableWebSecurity: true,
        ignoreCertificateErrors: true,
      },
    });

    // Final check for cancellation
    const finalJob = jobQueue.getJob(job.id);
    if (finalJob?.status === "cancelled") {
      // Clean up the output file
      if (fs.existsSync(outputLocation)) {
        fs.unlinkSync(outputLocation);
      }
      return;
    }

    jobQueue.updateJob(job.id, {
      status: "done",
      progress: 100,
      outputUrl: `/output/${outputFile}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown render error";
    const currentJob = jobQueue.getJob(job.id);

    if (currentJob?.status !== "cancelled") {
      jobQueue.updateJob(job.id, { status: "failed", error: message });
    }
  }
});

// POST /api/render — Queue a new render job
router.post("/", (req, res) => {
  log("=== RENDER REQUEST ===");
  log("Raw body", req.body);

  const parsed = RenderRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    log("Request schema validation FAILED", parsed.error.issues);
    res.status(400).json({
      error: "Invalid request",
      details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    });
    return;
  }

  const { template, inputProps, width, height, fps, durationInSeconds, codec } = parsed.data;

  log("Parsed template: " + template);
  log("Parsed inputProps", inputProps);

  // Validate template-specific inputProps
  const validation = validateInputProps(template, inputProps);
  if (!validation.success) {
    log("InputProps validation FAILED: " + validation.error);
    res.status(400).json({ error: "Invalid inputProps", details: validation.error });
    return;
  }
  log("InputProps validation OK");

  const durationInFrames = Math.round(durationInSeconds * fps);
  const jobId = uuidv4();
  const now = new Date().toISOString();

  const job: RenderJob = {
    id: jobId,
    status: "queued",
    progress: 0,
    template,
    inputProps: validation.data!,
    width,
    height,
    fps,
    durationInFrames,
    codec,
    outputUrl: null,
    error: null,
    createdAt: now,
    updatedAt: now,
  };

  jobQueue.addJob(job);

  res.status(202).json({
    jobId: job.id,
    status: job.status,
    message: "Render job queued",
  });
});

// GET /api/render/:jobId — Get render status
router.get("/:jobId", (req, res) => {
  const job = jobQueue.getJob(req.params.jobId);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    outputUrl: job.outputUrl,
    error: job.error,
    template: job.template,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
});

// POST /api/render/:jobId/cancel — Cancel a render
router.post("/:jobId/cancel", (req, res) => {
  const job = jobQueue.getJob(req.params.jobId);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const cancelled = jobQueue.cancelJob(req.params.jobId);

  if (!cancelled) {
    res.status(409).json({
      error: "Cannot cancel job",
      details: `Job is in '${job.status}' state`,
    });
    return;
  }

  res.json({ id: job.id, status: "cancelled", message: "Render job cancelled" });
});

export default router;
