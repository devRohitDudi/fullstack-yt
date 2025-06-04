import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PostComments from "../components/PostComments.jsx";
export default function PostPage() {
  const [post, setPost] = useState(null);
  const [postFetching, setPostFteching] = useState(false);
  const [commentsFetching, setCommentsFetching] = useState(false);
  const [commentsCount, setCommentsCount] = useState(null);
  const [fetchedCommentsCount, setFetchedCommentsCount] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const { post_id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(null);
  const [postLoading, setPostLaoding] = useState(true);
  const [isCommentsFetched, setIsCommentsFetched] = useState(false);

  const fetchPost = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/v1/post/get/${post_id}`,
        { withCredentials: "include", headers: {} }
      );
      console.log("post response;", response);

      if (response.status === 200) {
        setPost(() => {
          return response.data.message.post;
        });
        setCommentsCount(response.data.message.commentsCount);
        setIsLiked(response.data.message.isLiked);
        setLikesCount(response.data.message.likesCount);
      }

      setPostLaoding(false);
    } catch (error) {
      setPostLaoding(false);
      console.error("while fetching post:", error);
    }
  };
  const handleLike = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/post/like-post`,
        { post_id: post_id },
        {
          withCredentials: "include",
          headers: {},
        }
      );
      if (response.status === 200) {
        setIsLiked((prev) => !prev);
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
  const fetchPostComents = async () => {
    if (
      commentsCount <= 0 ||
      fetchedCommentsCount >= commentsCount ||
      commentsFetching ||
      isCommentsFetched
    ) {
      return;
    }
    try {
      setCommentsFetching(true);
      const response = await axios.get(
        `http://localhost:4000/api/v1/comment/get-post-comments/${post_id}?page=${commentsPage}&limit=10`,
        { withCredentials: "include", headers: {} }
      );
      console.log("comments response:", response);
      const fetchedComments = response.data.message.comments;
      if (fetchPostComents.length <= 0) {
        setIsCommentsFetched(true);
      }

      console.log("comments response:", response);

      if (response.status === 200) {
        setCommentsPage((prev) => prev + 1);
        setComments((prev) => [...prev, ...fetchedComments]);
        setFetchedCommentsCount((prev) => prev + fetchedComments.length);
      }
      setCommentsFetching(false);
    } catch (error) {
      setCommentsFetching(false);
      console.error("while fetching post comments", error);
    }
  };

  useEffect(() => {
    setPostLaoding(true);
    fetchPost();
  }, []);

  useEffect(() => {
    fetchPostComents();

    const handleScroll = () => {
      if (
        commentsCount <= 0 ||
        fetchedCommentsCount >= commentsCount ||
        commentsFetching ||
        isCommentsFetched
      ) {
        return;
      }
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        fetchPostComents();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % post.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? post.images.length - 1 : prev - 1));
  };

  if (postLoading)
    return <div className="text-center mt-10">Loading post...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-black shadow-md rounded-2xl p-6">
        <p className="text-gray-500 text-sm mb-4">
          By {post.owner.username} on {post.createdAt}
        </p>
        <p className="text-base  mb-4">{post.content}</p>

        {/* Pure JS Image Slider */}
        {post.images.length > 0 ? (
          <div className="relative w-full h-64 rounded-2xl overflow-hidden">
            <img
              src={post.images[currentImage]}
              alt={`Slide ${currentImage + 1}`}
              className="w-full h-full object-cover transition duration-300"
            />
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-black bg-opacity-40 text-white px-3 py-1 rounded-full"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-black bg-opacity-40 text-white px-3 py-1 rounded-full"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
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
        <div className="text-gray-500">{likesCount} Likes</div>
      </div>

      <PostComments comments={comments} />
    </div>
  );
}
