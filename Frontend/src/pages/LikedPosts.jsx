import { useState, useEffect } from 'react';
import { Heart, Search, Filter, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/Blog/PostCard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'; // <-- Add this import

const LikedPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/liked`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setLikedPosts(res.data.data);
      } catch (error) {
        console.error('Failed to fetch liked posts:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/tags`);
        setAllTags(res.data.data.map(tag => tag.name));
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };

    fetchLikedPosts();
    fetchTags();
  }, []);

  // Filter liked posts based on search and tag
  const filteredPosts = likedPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === '' || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Sort liked posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.likedAt) - new Date(a.likedAt);
      case 'oldest':
        return new Date(a.likedAt) - new Date(b.likedAt);
      case 'popular':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors hover-scale"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Liked Posts
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {likedPosts.length} {likedPosts.length === 1 ? 'post' : 'posts'} you've liked
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search liked posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="input-field pl-10 pr-8 appearance-none bg-white dark:bg-gray-800"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="recent">Recently Liked</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Liked Posts List */}
      {sortedPosts.length > 0 ? (
        <div className="space-y-6">
          {sortedPosts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} />
              <div className="absolute top-4 right-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Liked {new Date(post.likedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedTag ? 'No matching liked posts' : 'No liked posts yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery || selectedTag 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start liking posts to see them here.'
            }
          </p>
          {!searchQuery && !selectedTag && (
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Explore Posts
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LikedPosts;