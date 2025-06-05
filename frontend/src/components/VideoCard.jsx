import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
const VideoCard = ({ video, setIsPopupOpen, setCurrentVideo }) => {
  const navigate = useNavigate();
  const { isLoggedIn, currentUsername } = useAuthStore();
  const isOwner = currentUsername === video.owner.username;

  const handlePopup = () => {
    setCurrentVideo({ video: video, isOwner: isOwner });
    setIsPopupOpen((prev) => !prev);
  };

  return (
    <>
      <Link
        to={`/watch?v=${video._id}`}
        className=" w-full max-w-sm mx-auto p-1 bg-zinc-900 rounded-lg shadow hover:shadow-lg transition"
      >
        <img
          src={video.thumbnail1}
          alt={video.title}
          className="w-full aspect-video object-cover rounded-t-lg overflow-hidden"
        />
        <div className="p-3 flex flex-col gap-1">
          {/* title div */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <img
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // stop event from bubbling to parent
                  navigate(`/channel/get/${video.owner.username}`);
                }}
                className="h-7 w-7 z-5 cursor-pointer hover:border rounded-full"
                src={video.owner.avatar}
                alt=""
              />
              <h3 className="font-semibold text-sm line-clamp-2">
                {video.title}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); // stop event from bubbling to parent
                handlePopup();
              }}
              className="z-6 hover:bg-gray-500 rounded-full p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e3e3e3"
              >
                <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-500 text-sm">{video.owner.fullName}</p>
          <p className="text-gray-500 text-xs">
            {video.views} Views •{" "}
            {new Date(video.createdAt).toLocaleString("en-IN")}
          </p>
        </div>

        {/* popup */}
      </Link>
    </>
  );
};

export default VideoCard;
