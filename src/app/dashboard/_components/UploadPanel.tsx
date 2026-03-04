import React, { useState } from "react";

export function UploadPanel() {
  const [livestreamFile, setLivestreamFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "livestream" | "thumbnail") => {
    if (e.target.files) {
      if (fileType === "livestream") {
        setLivestreamFile(e.target.files[0]);
      } else {
        setThumbnailFile(e.target.files[0]);
      }
    }
  };

  const handleUpload = async (uploadType: "livestream" | "thumbnail") => {
    const file = uploadType === "livestream" ? livestreamFile : thumbnailFile;

    if (!file) {
      alert(`Please select a ${uploadType} file to upload.`);
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", uploadType);

    try {
      // Point directly to the backend to bypass Next.js 4MB body size limits
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert(`${uploadType} uploaded successfully!`);
      } else {
        const contentType = response.headers.get("content-type");
        let errorMsg;
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          errorMsg = data.error || "Unknown error";
        } else {
          const text = await response.text();
          errorMsg = `Server returned non-JSON error: ${text.slice(0, 100)}`;
        }
        alert(`${uploadType} upload failed: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error(`Error uploading ${uploadType}:`, error);
      alert(`Network/Client error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Upload Livestream</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <div className="text-sm font-medium mb-1">
              Livestream File
            </div>
            <div className="relative">
              <input
                type="file"
                className="w-full border rounded-lg px-3 py-2"
                onChange={(e) => handleFileChange(e, "livestream")}
              />
            </div>
          </label>
        </div>
        <button
          onClick={() => handleUpload("livestream")}
          disabled={submitting}
          className="mt-6 rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
        >
          {submitting ? "Uploading..." : "Upload Livestream"}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Upload Thumbnail</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <div className="text-sm font-medium mb-1">
              Thumbnail File
            </div>
            <div className="relative">
              <input
                type="file"
                className="w-full border rounded-lg px-3 py-2"
                onChange={(e) => handleFileChange(e, "thumbnail")}
              />
            </div>
          </label>
        </div>
        <button
          onClick={() => handleUpload("thumbnail")}
          disabled={submitting}
          className="mt-6 rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
        >
          {submitting ? "Uploading..." : "Upload Thumbnail"}
        </button>
      </div>
    </div>
  );
}
