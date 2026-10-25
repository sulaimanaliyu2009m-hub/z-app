import React, { useState } from 'react';
import { apiRequest } from '../../services/api';
import { UserCheck, UserPlus, Clock } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  initialStatus: 'none' | 'following' | 'requested' | 'friends' | 'follow_back';
  onStatusChange?: (newStatus: string) => void;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  initialStatus,
  onStatusChange,
  className = '',
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    // Optimistic UI calculation
    const prevStatus = status;
    let nextStatus: 'none' | 'following' | 'requested' = 'none';

    if (status === 'none' || status === 'follow_back') {
      nextStatus = 'following';
    } else {
      nextStatus = 'none';
    }

    setStatus(nextStatus);
    setLoading(true);

    try {
      const res = await apiRequest(`/api/users/${targetUserId}/follow`, { method: 'POST' });
      setStatus(res.status);
      if (onStatusChange) onStatusChange(res.status);
    } catch {
      setStatus(prevStatus); // Revert on failure
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'friends':
        return (
          <>
            <UserCheck size={14} /> <span>Friends</span>
          </>
        );
      case 'following':
        return <span>Following</span>;
      case 'requested':
        return (
          <>
            <Clock size={14} /> <span>Requested</span>
          </>
        );
      case 'follow_back':
        return (
          <>
            <UserPlus size={14} /> <span>Follow back</span>
          </>
        );
      default:
        return (
          <>
            <UserPlus size={14} /> <span>Follow</span>
          </>
        );
    }
  };

  const getStyle = () => {
    switch (status) {
      case 'friends':
      case 'following':
        return 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-red-500/10 hover:text-red-500 border border-neutral-300 dark:border-neutral-700';
      case 'requested':
        return 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500 border border-neutral-300 dark:border-neutral-800';
      case 'follow_back':
      default:
        return 'bg-sky-500 hover:bg-sky-600 text-white font-semibold';
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-1.5 rounded-full text-xs transition flex items-center justify-center gap-1.5 ${getStyle()} ${className}`}
    >
      {getButtonContent()}
    </button>
  );
};
