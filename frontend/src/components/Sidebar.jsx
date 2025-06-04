import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ sidebarOpen }) => {
  return (
    <div
      className={`fixed left-0 top-15 h-[calc(100vh-60px)] w-64 bg-zinc-900 transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        z-40 overflow-y-auto`}
    >
      <nav className="p-4 space-y-4">
        <Link to="/" className="block font-semibold hover:text-blue-400">
          Home
        </Link>
        <Link to="/explore" className="block hover:text-blue-400">
          Explore
        </Link>
        <Link to="/subscriptions" className="block hover:text-blue-400">
          Subscriptions
        </Link>
        <Link to="/library" className="block hover:text-blue-400">
          Library
        </Link>
        <Link to="/history" className="block hover:text-blue-400">
          History
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
