import React from "react";

const PlaylistCard = ({ playlist }) => {
  return (
    <div
      key={playlist._id}
      className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors"
    >
      <div className="relative aspect-video">
        <img
          src={playlist.thumbnailUrl}
          alt={playlist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <span className="text-lg font-semibold">
            {playlist.videoCount} videos
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{playlist.title}</h3>
        <p className="text-sm text-gray-400 mt-1">
          {playlist.videoCount} videos • Updated{" "}
          {new Date(playlist.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PlaylistCard;
