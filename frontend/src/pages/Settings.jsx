import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import { Link } from "react-router-dom";

const backendAddress = "https://fullstack-yt.onrender.com";

const Settings = () => {
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [details, setDetails] = useState({
    username: "",
    bio: "",
    fullName: "",
    email: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const { isLoggedIn, currentUsername } = useAuthStore();
  if (!isLoggedIn) {
    window.location.href = "/";
  }

  const handlePasswordChange = () => {
    axios
      .post(
        `${backendAddress}/api/v1/user/change-password`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            // Let browser set Content-Type for FormData
            Accept: "application/json", // Backend likely expects this
          },
          withCredentials: true, // For CORS cookies
        }
      )
      .then(() => alert("Password changed"))
      .catch((err) => console.error(err));
  };

  const handleDetailsUpdate = () => {
    axios
      .patch(`${backendAddress}/api/v1/user/update-details`, details, {
        headers: {
          // Let browser set Content-Type for FormData
          Accept: "application/json", // Backend likely expects this
        },
        withCredentials: true, // For CORS cookies
      })
      .then(() => alert("Details updated"))
      .catch((err) => console.error(err));
  };

  const handleAvatarUpload = () => {
    const formData = new FormData();
    formData.append("avatar", avatar);
    axios
      .patch(`${backendAddress}/api/v1/user/update-avatar`, formData, {
        headers: {
          // Let browser set Content-Type for FormData
          Accept: "application/json", // Backend likely expects this
        },
        withCredentials: true, // For CORS cookies
      })
      .then(() => alert("Avatar updated"))
      .catch((err) => console.error(err));
  };

  const handleCoverUpload = () => {
    const formData = new FormData();
    formData.append("coverImage", coverImage);
    axios
      .patch(`${backendAddress}/api/v1/user/update-cover-image`, formData, {
        headers: {
          // Let browser set Content-Type for FormData
          Accept: "application/json", // Backend likely expects this
        },
        withCredentials: true, // For CORS cookies
      })
      .then(() => alert("Cover image updated"))
      .catch((err) => console.error(err));
  };

  const handleLogout = async () => {
    try {
      const loggedOutUser = await fetch(
        `${backendAddress}/api/v1/user/logout`,
        {
          method: "POST",
          credentials: "include", // Send HttpOnly cookies
        }
      );
      console.log("loggedOutuser; ", loggedOutUser);
    } catch (error) {
      console.error("Error occured while logging out:", error);
    }
    window.location.href = "/";
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-full sm:max-w-3xl">
      <div className="px-2 w-full flex justify-between ">
        <Link to="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e3e3e3"
          >
            <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
          </svg>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Settings
        </h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#e3e3e3"
        >
          <path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
        </svg>
      </div>

      {isLoggedIn && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <p className="text-base sm:text-lg">
            Logged in as: <span className="font-semibold">{ }</span> (
            {currentUsername})
          </p>
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Change Password
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="flex-1 p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Old Password"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="New Password"
          />
          <button
            onClick={handlePasswordChange}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors sm:w-auto w-full"
          >
            Change Password
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Update Details
        </h2>
        <div className="space-y-4">
          <input
            placeholder="Name"
            value={details.fullName}
            onChange={(e) =>
              setDetails({ ...details, fullName: e.target.value })
            }
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="username"
            value={details.username}
            onChange={(e) =>
              setDetails({ ...details, username: e.target.value })
            }
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Bio"
            value={details.bio}
            onChange={(e) => setDetails({ ...details, bio: e.target.value })}
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Email"
            value={details.email}
            onChange={(e) => setDetails({ ...details, email: e.target.value })}
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleDetailsUpdate}
            className="w-full px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Details
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Update Avatar</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="file"
            onChange={(e) => setAvatar(e.target.files[0])}
            className="flex-1 p-3 bg-gray-700 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          <button
            onClick={handleAvatarUpload}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors sm:w-auto w-full"
          >
            Upload Avatar
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Update Cover Image
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="file"
            onChange={(e) => setCoverImage(e.target.files[0])}
            className="flex-1 p-3 bg-gray-700 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          <button
            onClick={handleCoverUpload}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors sm:w-auto w-full"
          >
            Upload Cover
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Logout</h2>
        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </section>
    </div>
  );
};

export default Settings;
