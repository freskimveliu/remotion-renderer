import React, { useCallback, useRef, useState } from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  delayRender,
  continueRender,
} from "remotion";
import { VideoOverlayProps } from "../../types";

export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  url,
  originalVideo,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [handle] = useState(() =>
    delayRender("Waiting for iframe to load", { timeoutInMilliseconds: 60000 })
  );
  const [resolved, setResolved] = useState(false);

  const resolve = useCallback(() => {
    if (!resolved) {
      setResolved(true);
      continueRender(handle);
    }
  }, [handle, resolved]);

  const handleIframeLoad = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        const style = doc.createElement("style");
        // Strategy: hide the iframe's own <video> element AND every wrapper that
        // contains a media placeholder so the underlying <OffthreadVideo> shows
        // through. Text/icon placeholders keep their styling because they don't
        // rely on container backgrounds.
        style.textContent = `
          video { visibility: hidden !important; }
          html, body { background: transparent !important; background-color: transparent !important; background-image: none !important; }
          [class*="cocon-image"], [class*="cocon-video"], [class*="cocon-media"] {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
          }
          .cocon-placeholder-parent, .cocon-placeholder-container {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
          }
          .video-wrapper {
            background: transparent !important;
            background-color: transparent !important;
          }
        `;
        doc.head.appendChild(style);

        // Walk the DOM and zero out any element whose computed background is the
        // brand color or an opaque solid — this catches runtime-applied inline
        // styles from the template's JS that the static rules above can't target.
        const win = iframeRef.current?.contentWindow;
        if (win) {
          const all = doc.querySelectorAll<HTMLElement>("*");
          all.forEach((el) => {
            const cs = win.getComputedStyle(el);
            const bg = cs.backgroundColor;
            // Match anything that's not transparent and not "rgba(...0)"
            if (bg && bg !== "transparent" && !bg.includes("rgba(0, 0, 0, 0)")) {
              // Skip text-bearing elements that legitimately need backgrounds
              const tag = el.tagName.toLowerCase();
              if (tag !== "span" && tag !== "p" && tag !== "h1" && tag !== "h2" && tag !== "h3") {
                el.style.setProperty("background", "transparent", "important");
                el.style.setProperty("background-color", "transparent", "important");
              }
            }
          });
        }
      }
    } catch (err) {
      // Cross-origin or other access error — proceed anyway.
      console.warn("VideoOverlay: could not inject styles into iframe", err);
    }

    // Give the template's JS (Vue/Nuxt) time to boot and apply field/style updates
    setTimeout(resolve, 2500);
  }, [resolve]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Background layer — the actual video, frame-stepped natively by Remotion */}
      <AbsoluteFill style={{ zIndex: 1 }}>
        <OffthreadVideo
          src={originalVideo}
          muted={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>

      {/* Overlay layer — iframe template providing text/logo overlays */}
      <AbsoluteFill style={{ zIndex: 2 }}>
        <iframe
          ref={iframeRef}
          src={url}
          onLoad={handleIframeLoad}
          onError={resolve}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            background: "transparent",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
