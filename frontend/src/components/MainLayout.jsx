// MainLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import { useState } from "react";

export default function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hideBottomBarRoutes = ["/login", "/signup", "/upload"];
  const shouldShowBottomBar = !hideBottomBarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "md:ml-64" : "ml-0"
          }`}
        >
          <Outlet />
        </main>
      </div>
      {shouldShowBottomBar && <BottomBar />}
    </div>
  );
}
