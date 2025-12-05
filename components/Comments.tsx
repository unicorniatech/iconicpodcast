import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Trash2, Edit2, Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = supabase;

interface Comment {
  id: string;
  episode_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_edited: boolean;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url: string | null;
  };
  like_count: number;
  user_liked: boolean;
  replies?: Comment[];
}

interface CommentsProps {
  episodeId: string;
}

export const Comments: React.FC<CommentsProps> = ({ episodeId }) => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const t = {
    'cs-CZ': {
      comments: 'Komentáře',
      login_to_comment: 'Přihlaste se pro přidání komentáře',
      write_comment: 'Napište komentář...',
      reply: 'Odpovědět',
      edit: 'Upravit',
      delete: 'Smazat',
      send: 'Odeslat',
      cancel: 'Zrušit',
      edited: 'upraveno',
      no_comments: 'Zatím žádné komentáře. Buďte první!',
      login: 'Přihlásit se',
    },
    'en-US': {
      comments: 'Comments',
      login_to_comment: 'Sign in to comment',
      write_comment: 'Write a comment...',
      reply: 'Reply',
      edit: 'Edit',
      delete: 'Delete',
      send: 'Send',
      cancel: 'Cancel',
      edited: 'edited',
      no_comments: 'No comments yet. Be the first!',
      login: 'Sign in',
    },
  }[lang] || {
    comments: 'Comments',
    login_to_comment: 'Sign in to comment',
    write_comment: 'Write a comment...',
    reply: 'Reply',
    edit: 'Edit',
    delete: 'Delete',
    send: 'Send',
    cancel: 'Cancel',
    edited: 'edited',
    no_comments: 'No comments yet. Be the first!',
    login: 'Sign in',
  };

  useEffect(() => {
    fetchComments();
  }, [episodeId, user?.id]);

  const fetchComments = async () => {
    setLoading(true);
    
    try {
      // Fetch all comments for this episode in one query
      const { data: allComments, error } = await db
        .from('comments')
        .select('*')
        .eq('episode_id', episodeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Comments fetch error:', error.message);
        setComments([]);
        return;
      }

      if (!allComments || allComments.length === 0) {
        setComments([]);
        return;
      }

      // Separate parent comments and replies
      const parentComments = allComments.filter((c: any) => !c.parent_id);
      const replies = allComments.filter((c: any) => c.parent_id);

      // Get unique user IDs to batch fetch profiles
      const userIds = [...new Set(allComments.map((c: any) => c.user_id))];
      
      // Batch fetch all user profiles in one query
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        try {
          const { data: profiles } = await db
            .from('user_profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);
          
          if (profiles) {
            profilesMap = profiles.reduce((acc: any, p: any) => {
              acc[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url };
              return acc;
            }, {});
          }
        } catch {
          // Table doesn't exist - continue without profiles
        }
      }

      // Fetch like counts and user likes for all comments
      const commentIds = allComments.map((c: any) => c.id);
      let likesMap: Record<string, number> = {};
      let userLikesSet = new Set<string>();
      
      if (commentIds.length > 0) {
        try {
          // Get like counts
          const { data: likeCounts } = await db
            .from('comment_likes')
            .select('comment_id')
            .in('comment_id', commentIds);
          
          if (likeCounts) {
            likeCounts.forEach((like: any) => {
              likesMap[like.comment_id] = (likesMap[like.comment_id] || 0) + 1;
            });
          }
          
          // Get user's likes if logged in
          if (user) {
            const { data: userLikes } = await db
              .from('comment_likes')
              .select('comment_id')
              .in('comment_id', commentIds)
              .eq('user_id', user.id);
            
            if (userLikes) {
              userLikes.forEach((like: any) => userLikesSet.add(like.comment_id));
            }
          }
        } catch {
          // Table might not exist - continue without likes
        }
      }

      // Build comments with replies
      const commentsWithReplies = parentComments.map((comment: any) => {
        const commentReplies = replies
          .filter((r: any) => r.parent_id === comment.id)
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((reply: any) => ({
            ...reply,
            user_profile: profilesMap[reply.user_id] || null,
            like_count: likesMap[reply.id] || 0,
            user_liked: userLikesSet.has(reply.id),
          }));

        return {
          ...comment,
          user_profile: profilesMap[comment.user_id] || null,
          like_count: likesMap[comment.id] || 0,
          user_liked: userLikesSet.has(comment.id),
          replies: commentReplies,
        };
      });

      setComments(commentsWithReplies);
    } catch (err) {
      console.error('Comments fetch failed:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await db.from('comments').insert({
        episode_id: episodeId,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await db.from('comments').insert({
        episode_id: episodeId,
        user_id: user.id,
        parent_id: parentId,
        content: replyContent.trim(),
      });

      if (error) throw error;

      setReplyingTo(null);
      setReplyContent('');
      fetchComments();
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await db
        .from('comments')
        .update({ content: editContent.trim(), is_edited: true })
        .eq('id', commentId);

      if (error) throw error;

      setEditingId(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(lang === 'cs-CZ' ? 'Opravdu chcete smazat tento komentář?' : 'Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await db
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) return;

    // Optimistic UI update
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            user_liked: !isLiked,
            like_count: isLiked ? Math.max(0, comment.like_count - 1) : comment.like_count + 1,
          };
        }
        // Also check replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId 
                ? { ...reply, user_liked: !isLiked, like_count: isLiked ? Math.max(0, reply.like_count - 1) : reply.like_count + 1 }
                : reply
            ),
          };
        }
        return comment;
      })
    );

    try {
      if (isLiked) {
        await db
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        await db.from('comment_likes').insert({
          comment_id: commentId,
          user_id: user.id,
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      fetchComments();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return lang === 'cs-CZ' ? 'právě teď' : 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(lang);
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={`flex gap-2 sm:gap-3 ${isReply ? 'ml-8 sm:ml-12 mt-3' : ''}`}>
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-iconic-pink/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {comment.user_profile?.avatar_url ? (
          <img src={comment.user_profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-iconic-pink font-bold text-sm">
            {comment.user_profile?.display_name?.charAt(0).toUpperCase() || '?'}
          </span>
        )}
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-iconic-black">
              {comment.user_profile?.display_name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(comment.created_at)}
              {comment.is_edited && <span className="ml-1">• {t.edited}</span>}
            </span>
          </div>
          
          {editingId === comment.id ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="px-3 py-1 bg-iconic-pink text-white text-xs rounded-full"
                >
                  {t.send}
                </button>
                <button
                  onClick={() => { setEditingId(null); setEditContent(''); }}
                  className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mt-3 ml-1 sm:ml-2 flex-wrap">
          {/* Like Button */}
          <button
            onClick={() => handleLikeComment(comment.id, comment.user_liked)}
            className={`group flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-300 ease-out ${
              comment.user_liked 
                ? 'text-iconic-pink bg-iconic-pink/15 border-iconic-pink/30 shadow-sm' 
                : 'text-gray-500 bg-gray-50 border-gray-200 hover:text-iconic-pink hover:bg-iconic-pink/10 hover:border-iconic-pink/30 hover:shadow-md'
            }`}
            disabled={!user}
          >
            <Heart 
              size={15} 
              fill={comment.user_liked ? 'currentColor' : 'none'} 
              className={`transition-all duration-300 ${
                comment.user_liked 
                  ? 'scale-110 animate-pulse' 
                  : 'group-hover:scale-125 group-hover:-rotate-12 group-active:scale-75'
              }`}
            />
            <span className="transition-all duration-200">{comment.like_count > 0 ? comment.like_count : ''}</span>
          </button>

          {/* Reply Button */}
          {user && !isReply && (
            <button
              onClick={() => { setReplyingTo(comment.id); setReplyContent(''); }}
              className="group flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 hover:text-iconic-blue hover:bg-iconic-blue/10 hover:border-iconic-blue/30 hover:shadow-md px-3 py-1.5 rounded-full transition-all duration-300 ease-out"
            >
              <MessageCircle 
                size={15} 
                className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-active:scale-75" 
              />
              <span>{t.reply}</span>
            </button>
          )}

          {/* Edit & Delete Buttons */}
          {user && user.id === comment.user_id && (
            <>
              <button
                onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                className="group flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 hover:shadow-md px-3 py-1.5 rounded-full transition-all duration-300 ease-out"
              >
                <Edit2 
                  size={15} 
                  className="transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12 group-active:scale-75" 
                />
                <span>{t.edit}</span>
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="group flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 hover:text-red-500 hover:bg-red-50 hover:border-red-200 hover:shadow-md px-3 py-1.5 rounded-full transition-all duration-300 ease-out"
              >
                <Trash2 
                  size={15} 
                  className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-active:scale-75" 
                />
                <span>{t.delete}</span>
              </button>
            </>
          )}
        </div>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-4 flex gap-2 animate-fade-in-up">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t.write_comment}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-iconic-blue/30 focus:border-iconic-blue/50 focus:bg-white transition-all duration-300"
              autoFocus
            />
            <button
              onClick={() => handleSubmitReply(comment.id)}
              disabled={!replyContent.trim() || submitting}
              className="group p-2.5 bg-iconic-blue text-white rounded-full hover:bg-blue-600 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
            >
              <Send size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-2.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-700 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg sm:text-xl font-bold text-iconic-black mb-4 sm:mb-6 flex items-center gap-2">
        <MessageCircle size={24} className="text-iconic-pink" />
        {t.comments} ({comments.length})
      </h3>

      {/* Comment input */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6 sm:mb-8">
          <div className="flex gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-iconic-pink to-iconic-blue flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-bold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t.write_comment}
                className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-iconic-pink/30 focus:border-iconic-pink/50 focus:bg-white transition-all duration-300"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="group p-2.5 sm:p-3 bg-iconic-pink text-white rounded-full hover:bg-pink-600 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
              >
                <Send size={16} className="sm:w-[18px] sm:h-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-500 text-sm mb-3">{t.login_to_comment}</p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-iconic-pink text-white text-sm font-bold rounded-full hover:bg-pink-700 transition-colors"
          >
            {t.login}
          </a>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t.no_comments}</div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
