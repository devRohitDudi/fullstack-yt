import { useState } from "react";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import Replies from "../components/Replies.jsx";
//baby comp for rendering every comment
const Comment = ({ comment }) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { currentUsername, isLoggedIn } = useAuthStore();
  const [likesCount, setLikesCount] = useState(comment.likeCount);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [isDisliked, setIsDisliked] = useState(comment.isDisliked);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplyPatching, setIsReplyPatching] = useState(false);
  const [replyCount, setReplyCount] = useState(comment.replyCount);
  const [openReplies, setOpenReplies] = useState(false);

  const isAuthor = comment.publisher.username === currentUsername;

  const deleteComment = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/comment/delete-comment/${comment._id}`,
        {},
        {
          withCredentials: "include",
          headers: {},
        }
      );
      if (response.status == 200) {
        setIsDeleted(true);
        alert("Comment deleted successfully");
      }
    } catch (error) {
      console.log(error || "error while deleting comment");
    }
  };

  async function handleLike() {
    if (isDisliked) {
      handleDislike();
    }
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/comment/like-comment/${comment._id}`,
        {},
        {
          withCredentials: "include",
          headers: {},
        }
      );
      if (response.status == 200) {
        setLikesCount((prev) => {
          if (isLiked) {
            return prev - 1;
          } else return prev + 1;
        });
        setIsLiked((prev) => !prev);
      }
    } catch (error) {
      alert("Error occured while liking comment");
    }
  }
  async function handleDislike() {
    if (isLiked) {
      handleLike();
    }
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/comment/dislike-comment/${comment._id}`,
        {},
        {
          withCredentials: "include",
          headers: {},
        }
      );
      if ((await response).status == 200) {
        setIsDisliked((prev) => !prev);
      }
    } catch (error) {
      alert("Error occured while liking comment");
    }
  }
  async function handleReply() {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/comment/reply-on/${comment._id}`,
        { message: replyText },
        {
          withCredentials: "include",
          headers: {},
        }
      );
      if (response.status == 200) {
        setIsReplyPatching(false);
        setIsReplying(false);
        setReplyCount((prev) => prev + 1);
        alert("Reply added successfully");
      }
    } catch (error) {
      alert("Error occured while replying comment");
    }
  }

  if (isDeleted) {
    return null;
  }

  return (
    <div className="flex relative gap-4 py-5 border-b border-zinc-800">
      <div className="w-full flex gap-4 flex items-start relative">
        <img
          src={comment.publisher.avatar}
          alt={comment.publisher.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 relative">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">
              {comment.publisher.fullName}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-200">{comment.message}</p>
          <div className="flex items-center gap-6 mt-3 text-sm text-gray-400">
            <button
              onClick={handleLike}
              className={`${
                isLiked ? "bg-gray-500" : null
              }flex flex-col items-center gap-1 hover:text-white transition-colors duration-200`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill={isLiked ? "#3190FF" : "currentColor"}
              >
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {likesCount}
            </button>
            <button
              onClick={handleDislike}
              className={` ${
                isDisliked ? "bg-gray-500" : null
              }flex flex-col items-center gap-1 hover:text-white transition-colors duration-200`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill={isDisliked ? "#FF6032" : "currentColor"}
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Dislike
            </button>
            <button
              onClick={() => setIsReplying((prev) => !prev)}
              className="hover:text-white transition-colors duration-200"
            >
              {isReplying ? "Cancel" : "Reply"}
            </button>
          </div>

          {isReplying ? (
            <div className="flex gap-3 p-2">
              {!isReplyPatching ? (
                <>
                  <input
                    className="border-blue bg-gray-800 pr-2 pl-2 rounded-sm"
                    placeholder="Reply..."
                    onChange={(e) => setReplyText(e.target.value)}
                    type="text"
                  />
                  <button onClick={handleReply}>Submit</button>
                </>
              ) : (
                "Sending..."
              )}
            </div>
          ) : null}

          {!isReplying ? (
            <button
              onClick={() => {
                setOpenReplies((prev) => !prev);
              }}
            >
              {!openReplies ? `See all ${replyCount} replies` : "Hide replies"}
            </button>
          ) : null}
          {openReplies ? <Replies commentId={comment._id} /> : null}
        </div>

        {isPopupOpen && (
          <div className="flex flex-col z-10 items-start backdrop-blur-sm bg-white/10 text-white rounded-lg absolute bottom-0 left-0 p-3 gap-2 shadow-lg">
            {isAuthor && (
              <button onClick={deleteComment} className="hover:underline">
                Remove
              </button>
            )}
            <button className="hover:underline">Share</button>
            <button className="hover:underline">Report</button>
          </div>
        )}
        <button
          onClick={() => setIsPopupOpen((prev) => !prev)}
          className="pr-2 text-gray-300 hover:text-white transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const VideoComments = ({ comments, commentsCount, videoId }) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const message = newComment;
      const response = await axios.post(
        `http://localhost:4000/api/v1/video/add-comment/${videoId}`,
        { message },
        {
          headers: { Accept: "application/json" },
          withCredentials: "include",
        }
      );

      if (response.status === 200) {
        alert("Comment created successfully");
        if (onCommentAdded) {
          onCommentAdded(response.data.message.comment);
        }
      }
    } catch (error) {
      console.log("error while creating comment", error);
    }

    setNewComment("");
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>
      <p>{commentsCount} comments</p>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <img
            src="https://via.placeholder.com/40"
            alt="Your avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-transparent border-b border-zinc-700 pb-2 focus:border-blue-500 outline-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setNewComment("")}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-2">
        {comments.map((comment, index) => (
          <Comment key={index} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default VideoComments;
