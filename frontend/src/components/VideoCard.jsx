import React from "react";

const VideoCard = ({ video }) => {
  return (
    <div className=" w-full max-w-sm mx-auto p-1 bg-zinc-900 rounded-lg shadow hover:shadow-lg transition">
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="w-full aspect-video object-cover rounded-t-lg overflow-hidden"
      />
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
        <p className="text-gray-600 text-sm">{video.channelName}</p>
        <p className="text-gray-500 text-xs">
          {video.views} • {video.time}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
