import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image, 
  Eye, 
  Save, 
  Send,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const PostEditor = ({ isEditing = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (title || content) {
        handleSaveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [title, content, excerpt, tags, coverImage]);

  useEffect(() => {
    if (isEditing && slug) {
      const fetchPost = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/posts/slug/${slug}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );
          const data = res.data.data;
          setTitle(data.title || '');
          setContent(data.content || '');
          setExcerpt(data.excerpt || '');
          setTags(data.tags || []);
          setCoverImage(data.coverImage || '');
          setIsDraft(data.status === 'draft');
        } catch (error) {
          console.error('Failed to fetch post for editing:', error);
        }
      };
      fetchPost();
    }
  }, [isEditing, slug]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to save draft
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in the title and content before publishing.');
      return;
    }

    setIsPublishing(true);
    try {
      const token = localStorage.getItem('authToken');
      let res;
      if (isEditing && slug) {
        // Fetch post to get its _id
        const getRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/slug/${slug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        const postId = getRes.data.data._id;
        // Update post
        res = await axios.put(
          `${import.meta.env.VITE_API_URL}/posts/${postId}`,
          {
            title,
            content,
            excerpt,
            tags,
            coverImage,
            status: 'published'
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
      } else {
        // Create post
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/posts`,
          {
            title,
            content,
            excerpt,
            tags,
            coverImage,
            status: 'published'
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
      }
      navigate(`/posts/${res.data.data._id}`);
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert('Failed to publish post.');
    } finally {
      setIsPublishing(false);
    }
  };

  const insertFormatting = (before, after = '') => {
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('image', file);

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload/image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          }
        );

        const imageUrl = res.data.data.url;
        setCoverImage(imageUrl); // Set as cover image
        insertFormatting(`![${file.name}](${imageUrl})`);
      } catch (error) {
        alert('Image upload failed.');
        console.error(error);
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
            alt={user?.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.name}
            </p>
            {lastSaved && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last saved {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="btn-outline flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
          
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="btn-secondary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="btn-primary flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {!isPreview ? (
        <div className="space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image URL (optional)
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input-field"
            />
            {coverImage && (
              <div className="mt-3">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt (optional)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a brief description of your post..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center space-x-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="input-field flex-1"
              />
              <button
                onClick={addTag}
                className="btn-outline flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => insertFormatting('**', '**')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => insertFormatting('*', '*')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => insertFormatting('[', '](url)')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => insertFormatting('- ')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => insertFormatting('1. ')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => insertFormatting('> ')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => insertFormatting('`', '`')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Code"
            >
              <Code className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Image"
            >
              <Image className="w-4 h-4" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Content Editor */}
          <div>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story..."
              className="w-full h-96 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          {coverImage && (
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-64 object-cover rounded-lg"
            />
          )}
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {title || 'Untitled Post'}
          </h1>
          
          {excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-300 italic">
              {excerpt}
            </p>
          )}
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="prose dark:prose-invert max-w-none">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostEditor;