import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backendAddress = "https://fullstack-yt.onrender.com";

const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
const Textarea = ({ className = "", ...props }) => {
  return (
    <textarea
      className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};

const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md ${className}`} {...props}>
      {children}
    </div>
  );
};
const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
export default function CreatePost() {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = images.length + files.length;

    if (totalImages > 10) {
      alert("You can upload up to 10 images.");
      return;
    }

    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }
    // Simulate form submission
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("content", message);
      images.forEach((img) => formData.append("photos", img));
      console.log("images:", images);

      const response = await axios.post(
        `${backendAddress}/api/v1/post/create-post`,
        formData,
        { withCredentials: "include", headers: {} }
      );
      if (response.status === 200) {
        alert("post created successfully");
        setUploading(false);
      }
    } catch (error) {
      setError(error);
      console.error(error);
      setUploading(false);
      setTimeout(() => {
        setError(false);
      }, 4000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {error && (
        <div className="sticky top-0 items-center flex tect-center text-red-500">
          {error.response.data?.message}
        </div>
      )}
      <Card className="shadow-xl">
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Create a Post</h2>
            <svg
              onClick={() => navigate("/")}
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#00000"
            >
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          </div>
          <Textarea
            placeholder="What's on your mind?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`upload-${index}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <Button disabled={uploading} onClick={handleSubmit}>
            {uploading ? "Posting..." : "Post"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
