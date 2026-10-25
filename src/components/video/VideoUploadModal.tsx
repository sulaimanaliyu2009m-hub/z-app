import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../services/api';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [config, setConfig] = useState({ maxSeconds: 300, maxMb: 100 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiRequest('/api/videos/config')
      .then((data) => setConfig(data))
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setErrorMessage('');

    if (selected.size > config.maxMb * 1024 * 1024) {
      setErrorMessage(`The selected file exceeds the maximum size limit of ${config.maxMb} MB.`);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = URL.createObjectURL(file);

      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => resolve(true);
        videoElement.onerror = () => resolve(true);
      });

      const duration = videoElement.duration || 1;

      if (duration > config.maxSeconds) {
        throw new Error(`Video exceeds the maximum duration of ${Math.floor(config.maxSeconds / 60)} minutes.`);
      }

      const { uploadUrl, publicUrl } = await apiRequest('/api/videos/request-upload-url', {
        method: 'POST',
        body: JSON.stringify({
          contentType: file.type || 'video/mp4',
          sizeBytes: file.size,
          durationSeconds: duration,
        }),
      });

      await uploadDirectWithProgress(uploadUrl, file, (progress) => {
        setUploadProgress(progress);
      });

      await apiRequest('/api/videos/publish', {
        method: 'POST',
        body: JSON.stringify({
          content: caption,
          mediaUrl: publicUrl,
          durationSeconds: duration,
        }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload video. Please check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Upload Video</h3>
          <button onClick={onClose} disabled={isUploading} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <p className="text-xs text-slate-400">
          Upload any clip from 1 second up to {Math.floor(config.maxSeconds / 60)} minutes (Max {config.maxMb} MB).
        </p>

        {errorMessage && (
          <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded text-sm">
            {errorMessage}
          </div>
        )}

        <input
          type="file"
          accept="video/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
          className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm"
        />

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={isUploading}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm resize-none h-20"
        />

        {isUploading && (
          <div className="space-y-1">
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-sky-500 h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-right text-xs text-slate-400">{uploadProgress}%</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 rounded-lg text-sm font-semibold"
          >
            {isUploading ? 'Uploading...' : 'Post Video'}
          </button>
        </div>
      </div>
    </div>
  );
};

function uploadDirectWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  const attempt = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Storage service rejected the upload (HTTP ${xhr.status}).`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload.'));
      xhr.send(file);
    });
  };

  return attempt().catch(() => attempt());
}
