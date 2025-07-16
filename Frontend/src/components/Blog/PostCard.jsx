import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Bookmark, MessageCircle, Share2, Clock, Eye } from 'lucide-react';
import { useState } from 'react';

const PostCard = ({ post, variant = 'default' }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = (e) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    // TODO: API call to like/unlike post
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
    // TODO: API call to bookmark/unbookmark post
  };

  const handleShare = (e) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: `/post/${post.slug}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.slug}`);
      // TODO: Show toast notification
    }
  };

  const readingTime = Math.ceil(post.content?.split(' ').length / 200) || 5;

  if (variant === 'featured') {
    return (
      <article className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
        <Link to={`/post/${post.slug}`} className="block">
          <div className="aspect-[16/9] overflow-hidden relative">
            <img
              src={post.coverImage || 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.name}&background=3b82f6&color=fff`}
                alt={post.author.name}
                className="w-12 h-12 rounded-full ring-2 ring-primary-200 dark:ring-primary-800"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {post.author.name}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatDistanceToNow(new Date(post.publishedAt))} ago</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 text-balance group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
              {post.title}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 text-lg leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="badge-primary hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors duration-200 cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
        
        <div className="px-8 pb-8">
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-all duration-200 hover-scale ${
                  isLiked 
                    ? 'text-red-500 scale-110' 
                    : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{likeCount}</span>
              </button>
              
              <Link
                to={`/post/${post.slug}#comments`}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-200 hover-scale"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="font-medium">{post.comments || 0}</span>
              </Link>
              
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Eye className="w-6 h-6" />
                <span className="font-medium">{post.views || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBookmark}
                className={`p-3 rounded-xl transition-all duration-200 hover-scale ${
                  isBookmarked
                    ? 'text-primary-600 bg-primary-100 dark:bg-primary-900/30 scale-110'
                    : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:text-gray-400 dark:hover:text-primary-400 dark:hover:bg-primary-900/20'
                }`}
              >
                <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover-scale"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card-interactive p-8 animate-fade-in">
      <Link to={`/post/${post.slug}`} className="block">
        <div className="flex items-start space-x-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.name}&background=3b82f6&color=fff`}
                alt={post.author.name}
                className="w-10 h-10 rounded-full ring-2 ring-primary-200 dark:ring-primary-800"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {post.author.name}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatDistanceToNow(new Date(post.publishedAt))} ago</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{readingTime} min</span>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 text-balance hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300">
              {post.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-lg leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags?.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="badge-primary text-sm hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors duration-200 cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {post.coverImage && (
            <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-2xl">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
          )}
        </div>
      </Link>
      
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-all duration-200 hover-scale ${
              isLiked 
                ? 'text-red-500 scale-110' 
                : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{likeCount}</span>
          </button>
          
          <Link
            to={`/post/${post.slug}#comments`}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-200 hover-scale"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{post.comments || 0}</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl transition-all duration-200 hover-scale ${
              isBookmarked
                ? 'text-primary-600 bg-primary-100 dark:bg-primary-900/30 scale-110'
                : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:text-gray-400 dark:hover:text-primary-400 dark:hover:bg-primary-900/20'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover-scale"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;