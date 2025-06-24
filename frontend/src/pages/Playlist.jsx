import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const backendAddress = "https://fullstack-yt.onrender.com";

const VideoCard = ({ video, isOwner }) => {
  console.log("video is:", video);
  const [isPopuoOpen, setIsPopupOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const playlist_id = useParams();

  const removeVideo = async () => {
    try {
      const response = await axios.patch(
        `${backendAddress}/api/v1/playlist/remove-from-playlist`,
        {
          video_id: video._id,
          playlist_id: playlist_id.playlist_id,
        },
        { withCredentials: "include", headers: {} }
      );
      if (response.status === 200) {
        setIsDeleted(true);
        alert("that fucking video is removed");
      }
    } catch (error) {
      console.error(error);
    }
  };
  if (isDeleted) return null;
  return (
    <div className=" relative bg-white shadow-md rounded-xl overflow-hidden">
      <img
        src={video.thumbnail1}
        alt={video.title}
        className="w-full h-48 object-cover"
      />
      <div className=" flex  justify-between p-4 bg-black">
        <div>
          <h2 className="text-lg font-semibold">{video.title}</h2>
          <p className="text-sm text-gray-600">{video.createdAt}</p>
        </div>
        <div>
          <svg
            onClick={() => setIsPopupOpen((prev) => !prev)}
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e3e3e3"
          >
            <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
          </svg>
        </div>
      </div>
      {isPopuoOpen && (
        <div className="absolute left-2 bottom-2 backdrop-blur bg-white/20 items-start rounded-xl p-2 flex flex-col">
          {isOwner && <button onClick={removeVideo}>Remove</button>}
          <button>Share</button>
          <button>Embed</button>
          <button>Replica</button>
        </div>
      )}
    </div>
  );
};

const Playlist = () => {
  // Now fetch it using params
  const playlist_id = useParams();
  const [playlist, setPlaylist] = useState();
  const [isOwner, setIsOwner] = useState(false);
  const fetchPlaylist = async () => {
    try {
      console.log("playlist_id is:", playlist_id.playlist_id);
      const response = await axios.get(
        `${backendAddress}/api/v1/playlist/get-playlist/${playlist_id.playlist_id}`,
        { withCredentials: "include" }
      );
      console.log("response:", response);

      if (response.status === 200) {
        setPlaylist(response.data.message.playlist);
        setIsOwner(response.data.message.isOwner);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchPlaylist();
  }, []);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
      {playlist &&
        playlist.videos.map((video, index) => (
          <VideoCard key={index} isOwner={isOwner} video={video} />
        ))}
    </div>
  );
};

export default Playlist;
