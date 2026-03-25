import React, { useCallback, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";

export interface HtmlScreenshotProps {
  html: string;
}

export const HtmlScreenshot: React.FC<HtmlScreenshotProps> = ({ html }) => {
  const [handle] = useState(() =>
    delayRender("Waiting for iframe content to load", { timeoutInMilliseconds: 30000 })
  );

  const onIframeLoad = useCallback(() => {
    // Wait for the template's Vue app to boot and apply styles from URL params
    setTimeout(() => {
      continueRender(handle);
    }, 5000);
  }, [handle]);

  return (
    <AbsoluteFill>
      <iframe
        src={html}
        onLoad={onIframeLoad}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </AbsoluteFill>
  );
};
