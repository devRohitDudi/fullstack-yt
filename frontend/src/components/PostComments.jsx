import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";
import axios from "axios";
const CommentCard = ({ comment }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount);
  const [isRepliesFetched, setIsRepliesFetched] = useState(false);
  const [fetchedRepliesCount, setFetchedRepliesCount] = useState(0);
  const [isReplying, setIsReplying] = useState(false);
  const [isReplyPatching, setIsReplyPatching] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isRepliesFatching, setIsRepliesFatching] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);
  const { userAvatar } = useAuthStore();
  const fetchSomeReplies = async () => {
    if (
      repliesCount <= 0 ||
      fetchedRepliesCount >= repliesCount ||
      isRepliesFatching ||
      isRepliesFetched
    ) {
      console.log("returned");
      return;
    }
    try {
      setIsRepliesFatching(true);
      const response = await axios.get(
        `http://localhost:4000/api/v1/comment/get-replies/${comment._id}?page=${repliesPage}&limit=10`,
        { withCredentials: "include" }
      );
      console.log("resplies response:", response);
      const fetchedReplies = response.data.message.replies;

      if (response.status === 200) {
        setReplies(fetchedReplies);
        if (fetchedReplies === 0) {
          setIsRepliesFetched(true);
        }
        setFetchedRepliesCount((prev) => prev + fetchedReplies.length);
        setRepliesPage((prev) => prev + 1);
      }

      setIsRepliesFatching(false);
    } catch (error) {
      setIsRepliesFatching(false);
      console.error(error);
    }
  };

  const handleReply = async () => {
    if (replyText.trim() === "") {
      alert("Empty string");
      return;
    }
    try {
      setIsReplyPatching(true);
      const response = await axios.patch(
        `http://localhost:4000/api/v1/comment/reply-on/${comment._id}`,
        { message: replyText },
        {
          withCredentials: "include",
          headers: {},
        }
      );
      if (response.status === 200) {
        alert("Reply added");
      }
      setReplyText("");
      setIsReplyPatching(false);
    } catch (error) {
      setReplyText("");
      console.error(error);
      setIsReplyPatching(false);
    }
  };
  const handleLike = async () => {
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
  };

  const deleteReply = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/v1/comment/delete-comment/${comment._id}`,
        {},
        { withCredentials: "include", headers: {} }
      );
      if (response.status === 200) {
        setIsDeleted(true);
        alert("Comment deleted!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isDeleted) return null;

  return (
    <div
      className=" border-l border-b rounded-bl-2xl  border-l-gray-600 border-b-gray-600
 relative ml-6 mt-2 bg-zinc-900"
    >
      <div className=" p-2 rounded-md ">
        <p className="font-semibold text-gray-600">
          @{comment.publisher || comment.publisher.username}
        </p>

        <p className="flex">{comment.message}</p>
      </div>

      <div className="m-2  flex justify-between items-center gap-6 mt-3 text-sm text-gray-400">
        <div className="flex gap-4 ">
          <button className="flex items-center " onClick={handleLike}>
            <svg
              className={` items-center h-5 w-5 gap-1 hover:text-white transition-colors duration-200`}
              xmlns="http://www.w3.org/2000/svg"
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
            onClick={() => setIsReplying((prev) => !prev)}
            className="hover:text-white transition-colors duration-200"
          >
            {isReplying ? "Cancel" : "Reply"}
          </button>
        </div>
        <svg
          onClick={() => setIsPopupOpen((prev) => !prev)}
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#e3e3e3"
        >
          <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
        </svg>
      </div>
      {isReplying ? (
        <div className="flex gap-3 p-2">
          {!isReplyPatching ? (
            <>
              <img
                src={userAvatar}
                alt="avatar"
                className="flex h-6 w-6 rounded-full"
              />
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

      <div>
        {!showReplies ? (
          <button
            className="text-sm pb-2 pl-2  text-blue-600 mt-1"
            onClick={() => {
              setShowReplies(true);
              fetchSomeReplies();
            }}
          >
            Show all {comment.repliesCount} replies
          </button>
        ) : (
          <div>
            {isRepliesFatching ? (
              <p className="pb-2 pl-2 ">Loading...</p>
            ) : (
              <PostReplies replies={replies} />
            )}

            <button
              className="pb-2 pl-2 "
              onClick={() => {
                setIsRepliesFatching(false);
                setShowReplies((prev) => !prev);
              }}
            >
              Hide replies
            </button>
          </div>
        )}
      </div>

      {isPopupOpen && (
        <div className=" items-start flex z-10 flex flex-col absolute p-2 top-2 bg-white/5 left-2 backdrop-blur rounded-xl ">
          <button onClick={deleteReply}>Remove</button>
          <button>Report</button>
          <button>Copy</button>
        </div>
      )}
    </div>
  );
};

const PostReplies = ({ replies }) => {
  const [replyText, setReplyText] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const { post_id } = useParams();
  const { userAvatar } = useAuthStore();
  //   const handleComment = async () => {
  //     try {
  //       if (replyText.trim() === "") {
  //         return;
  //       }

  //       const response = await axios.post(
  //         `http://localhost:4000/api/v1/comment/reply-on`,
  //         { post_id, message: commentText },
  //         { withCredentials: "include", headers: {} }
  //       );
  //       console.log(response);

  //       if (response.status === 200) {
  //         alert("comment added");
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  return (
    <div className="mt-8">
      <p className="pb-2 pl-2 text-gray-500">{replies.length} replies</p>
      <div className="space-y-2">
        {replies.map((comment) => (
          <CommentCard key={comment._id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

const PostComments = ({ comments }) => {
  const [commentText, setCommentText] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const { post_id } = useParams();
  const { userAvatar } = useAuthStore();
  const handleComment = async () => {
    try {
      if (commentText.trim() === "") {
        return;
      }

      const response = await axios.post(
        `http://localhost:4000/api/v1/post/add-comment`,
        { post_id, message: commentText },
        { withCredentials: "include", headers: {} }
      );
      console.log(response);

      if (response.status === 200) {
        alert("comment added");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-8">
      <p>{comments.length} Comments</p>
      <form onSubmit={handleComment} className="mb-6">
        <div className="flex gap-3">
          <img
            src={userAvatar}
            alt="Your avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-transparent border-b border-zinc-700 pb-2 focus:border-blue-500 outline-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setCommentText("")}
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
        {comments.map((comment) => (
          <CommentCard key={comment._id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default PostComments;
