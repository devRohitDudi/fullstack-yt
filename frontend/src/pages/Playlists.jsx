import axios from "axios";
import { PlayIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore.js";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function PlaylistCard({ playlist }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { isLoggenIn } = useAuthStore();
  const [isDeleted, setIsDeleted] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/playlist/${playlist._id}`);
  };

  const deletePlaylist = async () => {
    try {
      const response = await axios.patch(
        `
                    http://localhost:4000/api/v1/playlist/delete-playlist/${playlist._id}`,
        {},
        {
          withCredentials: "include",
          headers: {},
        }
      );

      if (response.status === 200) {
        alert("that fucking playlist was deleted");
        setIsDeleted(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  if (isDeleted) {
    return null;
  }
  return (
    <div className="relative hover:shadow-xl transition-shadow">
      <div className="relative">
        <img
          onClick={handleNavigate}
          src={playlist.thumbnail}
          alt={playlist.name}
          className="rounded-t-lg w-full h-40 object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {playlist.videos.length} videos
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <span onClick={handleNavigate} className="font-semibold truncate w-4/5">
          {playlist.name}
        </span>
        <svg
          onClick={() => setIsPopupOpen((prev) => !prev)}
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#e3e3e3"
          className="cursor-pointer"
        >
          <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
        </svg>
      </div>

      {isPopupOpen && (
        <div className="absolute left-4 bottom-4 backdrop-blur-sm bg-white/30 rounded shadow-md p-2 space-y-2 z-10">
          <button
            onClick={deletePlaylist}
            className="block w-full text-left hover:text-blue-500 px-2 py-1"
          >
            Remove
          </button>
          <button className="block w-full text-left hover:text-blue-500 px-2 py-1">
            Edit
          </button>
          <button className="block w-full text-left hover:text-blue-500 px-2 py-1">
            Share
          </button>
          <button className="block w-full text-left hover:text-blue-500 px-2 py-1">
            Replica
          </button>
        </div>
      )}
    </div>
  );
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      console.log("playlist fetch invoked");

      const response = await axios.post(
        "http://localhost:4000/api/v1/playlist/get-all-playlists",
        { currentVideo: null },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Full response:", response); // this is not printing
      if (response.status === 200) {
        setPlaylists(response.data.message.playlists);
        console.log("setPlaylists success");
      } else {
        console.error("Unexpected status:", response.status); // this is not printing
      }
    } catch (error) {
      console.error("API Error:", error.response || error.message || error); // this is not printing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);
  //   if (!isLoggenIn) {
  //     return (
  //       <div className="flex justify-center flex-col items-center">
  //         <h1>Login is required to create and use playlists</h1>
  //         <div className="gap-2 flex ">
  //           <Link className="flex rounded-xl bg-blue-700 py-2 px-4" to="/login">
  //             Login
  //           </Link>
  //           <Link className="flex rounded-xl bg-blue-700 py-2 px-4" to="/signup">
  //             Signup
  //           </Link>
  //         </div>
  //       </div>
  //     );
  //   }
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Your Playlists</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {playlists.map((playlist, index) => (
          <PlaylistCard key={index} playlist={playlist} />
        ))}
      </div>
    </div>
  );
}
