import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { PostPromoProps } from "../../types";

export const PostPromo: React.FC<PostPromoProps> = ({
  title,
  subtitle,
  imageUrl,
  logoUrl,
  backgroundColor = "#0f0f23",
  accentColor = "#e94560",
  textColor = "#ffffff",
  ctaText,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Image entrance from right
  const imageSlide = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });
  const imageTranslateX = interpolate(imageSlide, [0, 1], [width, 0]);

  // Accent bar animation
  const barHeight = interpolate(frame, [0, 30], [0, height], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA animation
  const ctaOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaScale = spring({
    frame: frame - 50,
    fps,
    config: { damping: 10, stiffness: 150, mass: 0.4 },
  });

  // Fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const isVertical = height > width;

  return (
    <AbsoluteFill style={{ backgroundColor, opacity: fadeOut }}>
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 8,
          height: barHeight,
          backgroundColor: accentColor,
        }}
      />

      {/* Layout */}
      <div
        style={{
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Text side */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: isVertical ? "60px 50px 30px" : "60px 50px",
            gap: 16,
          }}
        >
          {/* Logo */}
          {logoUrl && (
            <div
              style={{
                opacity: interpolate(frame, [0, 15], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                marginBottom: 20,
              }}
            >
              <Img
                src={logoUrl}
                style={{ height: 50, objectFit: "contain" }}
              />
            </div>
          )}

          <AnimatedText
            text={title}
            color={textColor}
            fontSize={isVertical ? 56 : 52}
            fontWeight={800}
            delay={10}
            style={{ textAlign: "left" }}
          />

          {subtitle && (
            <AnimatedText
              text={subtitle}
              color={textColor}
              fontSize={isVertical ? 28 : 24}
              fontWeight={400}
              delay={25}
              style={{ textAlign: "left", opacity: 0.8 }}
            />
          )}

          {/* CTA Button */}
          {ctaText && (
            <div
              style={{
                marginTop: 24,
                opacity: ctaOpacity,
                transform: `scale(${ctaScale})`,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: accentColor,
                  color: textColor,
                  padding: "14px 32px",
                  borderRadius: 8,
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "Arial",
                }}
              >
                {ctaText}
              </div>
            </div>
          )}
        </div>

        {/* Image side */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            transform: `translateX(${imageTranslateX}px)`,
          }}
        >
          <Img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
