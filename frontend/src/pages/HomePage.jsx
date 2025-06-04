import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar.jsx";
// import VideoGrid from "../components/VideoGrid.jsx";
import axios from "axios";
import VideoCard from "../components/VideoCard.jsx";

import useAuthStore from "../store/useAuthStore.js";
import { usePreferencesStore } from "../store/useAuthStore.js";
const HomePage = ({ sidebarOpen }) => {
  const [videos, setVideos] = useState([]);
  //   const [page, setPage] = useState(1);
  let page = 1;
  const [fetchedVideosCount, setFetchedVideosCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const isFetched = useRef(false);
  const [error, setError] = useState();

  const { interests, setUserInterests } = usePreferencesStore();
  const handleSetInterests = async () => {};

  const fetchSomeVideos = async () => {
    if (isFetching || isFetched.current) return;

    try {
      setIsFetching(true);
      const response = await axios.post(
        `http://localhost:4000/api/v1/video/home?limit=10&page=${page}`,
        {
          localInterests: interests,
        },
        { withCredentials: "include", headers: {} }
      );
      const videosResponse = response.data.message.videos;
      console.log(videosResponse);

      if (response.status === 200) {
        setVideos((prev) => [...prev, ...response.data.message.videos]);
        page++;
        console.log("Now page is:", page);

        if (videosResponse.length === 0) {
          isFetched.current = true;
          console.log("setIsfetched:", isFetched.current);
        }
      }
      console.log("now page is:", page);

      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      setError(error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isFetching || isFetched.current) return;

      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        fetchSomeVideos();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Trigger fetch only once on first render
    fetchSomeVideos();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 pb-16 md:pb-0">
      <div className="flex">
        <div className="flex-1">
          {sidebarOpen && <Sidebar sidebarOpen={sidebarOpen} />}
          <main className="flex-1 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
            {isFetching ? (
              <div className="flex justify-center items-center ">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
