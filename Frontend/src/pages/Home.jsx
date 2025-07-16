import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Users, Tag, Mail } from 'lucide-react';
import PostCard from '../components/Blog/PostCard';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('latest');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockPosts = [
          {
            id: '1',
            title: 'Getting Started with React 19: New Features and Improvements',
            slug: 'getting-started-react-19',
            excerpt: 'Explore the latest features in React 19 including concurrent rendering, automatic batching, and new hooks that will revolutionize your development workflow.',
            content: 'React 19 brings exciting new features...',
            coverImage: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
            author: {
              id: '1',
              name: 'Sarah Johnson',
              username: 'sarahj',
              avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
            },
            publishedAt: '2025-01-15T10:00:00Z',
            tags: ['React', 'JavaScript', 'Frontend'],
            likes: 124,
            comments: 18,
            views: 1250,
            isLiked: false,
            isBookmarked: false
          },
          {
            id: '2',
            title: 'Building Scalable APIs with Node.js and Express',
            slug: 'scalable-apis-nodejs-express',
            excerpt: 'Learn how to build robust, scalable APIs using Node.js and Express with best practices for authentication, validation, and error handling.',
            content: 'Building scalable APIs requires...',
            coverImage: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
            author: {
              id: '2',
              name: 'Michael Chen',
              username: 'mchen',
              avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
            },
            publishedAt: '2025-01-14T15:30:00Z',
            tags: ['Node.js', 'Express', 'Backend', 'API'],
            likes: 89,
            comments: 12,
            views: 890,
            isLiked: true,
            isBookmarked: false
          },
          {
            id: '3',
            title: 'The Future of Web Development: Trends to Watch in 2025',
            slug: 'future-web-development-2025',
            excerpt: 'Discover the emerging trends and technologies that will shape web development in 2025, from AI integration to new frameworks.',
            content: 'The web development landscape is constantly evolving...',
            coverImage: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
            author: {
              id: '3',
              name: 'Emily Rodriguez',
              username: 'emilyrod',
              avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
            },
            publishedAt: '2025-01-13T09:15:00Z',
            tags: ['Web Development', 'Trends', 'Technology'],
            likes: 156,
            comments: 24,
            views: 2100,
            isLiked: false,
            isBookmarked: true
          },
          {
            id: '4',
            title: 'Mastering CSS Grid: Advanced Layout Techniques',
            slug: 'mastering-css-grid-advanced',
            excerpt: 'Take your CSS Grid skills to the next level with advanced techniques for creating complex, responsive layouts.',
            content: 'CSS Grid is a powerful layout system...',
            author: {
              id: '4',
              name: 'David Kim',
              username: 'davidk',
              avatar: null
            },
            publishedAt: '2025-01-12T14:20:00Z',
            tags: ['CSS', 'Grid', 'Layout', 'Frontend'],
            likes: 67,
            comments: 8,
            views: 540,
            isLiked: false,
            isBookmarked: false
          },
          {
            id: '5',
            title: 'Database Design Best Practices for Modern Applications',
            slug: 'database-design-best-practices',
            excerpt: 'Learn essential database design principles and best practices for building efficient, scalable applications.',
            content: 'Good database design is crucial...',
            coverImage: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
            author: {
              id: '5',
              name: 'Lisa Wang',
              username: 'lisaw',
              avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=100'
            },
            publishedAt: '2025-01-11T11:45:00Z',
            tags: ['Database', 'SQL', 'Backend'],
            likes: 92,
            comments: 15,
            views: 780,
            isLiked: false,
            isBookmarked: false
          }
        ];
        
        setPosts(mockPosts);
        setFeaturedPost(mockPosts[0]);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const tabs = [
    { id: 'latest', label: 'Latest', icon: Clock },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'following', label: 'Following', icon: Users, requiresAuth: true },
  ];

  const popularTags = [
    'JavaScript', 'React', 'Node.js', 'Python', 'CSS', 'TypeScript', 
    'Vue.js', 'Angular', 'Backend', 'Frontend', 'Database', 'API'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container-width section-padding">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Hero Section */}
          {featuredPost && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold gradient-text">
                  Featured Post
                </h2>
              </div>
              <div className="animate-fade-in">
                <PostCard post={featuredPost} variant="featured" />
              </div>
            </section>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 mb-12 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              if (tab.requiresAuth && !isAuthenticated) return null;
              
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold border-b-2 transition-all duration-200 hover-scale ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-t-xl'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Posts List */}
          <div className="space-y-8">
            {posts.slice(1).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Load More */}
          <div className="mt-16 text-center">
            <button className="btn-outline hover-lift">
              Load More Posts
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-8">
            {/* Popular Tags */}
            <div className="card p-8 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                  <Tag className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Popular Tags
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {popularTags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tag/${tag.toLowerCase()}`}
                    className="badge-primary hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-all duration-200 hover-scale"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Authors */}
            <div className="card p-8 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                  <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Trending Authors
                </h3>
              </div>
              <div className="space-y-5">
                {posts.slice(0, 3).map((post) => (
                  <Link
                    key={post.author.id}
                    to={`/profile/${post.author.username}`}
                    className="flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-xl transition-all duration-200 hover-lift"
                  >
                    <img
                      src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.name}&background=3b82f6&color=fff`}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full ring-2 ring-primary-200 dark:ring-primary-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {post.author.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        @{post.author.username}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="card p-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Stay Updated
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                Get the latest posts delivered right to your inbox.
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input-field"
                />
                <button className="w-full btn-primary hover-lift">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;