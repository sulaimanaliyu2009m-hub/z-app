import React from 'react';
import { ArrowLeft, Shield, Lock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPolicyScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 max-w-2xl mx-auto space-y-6 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-2">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <Shield size={28} className="text-sky-500" />
        <h1 className="text-2xl font-black">Privacy Policy</h1>
      </div>

      <div className="space-y-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
        <p><strong>Effective Date:</strong> October 2026</p>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">1. Information We Collect</h3>
        <p>Z collects information you provide directly (username, email, avatar, bio), content you post (photos, videos, text updates), and usage telemetry (watch completion rates used to train the recommendation engine).</p>

        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">2. Video and Media Storage</h3>
        <p>Uploaded video files are processed using FFmpeg and hosted via cloud-native S3-compatible storage. Ephemeral Stories expire and are automatically removed from our cache after 24 hours.</p>

        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">3. Artificial Intelligence and Moderation</h3>
        <p>Text submissions and comments are analyzed via automated safety systems to prevent harassment, abusive content, and spam. Your private messages remain protected.</p>

        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">4. Your Rights</h3>
        <p>You may request account deletion, edit your profile information, or block other users at any time.</p>
      </div>
    </div>
  );
}

export function TermsOfServiceScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 max-w-2xl mx-auto space-y-6 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-2">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <FileText size={28} className="text-sky-500" />
        <h1 className="text-2xl font-black">Terms of Service</h1>
      </div>

      <div className="space-y-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">1. Community Guidelines</h3>
        <p>By using Z, you agree not to upload content that promotes hate speech, unauthorized intellectual property, severe harassment, or illegal material.</p>

        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">2. Media Upload Limits</h3>
        <p>Users must adhere to the 100 MB file size limit and 60-second duration restriction for video reels.</p>

        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">3. Termination</h3>
        <p>Accounts violating community standards or engaging in automated spam are subject to suspension or permanent ban.</p>
      </div>
    </div>
  );
}
