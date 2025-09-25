"use client"
import VideoJs from "@/components/post/video-Js-player";
import { Skeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";
import videojs from "video.js";

function VideoPlayer({videoUrl, thumbnailImageUrl}:{videoUrl:string, thumbnailImageUrl?:string}){
  const playerRef = React.useRef<videojs.Player|undefined>(undefined);

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    muted: true,
    sources: [
      {
        src: videoUrl,
        type: "application/x-mpegURL",
      },
    ],
    poster:
      thumbnailImageUrl ||
      "https://vidme-video-sharing-website-private.s3.ap-south-1.amazonaws.com/674db4b94f6966c47d740174_video-thumbnails-1.webp",
  };

  const handlePlayerReady = (player:videojs.Player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };
  return (
    <div className="w-full aspect-video">
      <div className="w-full overflow-hidden rounded-md">
        

        <VideoJs options={videoJsOptions} onReady={handlePlayerReady} />
        
      </div>
    </div>
  );
}

export default VideoPlayer;
