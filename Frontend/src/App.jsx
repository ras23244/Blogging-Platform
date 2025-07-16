import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Write from './pages/Write';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import Settings from './pages/Settings';
import LikedPosts from './pages/LikedPosts';
import BlogPost from './pages/BlogPost';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/write" element={<Write />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/liked" element={<LikedPosts />} />
              <Route path="/post/:slug" element={<BlogPost />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              {/* Add more routes as needed */}
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;