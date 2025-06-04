import { Link } from "react-router-dom";

const SearchCard = ({ video }) => {
  return (
    <Link to={`/watch?v=${video._id}`}>
      <div className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors">
        <div className="relative aspect-video">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 text-sm rounded">
            {video.duration}
          </span>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {video.title}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span>{video.views} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <img
              src={video.channel.avatarUrl}
              alt={video.channel.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-gray-400">
              {video.channel.name}
            </span>
          </div>
          
          <p className="mt-2 text-sm text-gray-400 line-clamp-2">
            {video.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default SearchCard; 