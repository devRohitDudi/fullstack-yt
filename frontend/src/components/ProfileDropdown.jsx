import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, Settings, Upload } from "lucide-react";
import useAuthStore from "../store/useAuthStore.js";
import axios from "axios";
const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isLoggedIn, currentUsername } = useAuthStore();
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const { userAvatar } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const loggedOutUser = await fetch(
        "http://localhost:4000/api/v1/user/logout",
        {
          method: "POST",
          credentials: "include", // Send HttpOnly cookies
        }
      );
      console.log("loggedOutuser; ", loggedOutUser);
    } catch (error) {
      console.error("Error occured while logging out:", error);
    }
    window.location.href = "/";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {isloading ? (
        <div className="flex justify-center items-center">
          <div className="h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <img
          src={userAvatar || null}
          alt="login"
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 bg-white rounded-full hover:ring-2 hover:ring-blue-500 transition-all"
        />
      )}

      {isOpen && (
        <div className="absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg bg-zinc-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {isLoggedIn ? (
              <>
                <Link
                  to={`/channel/get/${currentUsername}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Channel
                </Link>
                <Link
                  to="/upload"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
                <button
                  to="/logout"
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
