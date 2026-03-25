import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Img,
  Sequence,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { ImageSlideshowProps } from "../../types";

export const ImageSlideshow: React.FC<ImageSlideshowProps> = ({
  images,
  transitionDuration = 15,
  backgroundColor = "#000000",
  title,
  textColor = "#ffffff",
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const imageCount = images.length;
  const framesPerImage = Math.floor(durationInFrames / imageCount);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Images */}
      {images.map((imageUrl, index) => {
        const startFrame = index * framesPerImage;

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={framesPerImage + transitionDuration}
          >
            <SlideImage
              imageUrl={imageUrl}
              durationInFrames={framesPerImage + transitionDuration}
              transitionDuration={transitionDuration}
              width={width}
              height={height}
              index={index}
            />
          </Sequence>
        );
      })}

      {/* Title overlay */}
      {title && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 80,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: "20px 40px",
              borderRadius: 12,
            }}
          >
            <AnimatedText
              text={title}
              color={textColor}
              fontSize={48}
              fontWeight={700}
              delay={10}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* Logo */}
      {logoUrl && (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            opacity: interpolate(frame, [0, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Img src={logoUrl} style={{ height: 50, objectFit: "contain" }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

const SlideImage: React.FC<{
  imageUrl: string;
  durationInFrames: number;
  transitionDuration: number;
  width: number;
  height: number;
  index: number;
}> = ({ imageUrl, durationInFrames, transitionDuration, width, height, index }) => {
  const frame = useCurrentFrame();

  // Fade in/out
  const opacity = interpolate(
    frame,
    [0, transitionDuration, durationInFrames - transitionDuration, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle Ken Burns zoom effect
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Alternate pan direction per slide
  const panX = interpolate(
    frame,
    [0, durationInFrames],
    index % 2 === 0 ? [-10, 10] : [10, -10],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={imageUrl}
        style={{
          width,
          height,
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${panX}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
