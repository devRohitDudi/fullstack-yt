import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
function ReplyCard({ reply }) {
  const { currentUsername } = useAuthStore();
  const isAuthor = reply.publisher.username === currentUsername;
  const { isLoggedIn } = useAuthStore();
  const [isReplying, setIsReplying] = useState(false);
  const [isTotalFetched, setIsTotalFetched] = useState(false);
  const [replies, setReplies] = useState([]);
  const [openReplies, setOpenReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(reply.replyCount);
  const [replyText, setReplyText] = useState("");
  const [isReplyPatching, setIsReplyPatching] = useState(false);
  const [likesCount, setLikesCount] = useState(reply.likeCount);
  const [isLiked, setIsLiked] = useState(reply.isLiked);
  const [isDisliked, setIsDisliked] = useState(reply.isDisliked);
  const [replyPage, setReplyPage] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  //   const fetchSomeReplies = async () => {
  //     if (isTotalFetched) return;
  //     try {
  //       setLoading(true);
  //       const response = await axios.get(
  //         `http://localhost:4000/api/v1/video/get-replies/${reply._id}?page=${replyPage}&limit=20`,
  //         { withCredentials: "include", headers: {} }
  //       );

  //       console.log("replies response:", response);
  //       const fetchedReplies = response.data.message.replies;

  //       if (fetchedReplies.length == 0) {
  //         setIsTotalFetched(true);
  //       }

  //       if (response.status == 200) {
  //         setReplies((prev) => [...prev, ...fetchedReplies]);
  //         setLoading(false);
  //         setReplyPage((prev) => prev + 1);
  //       }
  //       setLoading(false);
  //     } catch (error) {
  //       setLoading(false);
  //       console.error(error);
  //     }
  //   };
  //   useEffect(() => {
  //     if (isTotalFetched) return;
  //     fetchSomeReplies();
  //   }, []);
  async function handleLike() {
    if (!isLoggedIn) {
      alert("Login is required to like reply");
      return;
    }
    if (isDisliked) {
      handleDislike();
    }
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/video/like-comment/${reply._id}`,
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
    if (!isLoggedIn) {
      alert("Login is required to dislike reply");
      return;
    }
    if (isLiked) {
      handleLike();
    }
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/video/dislike-comment/${reply._id}`,
        {},
        {
          withCredentials: "include",
          headers: {},
        }
      );
      if (response.status == 200) {
        setIsDisliked((prev) => !prev);
      }
    } catch (error) {
      alert("Error occured while liking comment");
    }
  }
  async function handleReply() {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/video/reply-on/${reply._id}`,
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
      console.error(error);

      alert("Error occured while replying comment");
    }
  }
  const deleteReply = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/video/delete-comment/${reply._id}`,
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

  if (isDeleted) {
    return null;
  }
  return (
    <div
      key={reply._id}
      className="pl-4 mb-2 border-l-2 border-gray-300 pb-2 relative"
    >
      <div className="m-0 flex gap-2">
        <p className="text-gray-400">
          {`${reply.publisher?.username}` || "Unknown"}:
        </p>{" "}
        {reply.message}
      </div>
      <small className="text-gray-500">
        {new Date(reply.createdAt).toLocaleDateString()}
      </small>
      <div className="mt-1.5 flex gap-2 items-center">
        <button
          onClick={handleLike}
          className="flex text-sm text-gray-400 transform transition-transform duration-200 hover:scale-110 hover:text-white"
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
          className="text-sm text-gray-400 transform transition-transform duration-200 hover:scale-110 hover:text-white"
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
        </button>
        <button
          onClick={() => setIsReplying((prev) => !prev)}
          className="text-sm hover:text-blue-500"
        >
          {isReplying ? "Cancel" : "Reply"}
        </button>
        {isPopupOpen && (
          <div className="flex flex-col z-10 items-start backdrop-blur-sm bg-white/10 text-white rounded-lg absolute bottom-0 left-0 p-3 gap-2 shadow-lg">
            {isAuthor && (
              <button onClick={deleteReply} className="hover:underline">
                Remove
              </button>
            )}
            <button className="hover:underline">Share</button>
            <button className="hover:underline">Report</button>
          </div>
        )}
        <button
          onClick={() => setIsPopupOpen((prev) => !prev)}
          className="ml-auto text-lg hover:text-gray-700"
        >
          ⋮
        </button>
      </div>

      {isReplying && (
        <div className="flex gap-3 p-2">
          {!isReplyPatching ? (
            <>
              <input
                className="border-blue bg-gray-800 pr-2 pl-2 rounded-sm"
                placeholder="Reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                type="text"
              />
              <button onClick={handleReply}>Submit</button>
            </>
          ) : (
            "Sending..."
          )}
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
      )}
      {/* {!isTotalFetched && (
        <button onClick={fetchSomeReplies} disabled={loading}>
          {loading ? "Loading..." : "Load more"}
        </button>
      )} */}
    </div>
  );
}

function Replies({ commentId }) {
  const { isLoggedIn } = useAuthStore();
  const [replies, setReplies] = useState([]);
  const [replyPage, setReplyPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isTotalFetched, setIsTotalFetched] = useState(false);

  const fetchSomeReplies = async () => {
    if (isTotalFetched) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/v1/video/get-replies/${commentId}?page=${replyPage}&limit=20`,
        { withCredentials: "include", headers: {} }
      );

      console.log("replies response:", response);
      const fetchedReplies = response.data.message.replies;

      if (fetchedReplies.length == 0) {
        setIsTotalFetched(true);
      }

      if (response.status == 200) {
        setReplies((prev) => [...prev, ...fetchedReplies]);
        setLoading(false);
        setReplyPage((prev) => prev + 1);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  useEffect(() => {
    if (isTotalFetched) return;
    fetchSomeReplies();
  }, []);

  return (
    <>
      <div>
        {replies.map((reply) => (
          <ReplyCard reply={reply} />
        ))}
      </div>

      {!isTotalFetched && (
        <button onClick={fetchSomeReplies} disabled={loading}>
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </>
  );
}

export default Replies;
