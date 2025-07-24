import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Bookmark, 
  Share2, 
  MessageCircle, 
  Eye, 
  Clock, 
  Calendar,
  ArrowLeft,
  MoreHorizontal,
  Flag,
  Edit,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';


const BlogPost = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        console.log(`Fetching post with id: ${postId}`);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/${postId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setPost(res.data.data);
        setComments(res.data.data.comments || []);
        setIsLiked(res.data.data.isLiked);
        setIsBookmarked(res.data.data.isBookmarked);
        setLikeCount(res.data.data.likes || 0);
       
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

 const handleLike = async () => {
  const token = localStorage.getItem('authToken');
  
  // Optimistic UI update
  setIsLiked(!isLiked);
  setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/posts/${post._id}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    if (res.data.success) {
      setLikeCount(res.data.data.likeCount);
    }

  } catch (error) {
    console.error('Failed to like post:', error);
    setIsLiked(prev => !prev);
    setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
  }
};

  // Submit a comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments`,
        {
          postId: post._id,
          content: newComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setComments(prev => [...prev, res.data.data]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Edit a comment
  const handleEditComment = async (commentId, updatedContent) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/comments/${commentId}`,
        { content: updatedContent },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId ? { ...comment, content: res.data.data.content } : comment
        )
      );
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  // Like a comment
  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments/${commentId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId ? { ...comment, likes: res.data.data.likes, isLiked: true } : comment
        )
      );
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  // Unlike a comment
  const handleUnlikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/comments/${commentId}/like`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId ? { ...comment, likes: res.data.data.likes, isLiked: false } : comment
        )
      );
    } catch (error) {
      console.error('Failed to unlike comment:', error);
    }
  };

  // Delete post
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/posts/${post._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      navigate('/');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post.');
    }
  };

  // Bookmark/Unbookmark post
  const handleBookmark = async () => {
    const token = localStorage.getItem('authToken');
    try {
      if (!isBookmarked) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/users/bookmarks/${post._id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setIsBookmarked(true);
      } else {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/users/bookmarks/${post._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setIsBookmarked(false);
      }
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${post._id}`);
  };

  const isAuthor = user?.id === post?.author.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Post not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Article Header */}
      <article className="mb-8">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
          />
        )}

        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.views.toLocaleString()} views</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/tag/${tag.toLowerCase()}`}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full hover:bg-primary-200 dark:hover:bg-primary-800/40 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Link
            to={`/profile/${post.author.username}`}
            className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
          >
            <img
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.name}&background=3b82f6&color=fff`}
              alt={post.author.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {post.author.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                @{post.author.username}
              </div>
              {post.author.bio && (
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {post.author.bio}
                </div>
              )}
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Post</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isAuthor && (
              <button className="btn-primary">
                Follow
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.likes?.length || 0}</span>
            </button>

            <a
              href="#comments"
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">{comments.length}</span>
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-primary-600 bg-primary-100 dark:bg-primary-900/30'
                  : 'text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-primary-400 dark:hover:bg-gray-700'
              }`}
            >
              <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>

            {!isAuthor && (
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Flag className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="prose dark:prose-invert max-w-none mb-12">
          {post.content.split('\n').map((paragraph, index) => {
            if (paragraph.startsWith('# ')) {
              return (
                <h1 key={index} className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                  {paragraph.substring(2)}
                </h1>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
                  {paragraph.substring(3)}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
                  {paragraph.substring(4)}
                </h3>
              );
            }
            if (paragraph.startsWith('```')) {
              return null; // Handle code blocks separately if needed
            }
            if (paragraph.trim() === '') {
              return <br key={index} />;
            }
            return (
              <p key={index} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>
      </article>

      {/* Comments Section */}
      <section id="comments" className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Comments ({comments.length})
        </h2>

        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="flex space-x-4">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff`}
                alt={user.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="input-field resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to leave a comment
            </p>
            <Link to="/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <Link to={`/profile/${comment.author.username}`}>
                <img
                  src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.name}&background=3b82f6&color=fff`}
                  alt={comment.author.name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              </Link>
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Link
                      to={`/profile/${comment.author.username}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {comment.author.name}
                    </Link>
                    <span className="text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 mt-2 ml-4">
                  <button
                    className={`text-sm ${comment.isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors`}
                    onClick={() =>
                      comment.isLiked
                        ? handleUnlikeComment(comment.id)
                        : handleLikeComment(comment.id)
                    }
                  >
                    <Heart className="w-4 h-4 inline mr-1" />
                    {comment.likes}
                  </button>
                  {/* Add edit button and logic as needed */}
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-6 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-3">
                        <Link to={`/profile/${reply.author.username}`}>
                          <img
                            src={reply.author.avatar || `https://ui-avatars.com/api/?name=${reply.author.name}&background=3b82f6&color=fff`}
                            alt={reply.author.name}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        </Link>
                        <div className="flex-1">
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <Link
                                to={`/profile/${reply.author.username}`}
                                className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                              >
                                {reply.author.name}
                              </Link>
                              <span className="text-gray-500 dark:text-gray-400">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(reply.createdAt))} ago
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {reply.content}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3 mt-1 ml-3">
                            <button className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                              <Heart className="w-3 h-3 inline mr-1" />
                              {reply.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default BlogPost;