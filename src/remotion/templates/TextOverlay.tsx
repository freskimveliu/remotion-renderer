import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Img,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { TextOverlayProps } from "../../types";

export const TextOverlay: React.FC<TextOverlayProps> = ({
  title,
  subtitle,
  backgroundColor = "#1a1a2e",
  gradientColor,
  textColor = "#ffffff",
  fontFamily = "Arial",
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade out at the end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const background = gradientColor
    ? `linear-gradient(135deg, ${backgroundColor} 0%, ${gradientColor} 100%)`
    : backgroundColor;

  // Subtle animated accent line
  const lineWidth = interpolate(frame, [20, 50], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Logo */}
      {logoUrl && (
        <div
          style={{
            position: "absolute",
            top: 60,
            opacity: interpolate(frame, [0, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Img
            src={logoUrl}
            style={{ height: 60, objectFit: "contain" }}
          />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: "0 80px",
        }}
      >
        <AnimatedText
          text={title}
          color={textColor}
          fontSize={72}
          fontFamily={fontFamily}
          fontWeight={800}
          delay={5}
        />

        {/* Accent line */}
        <div
          style={{
            width: lineWidth,
            height: 4,
            backgroundColor: textColor,
            opacity: 0.6,
            borderRadius: 2,
          }}
        />

        {subtitle && (
          <AnimatedText
            text={subtitle}
            color={textColor}
            fontSize={36}
            fontFamily={fontFamily}
            fontWeight={400}
            delay={20}
            style={{ opacity: 0.85 }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
