// userApi.js
import axios from 'axios';

// Set the base URL for your API
const API_BASE_URL = 'http://localhost:3000/api/users'; // Adjust the URL as needed

const userApi = {
    // Register a new user
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}`, userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error registering user');
        }
    },

    // User login
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/sessions`, credentials);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error logging in');
        }
    },

    // Get current authenticated user information
    getCurrentUser: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/me`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching current user data');
        }
    },

    // Get all users
    getAllUsers: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching users');
        }
    },

    // Update user profile (authenticated user only)
    updateProfile: async (profileData) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/profile`, profileData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error updating user profile');
        }
    },

    // Reset user password
    forgotPassword: async (email) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error sending password reset email');
        }
    },

    // Comment and rate a game
    commentAndRate: async (gameId, commentData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/commendAndRate/${gameId}`, commentData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error commenting and rating game');
        }
    },

    // Delete a comment and rating
    deleteCommentAndRate: async (commentId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/commendAndRate/${commentId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error deleting comment and rating');
        }
    },

    // Purchase a game
    purchaseGame: async (gameId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/orders/${gameId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error purchasing game');
        }
    },

    // Add a game to the wishlist
    addGameToWishlist: async (gameId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/wishlist/${gameId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error adding game to wishlist');
        }
    },

    // Remove a game from the wishlist
    removeGameFromWishlist: async (gameId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/wishlist/${gameId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error removing game from wishlist');
        }
    },
};

export default userApi;
