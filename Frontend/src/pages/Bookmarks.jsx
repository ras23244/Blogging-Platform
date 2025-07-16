import { useState, useEffect } from 'react';
import { Bookmark, Search, Filter, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/Blog/PostCard';
import { useAuth } from '../contexts/AuthContext';

const Bookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockBookmarks = [
          {
            id: '1',
            title: 'The Future of Web Development: Trends to Watch in 2025',
            slug: 'future-web-development-2025',
            excerpt: 'Discover the emerging trends and technologies that will shape web development in 2025, from AI integration to new frameworks.',
            coverImage: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
            author: {
              id: '3',
              name: 'Emily Rodriguez',
              username: 'emilyrod',
              avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
            },
            publishedAt: '2025-01-13T09:15:00Z',
            bookmarkedAt: '2025-01-14T10:30:00Z',
            tags: ['Web Development', 'Trends', 'Technology'],
            likes: 156,
            comments: 24,
            views: 2100,
            isLiked: false,
            isBookmarked: true
          },
          {
            id: '2',
            title: 'Mastering CSS Grid: Advanced Layout Techniques',
            slug: 'mastering-css-grid-advanced',
            excerpt: 'Take your CSS Grid skills to the next level with advanced techniques for creating complex, responsive layouts.',
            author: {
              id: '4',
              name: 'David Kim',
              username: 'davidk',
              avatar: null
            },
            publishedAt: '2025-01-12T14:20:00Z',
            bookmarkedAt: '2025-01-13T16:45:00Z',
            tags: ['CSS', 'Grid', 'Layout', 'Frontend'],
            likes: 67,
            comments: 8,
            views: 540,
            isLiked: false,
            isBookmarked: true
          },
          {
            id: '3',
            title: 'Building Scalable APIs with Node.js and Express',
            slug: 'scalable-apis-nodejs-express',
            excerpt: 'Learn how to build robust, scalable APIs using Node.js and Express with best practices for authentication, validation, and error handling.',
            coverImage: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
            author: {
              id: '2',
              name: 'Michael Chen',
              username: 'mchen',
              avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
            },
            publishedAt: '2025-01-14T15:30:00Z',
            bookmarkedAt: '2025-01-15T09:20:00Z',
            tags: ['Node.js', 'Express', 'Backend', 'API'],
            likes: 89,
            comments: 12,
            views: 890,
            isLiked: true,
            isBookmarked: true
          }
        ];
        
        setBookmarks(mockBookmarks);
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  // Get all unique tags from bookmarks
  const allTags = [...new Set(bookmarks.flatMap(post => post.tags))];

  // Filter bookmarks based on search and tag
  const filteredBookmarks = bookmarks.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === '' || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Sort bookmarks
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt);
      case 'oldest':
        return new Date(a.bookmarkedAt) - new Date(b.bookmarkedAt);
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
          <Bookmark className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Bookmarks
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {bookmarks.length} saved {bookmarks.length === 1 ? 'article' : 'articles'}
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
              placeholder="Search bookmarks..."
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
            <option value="recent">Recently Saved</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Bookmarks List */}
      {sortedBookmarks.length > 0 ? (
        <div className="space-y-6">
          {sortedBookmarks.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} />
              <div className="absolute top-4 right-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Saved {new Date(post.bookmarkedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedTag ? 'No matching bookmarks' : 'No bookmarks yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery || selectedTag 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start bookmarking articles you want to read later.'
            }
          </p>
          {!searchQuery && !selectedTag && (
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Explore Articles
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;