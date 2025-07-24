import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios'; // Add this import

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const fetchUser = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        dispatch({ type: 'LOGIN', payload: response.data.data });
      } catch (error) {
        localStorage.removeItem('authToken');
        dispatch({ type: 'LOGOUT' });
      }
    };
    fetchUser();
  }, []);

  const login = async (userData, token) => {
    localStorage.setItem('authToken', token);
    // Fetch user from backend to ensure fresh data
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      dispatch({ type: 'LOGIN', payload: response.data.data });
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
    } catch (error) {
      // Optionally handle error (e.g., network issues)
    } finally {
      localStorage.removeItem('authToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = (profileData) => {
    const updatedUser = { ...state.user, ...profileData };
    dispatch({ type: 'UPDATE_PROFILE', payload: profileData });
  };

  const value = {
    ...state,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};