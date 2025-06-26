import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar.jsx";
// import VideoGrid from "../components/VideoGrid.jsx";
import axios from "axios";
import VideoCard from "../components/VideoCard.jsx";
import useClickOutside from "../utils/useClickOutside.js";
import useAuthStore from "../store/useAuthStore.js";
import { usePreferencesStore } from "../store/useAuthStore.js";
const backendAddress = "https://fullstack-yt.onrender.com";

const HomePage = ({ sidebarOpen }) => {
  const [videos, setVideos] = useState([]);
  //   const [page, setPage] = useState(1);
  let page = 1;
  const [fetchedVideosCount, setFetchedVideosCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const isFetched = useRef(false);
  const [error, setError] = useState();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const [isPlylistsOpen, setIsPlylistsOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [playlistText, setPlaylistText] = useState("");
  const [newPlaylistVisibility, setNewPlaylistVisibility] = useState("private");
  const { isLoggedIn, currentUsername } = useAuthStore();
  const [homeMessage, setHomeMessage] = useState('');

  const { interests, setUserInterests } = usePreferencesStore();
  const handleSetInterests = async () => { };

  const fetchSomeVideos = async () => {
    if (isFetching || isFetched.current) return;

    try {
      setIsFetching(true);
      const response = await axios.post(
        `${backendAddress}/api/v1/video/home?limit=10&page=${page}`,
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
      setHomeMessage("If the videos are not loading, it’s likely our backend has spun down due to inactivity. Please refresh the page a few times to wake it up.")
      setError(error);
    }
  };

  const fetchPlaylistsInfo = async () => {
    if (playlists.length >= 1) {
      return;
    }
    try {
      setPlaylistsLoading(true);
      const response = await axios.post(
        `${backendAddress}/api/v1/playlist/get-all-playlists`,
        { currentVideo: currentVideo.video._id },
        {
          withCredentials: "include",
          headers: {},
        }
      );
      console.log("playlists response:", response);

      if (response.status === 200) {
        setPlaylists(response.data.message.playlists);
      }
      setPlaylistsLoading(false);
    } catch (error) {
      alert(
        error.response?.data?.message || "error occured while fetching playists"
      );
      setPlaylistsLoading(false);
    }
  };
  const savePlaylists = async () => {
    try {
      for (const playlist of playlists) {
        const response = await axios.patch(
          `${backendAddress}/api/v1/playlist/update-video-status`,
          {
            video_id: currentVideo.video._id,
            containsVideo: playlist.containsVideo,
            playlist_id: playlist._id,
          },
          {
            withCredentials: "include",
            headers: {},
          }
        );
        if (response.status === 200) {
          console.log("playlist updated");
        }
      }
      setIsPlylistsOpen(false);
    } catch (error) {
      console.error(error);
    }
  };
  const createPlaylist = async () => {
    try {
      const response = await axios.patch(
        `${backendAddress}/api/v1/playlist/create-playlist`,
        { name: playlistText, visibility: newPlaylistVisibility },
        { withCredentials: "include", headers: {} }
      );
      if (response.status === 200) {
        fetchPlaylistsInfo();
        alert(`playlist ${playlistText} is created `);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const addToWatchLater = async () => {
    try {
      const videoId = currentVideo.video._id.toString();

      const response = await axios.patch(
        `${backendAddress}/api/v1/playlist/add-to-watch-later/${videoId}`,
        {},
        { withCredentials: true, headers: {} }
      );
      if (response.status === 200) {
        alert("video added to watch later");
      }
    } catch (error) {
      console.log(error.response?.data?.message || error);
    }
  };
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Copied to clipboard!");
    } catch (err) {
      alert("Failed to copy: ");
    }
  }

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
    if (isFetching) return;
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
                <VideoCard
                  key={video._id}
                  setIsPopupOpen={setIsPopupOpen}
                  setCurrentVideo={setCurrentVideo}
                  video={video}
                />
              ))}
            </div>
            {isFetching ? (
              <div className="flex justify-center items-center ">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : null
            }
            {
              homeMessage.length > 1 ? <div className="text-bold text-gray-200">{homeMessage}</div> : null
            }

          </main>
        </div>
      </div>
      {isPopupOpen && (
        <div className=" absolute left-1/2 top-1/2 p-2 rounded-xl z-10 eft-2 bg-zinc-800 flex flex-col gap-2 items-start">
          <button className="flex gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 100q-68 0-123.5 38.5T276-280h66q22-37 58.5-58.5T480-360q43 0 79.5 21.5T618-280h66q-25-63-80.5-101.5T480-420Zm0 340q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z" />
            </svg>{" "}
            Not interested
          </button>
          <button className="flex gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
            </svg>{" "}
            Download
          </button>
          <button className="flex gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z" />
            </svg>{" "}
            Share
          </button>
          <button
            onClick={() =>
              copyToClipboard(`${backendAddress}/watch?v=${currentVideo._id}`)
            }
            className="flex gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z" />
            </svg>{" "}
            Copy Link
          </button>
          {isLoggedIn && (
            <button onClick={addToWatchLater} className="flex gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e3e3e3"
              >
                <path d="M440-360h80v-120h120v-80H520v-120h-80v120H320v80h120v120ZM320-120v-80H160q-33 0-56.5-23.5T80-280v-480q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v480q0 33-23.5 56.5T800-200H640v80H320ZM160-280h640v-480H160v480Zm0 0v-480 480Z" />
              </svg>{" "}
              Add to watch later
            </button>
          )}
          {isLoggedIn && (
            <button
              onClick={() => {
                setIsPlylistsOpen((prev) => !prev);
                fetchPlaylistsInfo();
              }}
              className="flex gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e3e3e3"
              >
                <path d="M120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Zm520 480v-160H480v-80h160v-160h80v160h160v80H720v160h-80Z" />
              </svg>{" "}
              Add to playlist
            </button>
          )}
          {isLoggedIn && (
            <button className="flex gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e3e3e3"
              >
                <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
              </svg>{" "}
              Report
            </button>
          )}
          {currentVideo.isOwner && (
            <button className="flex gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e3e3e3"
              >
                <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z" />
              </svg>{" "}
              Delete
            </button>
          )}
        </div>
      )}
      {/* playlists popup */}
      {isPlylistsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-center">{`Hello, ${currentUsername}`}</h2>

            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto scrollbar-thin">
              {playlistsLoading ? (
                <p className="text-center text-zinc-400">
                  Loading playlists...
                </p>
              ) : (
                playlists.map((playlist, index) => (
                  <label
                    key={playlist._id}
                    className="flex items-center gap-3 bg-zinc-800 p-3 rounded-xl cursor-pointer hover:bg-zinc-700 transition"
                  >
                    <input
                      type="checkbox"
                      checked={playlist.containsVideo}
                      className="accent-pink-500 h-5 w-5"
                      onChange={() => {
                        const updated = [...playlists];
                        updated[index].containsVideo =
                          !updated[index].containsVideo;
                        setPlaylists(updated);
                      }}
                    />
                    <span className="text-base">{playlist.name}</span>
                  </label>
                ))
              )}
            </div>
            <div>
              {creatingPlaylist ? (
                <div className="flex justify-between  p-2">
                  <input
                    className="border-1 border-gray-500 px-2 py-1 rounded-lg"
                    onChange={(e) => setPlaylistText(e.target.value)}
                    value={playlistText}
                    placeholder="Enter playlist name"
                  />
                  <select
                    name="visibility"
                    id="visibility"
                    value={newPlaylistVisibility}
                    onChange={(e) => setNewPlaylistVisibility(e.target.value)}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                  <button
                    disabled={!playlistText.trim()}
                    onClick={createPlaylist}
                  >
                    Create
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCreatingPlaylist((prev) => !prev);
                  }}
                  className="bg-zinc-800 p-3 rounded-xl cursor-pointer hover:bg-zinc-700 transition"
                >
                  Create a new playlist
                </button>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsPlylistsOpen((prev) => !prev)}
                className="px-4 py-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={savePlaylists}
                className="px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-500 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
