import React, { useState } from 'react';

const MediaCard = ({ media, onDelete, getMediaUrl }) => {
  const [showPreview, setShowPreview] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative aspect-video bg-gray-200 cursor-pointer" onClick={() => setShowPreview(true)}>
          {media.fileType === 'image' ? (
            <img
              src={getMediaUrl(media.fileUrl)}
              alt={media.originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={getMediaUrl(media.fileUrl)}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            {media.fileType === 'image' ? '🖼️ Image' : '🎥 Video'}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate mb-2">
            {media.originalName}
          </h3>
          <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
            <span>{formatFileSize(media.fileSize)}</span>
            <span>{formatDate(media.uploadedAt)}</span>
          </div>
          <button
            onClick={() => onDelete(media._id)}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {media.fileType === 'image' ? (
              <img
                src={getMediaUrl(media.fileUrl)}
                alt={media.originalName}
                className="max-w-full max-h-screen object-contain"
              />
            ) : (
              <video
                src={getMediaUrl(media.fileUrl)}
                controls
                className="max-w-full max-h-screen"
              />
            )}
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default MediaCard;
