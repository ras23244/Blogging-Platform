import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Users, Tag, Mail } from 'lucide-react';
import PostCard from '../components/Blog/PostCard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'; // <-- Add this import

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('latest');
  const [popularTags, setPopularTags] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Fetch all posts from backend
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts`);
        setPosts(res.data.data);
        console.log('Fetched posts:', res.data.data);
        setFeaturedPost(res.data.data[0] || null);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/tags`);
        setPopularTags(res.data.data.map(tag => tag.name));
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };

    fetchPosts();
    fetchTags();
  }, []);

  const handleTagClick = async (tag) => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tags/${tag}/posts`);
      setPosts(res.data.data);
      setFeaturedPost(res.data.data[0] || null);
    } catch (error) {
      console.error('Failed to fetch posts by tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'latest', label: 'Latest', icon: Clock },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'following', label: 'Following', icon: Users, requiresAuth: true },
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
              <PostCard key={post._id} post={post} />
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
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="badge-primary hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-all duration-200 hover-scale"
                  >
                    {tag}
                  </button>
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