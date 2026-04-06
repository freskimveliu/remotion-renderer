import React from "react";
import { Composition, registerRoot } from "remotion";
import { TextOverlay } from "./templates/TextOverlay";
import { ImageSlideshow } from "./templates/ImageSlideshow";
import { PostPromo } from "./templates/PostPromo";
import { HtmlAnimator } from "./templates/HtmlAnimator";
import { HtmlScreenshot } from "./templates/HtmlScreenshot";
import { VideoOverlay } from "./templates/VideoOverlay";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextOverlay"
        component={TextOverlay}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          title: "Hello World",
          subtitle: "This is a subtitle",
          backgroundColor: "#1a1a2e",
          textColor: "#ffffff",
          fontFamily: "Arial",
        }}
      />

      <Composition
        id="ImageSlideshow"
        component={ImageSlideshow}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          images: [
            "https://picsum.photos/seed/1/1080/1080",
            "https://picsum.photos/seed/2/1080/1080",
            "https://picsum.photos/seed/3/1080/1080",
          ],
          transitionDuration: 15,
          backgroundColor: "#000000",
          textColor: "#ffffff",
        }}
      />

      <Composition
        id="PostPromo"
        component={PostPromo}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          title: "Check out our latest post!",
          subtitle: "Follow us for more content",
          imageUrl: "https://picsum.photos/seed/promo/1080/1080",
          backgroundColor: "#0f0f23",
          accentColor: "#e94560",
          textColor: "#ffffff",
          ctaText: "Learn More",
        }}
      />
      <Composition
        id="HtmlAnimator"
        component={HtmlAnimator}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1350}
        defaultProps={{
          templateUrl: "https://example.com/template/index.html",
          animationStyle: "field-reveal" as const,
        }}
      />
      <Composition
        id="HtmlScreenshot"
        component={HtmlScreenshot}
        durationInFrames={1}
        fps={1}
        width={1080}
        height={1080}
        defaultProps={{
          html: "<h1>Hello World</h1>",
        }}
      />
      <Composition
        id="VideoOverlay"
        component={VideoOverlay}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1350}
        defaultProps={{
          url: "https://example.com/template.html",
          originalVideo: "https://example.com/video.mp4",
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
