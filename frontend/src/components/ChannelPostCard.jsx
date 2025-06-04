import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
function ChannelPostCard({ post }) {
  console.log("post is:", post);
  const [commentPopup, setCommentPopup] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [commentText, setCommentText] = useState("");

  const navigate = useNavigate();
  const images = post.images || [];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleLike = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/post/like-post`,
        { post_id: post._id },
        {
          withCredentials: "include",
          headers: {},
        }
      );
      if (response.status === 200) {
        setIsLiked((prev) => !prev);
        console.log("now isLikes:", isLiked);

        setLikesCount((prev) => {
          if (isLiked) {
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleComment = async () => {
    try {
      const response = await axios.post(
        `http://localhost:4000/api/v1/post/add-comment`,
        { post_id: post._id, message: commentText },
        {
          withCredentials: "include",
          headers: {},
        }
      );
      if (response.status === 200) {
        alert("Comment added");
        setCommentText("");
        setCommentsCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className=" group block border border-gray-800 rounded-lg p-4 ">
      <div
        onClick={() => navigate(`/post/${post._id}`)}
        className="hover:cursor-pointer group-hover:border-blue-500 transition-colors"
      >
        {images.length > 0 && (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
            <img
              src={images[currentIndex]}
              alt={`Post image ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 px-2 py-1 text-white rounded"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 px-2 py-1 text-white rounded"
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300 mt-2 line-clamp-3">
              {post.content}
            </p>
            <div className="text-xs text-gray-500 mt-3">
              {likesCount} likes • {commentsCount} comments •{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        {/* buttons */}
        <div className="flex gap-4 mt-3">
          <div className="flex gap-1 z-10">
            {isLiked ? (
              <svg
                onClick={handleLike}
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#ED227F"
              >
                <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z" />
              </svg>
            ) : (
              <svg
                onClick={handleLike}
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#B9B9B9"
              >
                <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z" />
              </svg>
            )}
          </div>
          <div className="flex gap-1">
            <svg
              onClick={() => setCommentPopup((prev) => !prev)}
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#B9B9B9"
            >
              <path d="M880-80 720-240H320q-33 0-56.5-23.5T240-320v-40h440q33 0 56.5-23.5T760-440v-280h40q33 0 56.5 23.5T880-640v560ZM160-473l47-47h393v-280H160v327ZM80-280v-520q0-33 23.5-56.5T160-880h440q33 0 56.5 23.5T680-800v280q0 33-23.5 56.5T600-440H240L80-280Zm80-240v-280 280Z" />
            </svg>
          </div>
        </div>
        {/* three dot */}
        <div>
          <svg
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
      {commentPopup && (
        <div className="max-w-[70%] min-w-[50%] fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 backdrop-blur bg-white/5 p-4 rounded-xl">
          <div className="flex flex-col items-start truncate overflow-hidden whitespace-nowrap">
            <p className="text-sm text-gray-300 truncate overflow-hidden whitespace-nowrap">
              {post.content}
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {" "}
            <input
              className="rounded-xl px-4 py-2 border border-gray-100"
              onChange={(e) => setCommentText(e.target.value)}
              type="text"
              placeholder="Write a comment..."
            />
            <div className="flex justify-between ">
              <button onClick={() => setCommentPopup(false)}>Cancel</button>
              <button className="text-blue-500" onClick={handleComment}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChannelPostCard;
