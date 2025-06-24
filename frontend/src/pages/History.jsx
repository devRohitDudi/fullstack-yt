import React, { useEffect, useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import axios from "axios";

const backendAddress = "https://fullstack-yt.onrender.com";

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

// ScrollArea Component
export const ScrollArea = ({ children, className }) => (
  <div className={`overflow-y-auto ${className}`}>{children}</div>
);

const HistoryVideoCard = ({ video, history_obj_id }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setloading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);

  const removeFromHistory = async () => {
    try {
      console.log("history_obj_id is:", history_obj_id);
      const response = await axios.patch(
        `${backendAddress}/api/v1/video/remove-watch-history/${history_obj_id}`,
        {},
        {
          withCredentials: "include",
          headers: {},
        }
      );
      if (response.status == 200) {
        setIsDeleted(true);
        alert("Video removed from watch history");
      }
    } catch (error) {
      setError(error.message);
      alert(
        error.response?.data?.message ||
        "Error occured while removing from watch history"
      );
    }
  };
  if (isDeleted) {
    return null;
  }
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <Card className="relative  w-full md:max-w-72">
      <div className="bg-gray-300 rounded-t-xl" />
      <img className="aspect-video" src={video.thumbnail1} alt="" />
      <CardContent className="p-4 bg-zinc-800 space-y-2">
        <p className="font-semibold text-sm line-clamp-2">{video.title}</p>
        <p className="text-xs text-gray-600">{video.channel}</p>
        <p className="text-xs text-gray-600">
          {video.views} Views • {new Date(video.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
      <button
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        className="absolute bottom-2 right-2 p-1 rounded hover:bg-zinc-700"
      >
        <MoreVertical size={18} />
      </button>
      {isPopupOpen && (
        <div className="flex flex-col items-start backdrop-blur bg-white/30 rounded-lg absolute bottom-0 right-o p-2 gap-2">
          <button onClick={removeFromHistory} className="hover:pointer">
            Remove
          </button>
          <button className="hover:pointer">Share</button>
          <button className="hover:pointer">Downlaod</button>
        </div>
      )}
    </Card>
  );
};

const WatchHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [fetchedHistoryCount, setFetchedHistoryCount] = useState(0);
  const [isTotalFetched, setIsTotalFetched] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSomeHistory = async () => {
    if (isTotalFetched || isLoading) return;
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${backendAddress}/api/v1/video/get-watch-history?page=${page}&limit=20`,
        {
          withCredentials: "include",
          headers: {},
        }
      );
      const fetchedHistory = response.data.message.history;
      console.log("fetchedHistory.length:", fetchedHistory.length);

      if (fetchedHistory.length === 0) {
        setIsTotalFetched(true);
        return;
      }
      console.log("watchHisstory:", response);
      setHistory((prev) => [...prev, ...fetchedHistory]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSomeHistory();
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        fetchSomeHistory();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isTotalFetched, page]);

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-xl font-bold mb-4">Watch History</h1>
      <ScrollArea className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {history.map((item, index) => (
          <HistoryVideoCard
            key={index}
            history_obj_id={item._id}
            video={item.video}
          />
        ))}
      </ScrollArea>
    </main>
  );
};

export default WatchHistoryPage;
