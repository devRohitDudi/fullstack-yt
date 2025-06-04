import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";
const BottomBar = () => {
  const [show, setShow] = useState(true);
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    const pathSegment = pathname.split("/")[2]; // adjust index based on URL
    if (pathSegment) setActiveTab(pathSegment);
  }, [pathname]);

  let lastScrollY = window.scrollY;
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY) {
      setShow(false); // scrolling down
    } else {
      setShow(true); // scrolling up
    }
    lastScrollY = currentScrollY;
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 border-t-[1px] border-zinc-800 left-0 w-full bg-zinc-900 text-white flex justify-around py-2 transition-transform duration-300 z-50 ${
        show ? "translate-y-0" : "translate-y-full"
      } md:hidden`}
    >
      <div className="flex flex-col items-center text-xs">
        <Link to="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill={`${activeTab === "home" ? "#4B87D1" : "#e3e3e3"}`}
          >
            <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
          </svg>
        </Link>
      </div>
      <div className="flex flex-col items-center text-xs">
        <Link to="/trending">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e3e3e3"
          >
            <path d="M240-400q0 52 21 98.5t60 81.5q-1-5-1-9v-9q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60v9q0 4-1 9 39-35 60-81.5t21-98.5q0-50-18.5-94.5T648-574q-20 13-42 19.5t-45 6.5q-62 0-107.5-41T401-690q-39 33-69 68.5t-50.5 72Q261-513 250.5-475T240-400Zm240 52-57 56q-11 11-17 25t-6 29q0 32 23.5 55t56.5 23q33 0 56.5-23t23.5-55q0-16-6-29.5T537-292l-57-56Zm0-492v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-129 86.5-245T480-840Z" />
          </svg>
        </Link>
      </div>
      <div className="flex flex-col items-center text-xs">
        <button
          onClick={() =>
            isLoggedIn
              ? setIsPopupOpen((prev) => !prev)
              : alert("Login is required to upload content")
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e3e3e3"
          >
            <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col items-center text-xs">
        <Link to="/subscription">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e3e3e3"
          >
            <path d="M160-80q-33 0-56.5-23.5T80-160v-400q0-33 23.5-56.5T160-640h640q33 0 56.5 23.5T880-560v400q0 33-23.5 56.5T800-80H160Zm0-80h640v-400H160v400Zm240-40 240-160-240-160v320ZM160-680v-80h640v80H160Zm120-120v-80h400v80H280ZM160-160v-400 400Z" />
          </svg>
        </Link>
      </div>
      <div className="flex flex-col items-center text-xs">
        <Link to="/library">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e3e3e3"
          >
            <path d="m460-380 280-180-280-180v360ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" />
          </svg>
        </Link>
      </div>

      {isPopupOpen && (
        <div className="flex flex-col fixed bottom-12 gap-2 backdrop-blur bg-white/5 items-center px-4 py-2 rounded-xl left-[50%] ">
          <Link to="create/post">Post</Link>
          <Link to="create/video">Video</Link>
          <Link to="create/live">Live</Link>
        </div>
      )}
    </div>
  );
};

export default BottomBar;
