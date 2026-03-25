import React, { useCallback, useRef, useState } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  continueRender,
  delayRender,
} from "remotion";
import { HtmlAnimatorProps } from "../../types";

function getAnimationStyles(
  style: string, frame: number, fps: number, dur: number, w: number, h: number,
): { container: React.CSSProperties; iframe: React.CSSProperties; overlays?: React.CSSProperties[] } {
  const outro = 20;
  switch (style) {
    case "field-reveal": {
      const p = interpolate(frame, [0, dur * 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
      const s = interpolate(p, [0, 1], [1.4, 1]);
      const ty = interpolate(p, [0, 1], [-15, 0]);
      const cl = interpolate(frame, [0, dur * 0.7], [40, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
      const op = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return { container: { transform: `scale(${s}) translateY(${ty}%)`, opacity: op, clipPath: `inset(0 0 ${100 - cl}% 0)` }, iframe: {} };
    }
    case "ken-burns": {
      const z = interpolate(frame, [0, dur], [1, 1.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const px = interpolate(frame, [0, dur], [0, -3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const py = interpolate(frame, [0, dur], [0, -2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const op = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return { container: { transform: `scale(${z}) translate(${px}%, ${py}%)`, opacity: op }, iframe: {} };
    }
    case "slide-in": {
      const sp = spring({ frame, fps, config: { damping: 18, stiffness: 80, mass: 0.8 } });
      const tx = interpolate(sp, [0, 1], [110, 0]);
      const r = interpolate(sp, [0, 1], [5, 0]);
      const so = interpolate(sp, [0, 1], [0, 0.15]);
      return { container: { transform: `translateX(${tx}%) rotate(${r}deg)`, boxShadow: `${-20 * so}px 0 ${60 * so}px rgba(0,0,0,${so})`, borderRadius: "12px", overflow: "hidden" }, iframe: {} };
    }
    case "fade-pulse": {
      const fi = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
      const pp = interpolate(frame, [20, dur - outro], [0, Math.PI * 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return { container: { transform: `scale(${1 + Math.sin(pp) * 0.008})`, opacity: fi, filter: `brightness(${1 + Math.sin(pp * 0.7) * 0.03})` }, iframe: {} };
    }
    case "typewriter": {
      const wp = interpolate(frame, [5, dur * 0.65], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
      const op = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const sly = interpolate(frame, [5, dur * 0.65], [0, h], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
      return { container: { clipPath: `inset(0 0 ${100 - wp}% 0)`, opacity: op }, iframe: {}, overlays: [{ position: "absolute", left: 0, right: 0, top: sly, height: 3, background: "linear-gradient(90deg, transparent 0%, #F25E7A 50%, transparent 100%)", opacity: wp < 100 ? 0.6 : 0, zIndex: 10, boxShadow: "0 0 20px rgba(242, 94, 122, 0.5)" }] };
    }
    case "zoom-bounce": {
      const bs = spring({ frame, fps, config: { damping: 8, stiffness: 120, mass: 0.6 } });
      const sc = interpolate(bs, [0, 1], [0.3, 1]);
      const rs = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 100, mass: 0.4 } });
      const rt = interpolate(rs, [0, 1], [-8, 0]);
      return { container: { transform: `scale(${sc}) rotate(${rt}deg)`, borderRadius: "12px", overflow: "hidden" }, iframe: {} };
    }
    case "glitch": {
      const ge = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const ga = frame < dur * 0.3;
      const gi = ga ? interpolate(frame, [0, dur * 0.3], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
      const ox = Math.sin(frame * 7.3) * gi; const oy = Math.cos(frame * 5.1) * gi * 0.5;
      const sx = Math.sin(frame * 11.7) * gi * 0.3;
      const fl = ga && frame % 4 === 0 ? 0.85 : 1;
      return { container: { transform: `translate(${ox}px, ${oy}px) skewX(${sx}deg)`, opacity: ge * fl }, iframe: {}, overlays: ga ? [{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)", pointerEvents: "none", zIndex: 10 }] : undefined };
    }
    case "rotate-3d": {
      const fp = spring({ frame, fps, config: { damping: 14, stiffness: 60, mass: 1.0 } });
      const ry = interpolate(fp, [0, 1], [-90, 0]);
      const sf = interpolate(fp, [0, 0.5, 1], [0.8, 0.9, 1]);
      return { container: { perspective: "1200px", transformStyle: "preserve-3d" as const }, iframe: { transform: `rotateY(${ry}deg) scale(${sf})`, backfaceVisibility: "hidden" as const } };
    }
    case "blur-focus": {
      const fp = interpolate(frame, [0, dur * 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
      const bl = interpolate(fp, [0, 1], [20, 0]);
      const sc = interpolate(fp, [0, 1], [1.08, 1]);
      const br = interpolate(fp, [0, 0.5, 1], [1.3, 1.1, 1]);
      return { container: { filter: `blur(${bl}px) brightness(${br})`, transform: `scale(${sc})` }, iframe: {} };
    }
    case "cinematic-bars": {
      const bp = interpolate(frame, [10, dur * 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
      const bh = interpolate(bp, [0, 1], [50, 0]);
      const zm = interpolate(frame, [0, dur], [1.05, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const fi = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return { container: { transform: `scale(${zm})`, clipPath: `inset(${bh}% 0 ${bh}% 0)`, opacity: fi }, iframe: {} };
    }
    case "text-highlight": {
      const fi = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
      const cyc = dur * 0.4; const sf = frame % cyc;
      const sx = interpolate(sf, [0, cyc], [-30, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const so = frame > 15 && frame < dur - outro ? 0.4 : 0;
      return { container: { opacity: fi }, iframe: {}, overlays: [{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${sx - 15}%, rgba(255,255,255,0.8) ${sx}%, transparent ${sx + 15}%)`, opacity: so, pointerEvents: "none", zIndex: 10 }] };
    }
    case "wave-distort": {
      const sp = interpolate(frame, [0, dur * 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
      const wi = interpolate(sp, [0, 1], [15, 0]);
      const ofy = Math.sin(frame * 0.15) * wi; const sk = Math.sin(frame * 0.12) * wi * 0.4;
      const scx = 1 + Math.sin(frame * 0.15) * wi * 0.003;
      const fi = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return { container: { transform: `translateY(${ofy}px) skewX(${sk}deg) scaleX(${scx})`, opacity: fi }, iframe: {} };
    }
    case "typed": {
      // Full template visible, with a repeating shine sweep + subtle zoom
      const fi = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
      const zoomIn = interpolate(frame, [0, dur], [1, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      // Shine sweep across entire template (repeats twice)
      const sweepDur = Math.floor(dur * 0.35);
      const sweepFrame = frame % sweepDur;
      const sweepX = interpolate(sweepFrame, [0, sweepDur], [-20, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const sweepActive = frame > 10 && frame < dur - outro;

      // Pulsing glow border
      const glowPulse = Math.sin(frame * 0.08) * 0.5 + 0.5;
      const glowOpacity = frame > 15 && frame < dur - outro ? glowPulse * 0.12 : 0;

      return {
        container: { opacity: fi, transform: `scale(${zoomIn})` }, iframe: {},
        overlays: [
          // Shine sweep
          ...(sweepActive ? [{
            position: "absolute" as const, inset: 0,
            background: `linear-gradient(105deg, transparent ${sweepX - 10}%, rgba(255,255,255,0.6) ${sweepX}%, transparent ${sweepX + 10}%)`,
            opacity: 0.35, pointerEvents: "none" as const, zIndex: 10,
          }] : []),
          // Glow border
          {
            position: "absolute" as const, inset: 0,
            border: "3px solid rgba(242, 94, 122, 0.4)",
            borderRadius: "4px",
            opacity: glowOpacity, pointerEvents: "none" as const, zIndex: 11,
            boxShadow: `inset 0 0 30px rgba(242, 94, 122, ${glowOpacity})`,
          },
        ],
      };
    }
    case "anime-text": {
      // Staggered band reveal with spring
      const numBands = 5;
      const overlays: React.CSSProperties[] = [];
      for (let i = 0; i < numBands; i++) {
        const bandSpring = spring({ frame: frame - i * 6, fps, config: { damping: 12, stiffness: 150, mass: 0.5 } });
        const bandOp = interpolate(bandSpring, [0, 1], [1, 0]);
        const bandTop = (i / numBands) * 100;
        const bandHeight = 100 / numBands;
        overlays.push({ position: "absolute", left: 0, right: 0, top: `${bandTop}%`, height: `${bandHeight}%`, backgroundColor: "#ffffff", opacity: bandOp, zIndex: 10, pointerEvents: "none" });
      }
      const scaleSpring = spring({ frame, fps, config: { damping: 15, stiffness: 80, mass: 0.6 } });
      const sc = interpolate(scaleSpring, [0, 1], [0.9, 1]);
      return { container: { transform: `scale(${sc})` }, iframe: {}, overlays };
    }
    default: {
      const fi = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return { container: { opacity: fi }, iframe: {} };
    }
  }
}

export const HtmlAnimator: React.FC<HtmlAnimatorProps> = ({
  templateUrl,
  animationStyle = "field-reveal",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
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

  const sendPostMessages = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow || !templateUrl) return;

    try {
      const url = new URL(templateUrl);
      const params = url.searchParams;

      // Build fields object from URL params
      const fields: Record<string, string> = {};
      params.forEach((value, key) => {
        if (key.startsWith("customField__")) {
          // Decode the base64 key to get the placeholder|type format
          const encoded = key.replace("customField__", "");
          try {
            const decoded = atob(encoded);
            fields[decoded] = value;
          } catch {
            fields[key] = value;
          }
        }
      });

      // Send field updates
      iframe.contentWindow.postMessage({ event: "setAutoResize", data: { fields } }, "*");
      iframe.contentWindow.postMessage({ event: "fieldsUpdated", data: { fields } }, "*");

      // Send style updates
      const styles: Record<string, string> = {};
      if (params.get("primary_color")) styles.primary_color = params.get("primary_color")!;
      if (params.get("secondary_color")) styles.secondary_color = params.get("secondary_color")!;
      if (params.get("tertiary_color")) styles.tertiary_color = params.get("tertiary_color")!;
      if (params.get("font_family")) styles.font_family = params.get("font_family")!;

      iframe.contentWindow.postMessage({ event: "stylesUpdated", data: styles }, "*");
    } catch (e) {
      // Ignore URL parsing errors
    }
  }, [templateUrl]);

  const handleIframeLoad = useCallback(() => {
    // Send postMessage multiple times to ensure template processes it
    sendPostMessages();
    setTimeout(sendPostMessages, 300);
    setTimeout(sendPostMessages, 800);
    setTimeout(sendPostMessages, 1500);
    setTimeout(resolve, 2500);
  }, [resolve, sendPostMessages]);

  const handleIframeError = useCallback(() => {
    resolve();
  }, [resolve]);

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const styles = getAnimationStyles(animationStyle, frame, fps, durationInFrames, width, height);

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: fadeOut }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: "center center",
          position: "relative",
          ...styles.container,
        }}
      >
        {templateUrl && (
          <iframe
            ref={iframeRef}
            src={templateUrl}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ width, height, border: "none", ...styles.iframe }}
          />
        )}
      </div>
      {styles.overlays?.map((s, i) => (
        <div key={i} style={s as React.CSSProperties} />
      ))}
    </AbsoluteFill>
  );
};
