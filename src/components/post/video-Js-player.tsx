import React, { useEffect, useRef } from "react";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "videojs-http-source-selector";

// Extend Video.js types so TS knows about the plugin
declare module "video.js" {
  interface VideoJsPlayer {
    httpSourceSelector?: (options?: { default?: string }) => void;
  }
}

function VideoJs({
  options,
  onReady,
}: {
  options: VideoJsPlayerOptions;
  onReady: (player: VideoJsPlayer) => void;
}) {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered", "video-js");
      videoRef.current?.appendChild(videoElement);

      const player = videojs(videoElement, options, () => {
        videojs.log("Player ready");
        onReady && onReady(player);
      });

      player.ready(() => {
        // enable httpSourceSelector plugin
        if (typeof player.httpSourceSelector === "function") {
          player.httpSourceSelector({ default: "auto" });

          // add the quality selector button to the control bar
          // player.controlBar.addChild(
          //   "SourceMenuButton",
          //   {},
          //   player.controlBar.children().length - 2
          // );
        }
      });

      playerRef.current = player;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [options, onReady]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
}

export default VideoJs;
