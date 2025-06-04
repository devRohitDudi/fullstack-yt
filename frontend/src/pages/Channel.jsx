import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import ChannelVideoCard from "../components/ChannelVideoCard";
import ChannelPostCard from "../components/ChannelPostCard";
import PlaylistCard from "../components/PlaylistCard";
const Channel = () => {
  const { username } = useParams();
  const { isLoggedIn, currentUsername } = useAuthStore();
  const [channel, setChannel] = useState(null);
  const [subscribersCount, setSubscribersCount] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [posts, setPosts] = useState([]);

  const [videosCount, setVideosCount] = useState(0);
  const [playlistsCount, setPlaylistsCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  const [fetchedVideosCount, setFetchedVideosCount] = useState(0);
  const [fetchedPlaylistsCount, setFetchedPlaylistsCount] = useState(0);
  const [fetchedPostsCount, setFetchedPostsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [videosPage, setVideosPage] = useState(1);
  const [playlistsPage, setPlaylistsPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);

  const [videosLoading, setVideosLoading] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);

  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("videos");
  //   const memoizedPlaylists = useMemo(() => playlists, [playlists]);
  let channelId = "";
  if (username) {
    channelId = username;
  } else {
    channelId = currentUsername;
  }
  const setupChannelData = async (message) => {
    setChannel(message.channelInfo[0]);
    // setPlaylists(message.channel.playlists);
    setSubscribersCount(message.channelInfo[0].subscribersCount);
    setIsSubscribed(message.channelInfo[0].isSubscribed);
    console.log("message.videoCount", message.videosCount);
    setVideosCount(() => {
      const newCount = message.videosCount;
      //and here it is 1
      console.log("channel videos count:", newCount);
      return newCount;
    });
    setPlaylistsCount(() => {
      const newCount = message.playlistsCount;
      console.log("playlists count:", newCount);
      return newCount;
    });
    setPostsCount(() => {
      const newCount = message.postsCount;
      console.log("postsCount:", newCount);
      return newCount;
    });
  };

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      alert("Login is required to subscribe");
      return;
    }
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/channel/subscribe/${channelId}`,
        {}, // Empty body if no data
        {
          headers: {
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );
      if (response) {
        if (isSubscribed) {
          setIsSubscribed(!isSubscribed);
          setSubscribersCount((prev) => prev - 1);
        } else {
          setIsSubscribed(!isSubscribed);
          setSubscribersCount((prev) => prev + 1);
        }
        console.log("response:", response);
      }
    } catch (error) {
      console.error(error.response?.data?.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const channelData = await axios.get(
          `http://localhost:4000/api/v1/channel/get/${channelId}`,
          {
            headers: {
              // Let browser set Content-Type for FormData
              Accept: "application/json", // Backend likely expects this
            },
            withCredentials: true, // For CORS cookies
          }
        );

        console.log("currentChannel: ", channelData);
        setupChannelData(channelData.data.message);
        setError(null);
        setLoading(false);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch channel data"
        );
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      fetchData();
    }
  }, [channelId]);

  // Second useEffect fetch videos only after videosCount is available
  useEffect(() => {
    if (
      activeTab !== "videos" ||
      videosCount === 0 ||
      fetchedVideosCount >= videosCount ||
      videosLoading
    ) {
      return;
    }

    const getVideos = async () => {
      try {
        setVideosLoading(true);
        const channelVideos = await axios.get(
          `http://localhost:4000/api/v1/channel/get-channel-videos/${channelId}?page=${videosPage}&limit=20`,
          {
            headers: { Accept: "application/json" },
            withCredentials: "include",
          }
        );
        setVideosPage((prev) => prev + 1);
        setVideos((prev) => [
          ...prev,
          ...channelVideos.data.message.channelVideos,
        ]);

        setFetchedVideosCount((prev) => {
          const updatedCount =
            prev + channelVideos.data.message.channelVideos.length;
          console.log("fetched videos count:", updatedCount);
          return updatedCount;
        });

        setVideosLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || "while fetching videos");
        setVideosLoading(false);
      }
    };

    getVideos();

    const handleScroll = () => {
      if (
        activeTab !== "videos" ||
        videosCount === 0 ||
        fetchedVideosCount >= videosCount ||
        videosLoading
      ) {
        return;
      }
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        getVideos();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [videosCount, channelId, fetchedVideosCount, activeTab]);

  // Add a function to handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset loading states
    setVideosLoading(false);
    setPlaylistsLoading(false);
    setPostsLoading(false);
    // Reset page counts
    if (tab === "videos") {
      setVideosPage(1);
      setFetchedVideosCount(0);
      setVideos([]);
    } else if (tab === "playlists") {
      setPlaylistsPage(1);
      setFetchedPlaylistsCount(0);
      setPlaylists([]);
    } else if (tab === "posts") {
      setPostsPage(1);
      setFetchedPostsCount(0);
      setPosts([]);
    }
  };

  //TODO:   Slove rendering twice
  //third useEffect for playlist
  useEffect(() => {
    if (
      activeTab !== "playlists" ||
      playlistsCount === 0 ||
      fetchedPlaylistsCount >= playlistsCount ||
      playlistsLoading
    ) {
      return;
    }
    let isMounted = true;
    const getPlaylists = async () => {
      if (!isMounted) return;
      try {
        setPlaylistsLoading(true);
        const channelPlaylists = await axios.get(
          `http://localhost:4000/api/v1/channel/get-channel-playlists/${channelId}?page=${playlistsPage}&limit=20`,
          {
            headers: { Accept: "application/json" },
            withCredentials: "include",
          }
        );

        if (!isMounted) return;
        setPlaylistsPage((prev) => prev + 1);
        setPlaylists((prev) => [
          ...prev,
          ...channelPlaylists.data.message.channelPlaylists,
        ]);

        setFetchedPlaylistsCount((prev) => {
          const updatedCount =
            prev + channelPlaylists.data.message.channelPlaylists.length;
          return updatedCount;
        });

        setPlaylistsLoading(false);
      } catch (error) {
        if (!isMounted) return;
        setError(error.response?.data?.message || "while fetching playlists");
        setPlaylistsLoading(false);
      }
    };

    getPlaylists();

    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    const handleScroll = debounce(() => {
      if (
        activeTab !== "playlists" ||
        playlistsCount === 0 ||
        fetchedPlaylistsCount >= playlistsCount ||
        playlistsLoading
      ) {
        return;
      }
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        getPlaylists();
      }
    }, 200);

    window.addEventListener("scroll", handleScroll);
    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    playlistsCount,
    channelId,
    fetchedPlaylistsCount,
    activeTab,
    playlistsPage,
  ]);

  //third useEffect for posts fetching
  useEffect(() => {
    if (activeTab !== "posts") return;
    if (postsCount === 0) return;
    if (fetchedPostsCount >= postsCount) return;

    let isMounted = true;
    const getPosts = async () => {
      if (!isMounted) return;
      try {
        setPostsLoading(true);
        const channelPosts = await axios.get(
          `http://localhost:4000/api/v1/post/get-channel-posts/${channelId}?page=${postsPage}&limit=20`,
          {
            headers: { Accept: "application/json" },
            withCredentials: "include",
          }
        );

        if (!isMounted) return;
        setPostsPage((prev) => prev + 1);
        setPosts((prev) => [
          ...prev,
          ...channelPosts.data.message.postsWithInfo,
        ]);

        setFetchedPostsCount((prev) => {
          const updatedCount =
            prev + channelPosts.data.message.postsWithInfo.length;
          return updatedCount;
        });

        if (channelPosts.data.message.postsWithInfo.length === 0) {
          setPostsCount(0);
        }

        setPostsLoading(false);
      } catch (error) {
        if (!isMounted) return;
        setError(error.response?.data?.message || "while fetching posts");
        setPostsLoading(false);
      }
    };

    getPosts();

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        getPosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, [postsCount, channelId, fetchedPostsCount, activeTab, postsPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col">
        <div className="flex justify-center items-center min-h-screen text-red-500">
          {error}
        </div>
        <button
          onClick={() => {
            window.history.back();
          }}
        >
          Go back
        </button>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Channel not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Channel Header */}
      <div className="relative">
        <div className="aspect-[16/6] w-full overflow-hidden rounded-xl">
          <img
            className="w-full h-full object-cover"
            src={channel.coverImage}
            alt={channel.fullName}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4  pb-4">
            <div className="flex justify-arround w-full items-center">
              <img
                src={channel.avatar}
                alt={channel.fullName}
                className="w-32 h-32 rounded-full border-4 border-black"
              />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{channel.fullName}</h1>
                <p className="text-gray-400">@{channelId}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                  <span className="text-sm">
                    {subscribersCount} subscribers
                  </span>
                  <span className="text-sm">{videosCount} videos</span>
                  {/* <span className="text-sm">{channel.totalVideos} videos</span> */}
                </div>
              </div>
            </div>
            <div className="align-start text-start w-full font-gray-800">
              {channel.bio}
            </div>
            <button
              onClick={handleSubscribe}
              className={`px-6 py-2 rounded-full transition-colors duration-200 ${
                isSubscribed
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              {isSubscribed ? "Unsubscribe" : "Subscribe"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => handleTabChange("videos")}
              className={`py-4 border-b-2 ${
                activeTab === "videos"
                  ? "border-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              VIDEOS
            </button>
            <button
              onClick={() => handleTabChange("playlists")}
              className={`py-4 border-b-2 ${
                activeTab === "playlists"
                  ? "border-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              PLAYLISTS
            </button>
            <button
              onClick={() => handleTabChange("posts")}
              className={`py-4 border-b-2 ${
                activeTab === "posts"
                  ? "border-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              POSTS
            </button>
            <button
              onClick={() => handleTabChange("about")}
              className={`py-4 border-b-2 ${
                activeTab === "about"
                  ? "border-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              ABOUT
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => {
              //   console.log(video._id);
              return <ChannelVideoCard key={video._id} video={video} />;
            })}
            {videosLoading && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            {fetchedVideosCount >= videosCount && activeTab === "videos" ? (
              <p className="text-white">All videos are here</p>
            ) : null}
          </div>
        )}

        {activeTab === "playlists" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist._id} playlist={playlist} />
            ))}
            {/* section loading */}
            {playlistsLoading && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}{" "}
            {fetchedPlaylistsCount >= playlistsCount &&
            activeTab === "playlists" ? (
              <p className="text-white">All playlists are here</p>
            ) : null}
          </div>
        )}
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => {
              //   console.log(video._id);
              return <ChannelPostCard key={post._id} post={post} />;
            })}
            {postsLoading && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            {fetchedPostsCount >= postsCount && activeTab === "posts" ? (
              <p className="text-white">All posts are here</p>
            ) : null}
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-3xl">
            <div className="prose prose-invert">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="whitespace-pre-wrap">{channel.description}</p>

              <h2 className="text-xl font-semibold mt-8 mb-4">Details</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 text-gray-400">Location</span>
                  <span>{channel.location || "Not specified"}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-400">Joined</span>
                  <span>
                    {new Date(channel.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-400">Total views</span>
                  <span>{channel.totalViews || "Not specified"}</span>
                </div>
              </div>

              {channel.links && channel.links.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mt-8 mb-4">Links</h2>
                  <div className="space-y-2">
                    {channel.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-400 hover:underline"
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Channel;
