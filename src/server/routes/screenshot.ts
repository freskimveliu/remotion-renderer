import { Router } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { openBrowser } from "@remotion/renderer";
// @ts-expect-error internal API
import { screenshot as takeScreenshot } from "@remotion/renderer/dist/puppeteer-screenshot";
import { ScreenshotRequestSchema } from "../../types";

const router = Router();

const outputDir = path.resolve(process.env.OUTPUT_DIR || "./public/output");

fs.mkdirSync(outputDir, { recursive: true });

const ONE_HOUR_MS = 60 * 60 * 1000;

const cleanupOldFiles = () => {
  try {
    const files = fs.readdirSync(outputDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(outputDir, file);
      const stat = fs.statSync(filePath);

      if (now - stat.mtimeMs > ONE_HOUR_MS) {
        fs.unlinkSync(filePath);
      }
    }
  } catch {
    // Ignore cleanup errors
  }
};

// POST /api/screenshot
router.post("/", async (req, res) => {
  cleanupOldFiles();
  const parsed = ScreenshotRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid request",
      details: parsed.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`
      ),
    });
    return;
  }

  const { html, width, height, format } = parsed.data;

  const browser = await openBrowser("chrome", {
    chromiumOptions: {
      disableWebSecurity: true,
      ignoreCertificateErrors: true,
    },
  });

  try {
    const page = await browser.newPage({
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      context: { getSourceMap: () => null },
    });

    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto({ url: html, timeout: 30000 });

    // Wait for Vue app to boot and apply styles from URL params
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const id = uuidv4();
    const outputFile = `${id}.${format}`;
    const outputLocation = path.join(outputDir, outputFile);

    await takeScreenshot({
      page,
      type: format === "webp" ? "png" : format,
      path: outputLocation,
      omitBackground: false,
      width,
      height,
      scale: 1,
    });

    await page.close();

    res.json({
      outputUrl: `/output/${outputFile}`,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown screenshot error";
    console.error("[screenshot] Error:", message);
    res.status(500).json({ error: message });
  } finally {
    await browser.close({ silent: false });
  }
});

export default router;
