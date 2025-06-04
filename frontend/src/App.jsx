import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import Channel from "./pages/Channel";
import Search from "./pages/Search";
import Watch from "./pages/Watch";
import Navbar from "./components/Navbar";
import BottomBar from "./components/BottomBar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import useAuthStore from "./store/useAuthStore";
import VideoUpload from "./pages/VideoUpload";
import MainLayout from "./components/MainLayout";
import Settings from "./pages/Settings";
import LibraryPage from "./pages/Library.jsx";
import WatchHistoryPage from "./pages/History.jsx";
import Playlists from "./pages/Playlists.jsx";
import Playlist from "./pages/Playlist.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import PostPage from "./pages/PostPage.jsx";
import axios from "axios";

function App() {
  const { setIsLoggedIn, setCurrentUsername, userAvatar, setUserAvatar } =
    useAuthStore();

  useEffect(() => {
    async function getUser() {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/user/get-current-user",
          {
            withCredentials: "include",
          }
        );
        if (response.status === 200) {
          setUserAvatar(response.data.message.avatar);
          setIsLoggedIn(true);
          setCurrentUsername(response.data.message.username);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("get-current-user Error:", error);
        setIsLoggedIn(false);
      }
    }
    getUser();
  }, []);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/channel/get/:username" element={<Channel />} />
        <Route path="/playlist/:playlist_id" element={<Playlist />} />
        <Route path="/search" element={<Search />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/post/:post_id" element={<PostPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/history" element={<WatchHistoryPage />} />
        <Route path="/library/playlists" element={<Playlists />} />
      </Route>

      {/* Routes without BottomBar */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/create/video" element={<VideoUpload />} />
      <Route path="/create/post" element={<CreatePost />} />
      <Route path="/create/live" element={<VideoUpload />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
