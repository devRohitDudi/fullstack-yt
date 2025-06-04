import React from "react";
import { Book, Clock, History, Video, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
// Card Component
export const Card = ({ children, className }) => (
  <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

// CardContent Component
export const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

// Input Component
export const Input = ({ ...props }) => (
  <input
    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    {...props}
  />
);

// Button Component
export const Button = ({
  children,
  variant = "solid",
  className = "",
  ...props
}) => {
  const variants = {
    solid: "bg-blue-500 text-white hover:bg-blue-600",
    ghost: "bg-transparent hover:bg-gray-100 text-black",
  };

  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ScrollArea Component
export const ScrollArea = ({ children, className }) => (
  <div className={`overflow-y-auto ${className}`}>{children}</div>
);

const videos = Array.from({ length: 10 }).map((_, i) => ({
  title: `Video Title ${i + 1}`,
  channel: `Channel ${i + 1}`,
  views: `${(i + 1) * 5}K views`,
  date: `${i + 1} days ago`,
}));

const Sidebar = () => (
  <div className="w-full md:w-64 p-4 space-y-4">
    <Link to="playlists" variant="ghost" className="w-full justify-start gap-2">
      <Book size={20} /> Playlists
    </Link>
    <Link to="history" variant="ghost" className="w-full justify-start gap-2">
      <History size={20} /> History
    </Link>
    <Link
      to="watch-later"
      variant="ghost"
      className="w-full justify-start gap-2"
    >
      <Clock size={20} /> Watch later
    </Link>
    <Link
      to="liked-videos"
      variant="ghost"
      className="w-full justify-start gap-2"
    >
      <ThumbsUp size={20} /> Liked videos
    </Link>
    <Link
      to="your-videos"
      variant="ghost"
      className="w-full justify-start gap-2"
    >
      <Video size={20} /> Your videos
    </Link>
  </div>
);

const VideoCard = ({ title, channel, views, date }) => (
  <Card className="w-full md:w-72">
    <div className="bg-gray-300 h-40 rounded-t-xl" />
    <CardContent className="p-4 space-y-2">
      <p className="font-semibold text-sm line-clamp-2">{title}</p>
      <p className="text-xs text-gray-600">{channel}</p>
      <p className="text-xs text-gray-600">
        {views} • {date}
      </p>
    </CardContent>
  </Card>
);

const LibraryPage = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4">
        <h1 className="text-xl font-bold mb-4">Library</h1>
        <ScrollArea className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((video, index) => (
            <VideoCard key={index} {...video} />
          ))}
        </ScrollArea>
      </main>
    </div>
  );
};

export default LibraryPage;
