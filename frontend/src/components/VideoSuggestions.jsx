import { Link } from "react-router-dom";

const VideoSuggestions = ({ videos }) => {
  return (
    <div className="w-full md:w-80 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Suggested Videos</h2>
      {videos.map((video) => (
        <Link
          key={video._id}
          to={`/watch?v=${video._id}`}
          className="flex gap-2 hover:bg-zinc-800 p-2 rounded-lg transition-colors"
        >
          <div className="relative w-40 aspect-video flex-shrink-0">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover rounded-lg"
            />
            <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 px-1 text-xs rounded">
              {video.duration}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{video.channel.name}</p>
            <div className="text-xs text-gray-400 mt-1">
              {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default VideoSuggestions; 