import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Twitter, 
  Github, 
  Linkedin,
  Edit,
  Settings,
  Users,
  FileText,
  Heart,
  Eye
} from 'lucide-react';
import PostCard from '../components/Blog/PostCard';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Fetch user profile by username from backend
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/username/${username}`
        );
        setProfile(res.data.data);
        console.log('Fetched profile:', res.data.data);

        // Optionally, fetch user's posts if you have such an endpoint
        const postsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/${res.data.data._id}/posts`
        );
        console.log('Fetched profile posts:', postsRes.data.data);
        setPosts(postsRes.data.data);

        // Optionally, set following status if your API provides it
        setIsFollowing(false);
      } catch (error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      // If already following, you might want to call the unfollow endpoint (not shown here)
      if (!isFollowing) {
        const token = localStorage.getItem('authToken');
        await axios.post(
          `${import.meta.env.VITE_API_URL}/users/${profile._id}/follow`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setIsFollowing(true);
        setProfile((prev) => ({
          ...prev,
          followers: (prev.followers ?? 0) + 1,
        }));
      } else {
        // Optionally handle unfollow here if you have a DELETE endpoint
      }
    } catch (error) {
      // Optionally show error to user
      console.error('Failed to follow user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            User not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-32 h-32 rounded-full mx-auto md:mx-0"
          />
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {profile.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              @{profile.username}
            </p>
            
            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                {profile.bio}
              </p>
            )}
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              {profile.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Joined {
                    profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : 'Unknown'
                  }
                </span>
              </div>
              
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
            </div>
            
            {/* Social Links */}
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-6">
              {profile.socialLinks?.twitter && (
                <a
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {profile.socialLinks?.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-center md:justify-start space-x-6 text-sm mb-6">
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {(profile.followers ?? 0).toLocaleString()}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {(profile.following ?? 0).toLocaleString()}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Following</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {profile.postsCount}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Posts</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start space-x-3">
              {isOwnProfile ? (
                <>
                  <Link to="/settings" className="btn-primary flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>
                  <Link to="/settings" className="btn-outline flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 text-center">
          <FileText className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile.postsCount}
          </div>
          <div className="text-gray-500 dark:text-gray-400">Posts Published</div>
        </div>
        
        <div className="card p-6 text-center">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {(profile.totalLikes ?? 0).toLocaleString()}
          </div>
          <div className="text-gray-500 dark:text-gray-400">Total Likes</div>
        </div>
        
        <div className="card p-6 text-center">
          <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {(profile.totalViews ?? 0).toLocaleString()}
          </div>
          <div className="text-gray-500 dark:text-gray-400">Total Views</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 mb-8 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'posts'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Posts ({profile.postsCount})
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No posts yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {isOwnProfile ? "You haven't published any posts yet." : "This user hasn't published any posts yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;