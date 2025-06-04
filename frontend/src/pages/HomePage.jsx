import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import VideoGrid from "../components/VideoGrid.jsx";
import axios from "axios";
import useAuthStore from "../store/useAuthStore.js";
const HomePage = ({ sidebarOpen }) => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    setVideos([
      {
        id: "1",
        title: "React Clone of YouTube",
        thumbnailUrl:
          "https://images.pexels.com/photos/28985912/pexels-photo-28985912/free-photo-of-rustic-wooden-cabin-in-lush-green-forest.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        channelName: "CodeWithRohit",
        views: "340K",
        time: "2 weeks ago",
      },
      {
        id: "2",
        title: "Tailwind CSS Full Tutorial",
        thumbnailUrl:
          "https://images.pexels.com/photos/30795200/pexels-photo-30795200/free-photo-of-red-barn-in-snowy-swedish-countryside.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        channelName: "TailwindMaster",
        views: "1.1M",
        time: "1 month ago",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 pb-16 md:pb-0">
      <div className="flex">
        <div className="flex-1">
          {sidebarOpen && <Sidebar sidebarOpen={sidebarOpen} />}
          <main className="flex-1 p-4">
            <VideoGrid videos={videos} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
