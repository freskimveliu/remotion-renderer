import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface FadeTransitionProps {
  children: React.ReactNode;
  durationInFrames: number;
  startFrame?: number;
  fadeIn?: number;
  fadeOut?: number;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  durationInFrames,
  startFrame = 0,
  fadeIn = 15,
  fadeOut = 15,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  const opacity = interpolate(
    relativeFrame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return <div style={{ opacity, width: "100%", height: "100%" }}>{children}</div>;
};
