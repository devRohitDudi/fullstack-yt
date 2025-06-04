import { Link } from "react-router-dom";

function ChannelVideoCard({ video }) {
  return (
    <Link to={`/watch?v=${video._id}`} className="group">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <img
          src={video.thumbnail1}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 text-sm rounded">
          {video.duration.toFixed(2)}
        </span>
      </div>
      <div className="mt-2">
        <h3 className="font-semibold line-clamp-2 group-hover:text-blue-400">
          {video.title}
        </h3>
        <div className="text-sm text-gray-400 mt-1">
          {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}

export default ChannelVideoCard;
