import { Menu, Search, User, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import VideoUpload from "../pages/VideoUpload";
import ProfileDropdown from "./ProfileDropdown";
import Cookies from "js-cookie";
import useAuthStore from "../store/useAuthStore";
import { useEffect } from "react";
import axios from "axios";

const Navbar = ({ toggleSidebar }) => {
  const { isLoggedIn, currentUsername } = useAuthStore();
  console.log("isLoggedIn", isLoggedIn);

  return (
    <>
      <div className="max-w-screen h-15 p-2 flex items-center justify-between px-4 py-2 bg-zinc-900">
        {/* Left - Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="hidden md:block hover:pointer text-2xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
            </svg>
          </button>
          <Link to="/" className="text-white text-xl font-bold">
            YouTube
          </Link>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="flex w-full max-w-md">
            <input
              type="text"
              placeholder="Search"
              className="focus:border-blue-400 w-full border-[1px] border-zinc-700 px-4 py-1 rounded-l-full bg-zinc-800 text-white outline-none"
            />
            <button className="px-4 border-[1px] border-zinc-700 bg-zinc-700 rounded-r-full text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e3e3e3"
              >
                <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right - Icons */}
        <div className="flex items-center gap-4 text-white">
          <div className="block md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
            </svg>
          </div>

          {isLoggedIn && (
            <Link
              to="/create/video"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full hover:bg-zinc-700"
            >
              <Upload size={20} />
              <span className="hidden md:inline">Upload</span>
            </Link>
          )}

          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
            </svg>
          </div>

          <ProfileDropdown />
        </div>
      </div>
    </>
  );
};

export default Navbar;
