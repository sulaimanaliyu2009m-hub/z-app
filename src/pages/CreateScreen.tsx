import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, Video as VideoIcon, Upload, X, AlertCircle, Loader2, Sparkles, Wand2 } from 'lucide-react';
import type { Post, PostType, AiCaptionResponse } from '../types';
import { api } from '../services/api';

export function CreateScreen({ onPostCreated }: { onPostCreated: (p: Post) => void }) {
  const navigate = useNavigate();
  const [postType, setPostType] = useState<PostType>('text');
  const [content, setContent] = useState('');
  const [mediaData, setMediaData] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [error, setError] = useState('');

  // Configurable limits fetched from backend
  const [maxDurationSec, setMaxDurationSec] = useState(300);
  const [maxSizeMb, setMaxSizeMb] = useState(100);

  // Video Pipeline States
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Assistant States
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiCaptionResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getVideoLimits().then((limits) => {
      if (limits.maxVideoSeconds) setMaxDurationSec(limits.maxVideoSeconds);
      if (limits.maxVideoMb) setMaxSizeMb(limits.maxVideoMb);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // 1. File Size Validation
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed is ${maxSizeMb} MB.`);
      return;
    }

    if (postType === 'image') {
      const reader = new FileReader();
      reader.onload = () => setMediaData(reader.result as string);
      reader.readAsDataURL(file);
    } else if (postType === 'video') {
      // 2. Client Duration Validation (No minimum; allows 1s+ videos up to maxDurationSec)
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = URL.createObjectURL(file);

      tempVideo.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(tempVideo.src);
        const duration = tempVideo.duration;

        if (duration > maxDurationSec + 1) {
          setError(`Video duration is ${Math.round(duration)}s. Maximum allowed is ${Math.round(maxDurationSec / 60)} minutes.`);
          return;
        }

        try {
          setUploadProgress(0);
          setProcessingStatus('Requesting secure upload authorization...');
          const { uploadUrl, videoId } = await api.getVideoUploadUrl(file.type || 'video/mp4', file.size);

          setProcessingStatus('Uploading video...');
          await api.uploadToS3(uploadUrl, file, (percent) => setUploadProgress(percent));

          setUploadProgress(100);
          setProcessingStatus('Transcoding video & generating thumbnail...');
          await api.processVideo(videoId);

          const interval = setInterval(async () => {
            try {
              const res = await api.pollVideoStatus(videoId);
              if (res.status === 'ready') {
                clearInterval(interval);
                setMediaData(res.video_url || '');
                setThumbnailUrl(res.thumbnail_url || '');
                setProcessingStatus(null);
                setUploadProgress(null);
              } else if (res.status === 'failed') {
                clearInterval(interval);
                setError(res.error_message || 'Video processing failed.');
                setProcessingStatus(null);
                setUploadProgress(null);
              }
            } catch {
              clearInterval(interval);
              setProcessingStatus(null);
              setUploadProgress(null);
            }
          }, 2000);
        } catch (err: any) {
          setError(err.message || 'Video upload failed. Check server storage configuration.');
          setProcessingStatus(null);
          setUploadProgress(null);
        }
      };
    }
  };

  const handleGenerateAiCaptions = async () => {
    if (!aiPrompt.trim()) return;

    try {
      setIsGeneratingAi(true);
      setError('');
      const data = await api.generateCaptions(aiPrompt.trim(), postType);
      setAiSuggestions(data);
    } catch (err: any) {
      setError(err.message || 'AI generation failed');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyCaption = (caption: string) => {
    const tags = (aiSuggestions?.hashtags || []).map((t) => `#${t.replace(/^#/, '')}`).join(' ');
    setContent(`${caption} ${tags}`.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please add a caption.');
      return;
    }

    try {
      setIsSubmitting(true);
      const post = await api.createPost({
        type: postType,
        content,
        mediaUrl: mediaData || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
      });
      onPostCreated(post);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationMinutesLabel = maxDurationSec >= 60 ? `Up to ${Math.round(maxDurationSec / 60)} minutes` : `Up to ${maxDurationSec} seconds`;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <h2 className="text-base font-bold">New Post</h2>
        <span className="text-xs text-sky-500 uppercase font-semibold">{postType}</span>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => { setPostType('text'); setMediaData(''); setThumbnailUrl(''); }}
          className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold ${
            postType === 'text' ? 'border-sky-500 bg-sky-500/10 text-sky-500' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
          }`}
        >
          <FileText size={18} /> Text
        </button>
        <button
          type="button"
          onClick={() => { setPostType('image'); setMediaData(''); setThumbnailUrl(''); }}
          className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold ${
            postType === 'image' ? 'border-sky-500 bg-sky-500/10 text-sky-500' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
          }`}
        >
          <ImageIcon size={18} /> Image
        </button>
        <button
          type="button"
          onClick={() => { setPostType('video'); setMediaData(''); setThumbnailUrl(''); }}
          className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold ${
            postType === 'video' ? 'border-sky-500 bg-sky-500/10 text-sky-500' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
          }`}
        >
          <VideoIcon size={18} /> Video Reel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {postType !== 'text' && !mediaData && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={postType === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center bg-neutral-50 dark:bg-neutral-900/50"
            >
              <Upload size={28} className="text-sky-500 mb-2" />
              <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Choose {postType === 'image' ? 'photo' : 'video'} file
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">
                {postType === 'video'
                  ? `${durationMinutesLabel} · Up to ${maxSizeMb} MB`
                  : 'PNG, JPG, WEBP'}
              </p>
            </div>
          </div>
        )}

        {uploadProgress !== null && (
          <div className="space-y-1.5 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-sky-500">{processingStatus}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {processingStatus && uploadProgress === 100 && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-500/10 text-sky-400 text-xs font-medium">
            <Loader2 size={16} className="animate-spin" />
            <span>{processingStatus}</span>
          </div>
        )}

        {mediaData && (
          <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-black max-h-60 flex flex-col items-center justify-center">
            {postType === 'image' && <img src={mediaData} alt="preview" className="w-full max-h-56 object-contain" />}
            {postType === 'video' && (
              <video src={mediaData} controls className="w-full max-h-56 object-contain" />
            )}
            <button
              type="button"
              onClick={() => { setMediaData(''); setThumbnailUrl(''); }}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* AI Caption Generator */}
        <div className="p-3 bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2.5">
          <button
            type="button"
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className="w-full flex items-center justify-between text-xs font-bold text-sky-500"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={15} /> AI Caption & Tag Generator
            </span>
            <span className="text-[10px] text-neutral-400">{showAiAssistant ? 'Hide' : 'Open'}</span>
          </button>

          {showAiAssistant && (
            <div className="space-y-2 pt-1 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Describe your post topic..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateAiCaptions}
                  disabled={!aiPrompt.trim() || isGeneratingAi}
                  className="bg-sky-500 disabled:opacity-40 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-sky-600 transition"
                >
                  {isGeneratingAi ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                  <span>Generate</span>
                </button>
              </div>

              {aiSuggestions && (
                <div className="space-y-2 pt-1">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Suggested Captions (Tap to use):</p>
                    {aiSuggestions.captions?.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyCaption(c)}
                        className="w-full text-left text-xs p-2 bg-white dark:bg-neutral-800 hover:border-sky-500 border border-neutral-200 dark:border-neutral-700 rounded-xl transition"
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {aiSuggestions.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {aiSuggestions.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full">
                          #{h.replace(/^#/, '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Caption & #hashtags</label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a caption... Use #hashtags"
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-sky-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || processingStatus !== null}
          className="w-full bg-sky-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-xs hover:bg-sky-600 transition"
        >
          {isSubmitting ? 'Publishing...' : 'Share Post'}
        </button>
      </form>
    </div>
  );
}
