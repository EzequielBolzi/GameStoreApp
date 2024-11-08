import axios from 'axios';
import io from 'socket.io-client';

// You might want to set a base URL for your API
const API_BASE_URL = 'http://localhost:3000/api'; // Correct URL for your backend

const gameApi = {
    // Get all games with optional filters
    getAllGames: async (filters = {}) => {
        try {
            // Prepare the query string from filters
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            // Make the GET request with query parameters appended to the URL
            const response = await axios.get(`${API_BASE_URL}/games?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching games');
        }
    },
    // Get a single game by ID
    getGame: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/games/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching game');
        }
    },
    // Get game statistics (for company users)
    getGameStatistics: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/games/statistics/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching game statistics');
        }
    },

    // Create a new game (for company users)
    createGame: async (gameData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/games`, gameData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error creating game');
        }
    },

    // Update a game (for company users)
    updateGame: async (id, gameData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/games/${id}`, gameData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error updating game');
        }
    },

    // Delete a game (for company users)
    deleteGame: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/games/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error deleting game');
        }
    },

    // Set a game sale (for company users)
    setGameSale: async (id, saleData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/games/sale/${id}`, saleData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error setting game sale');
        }
    },

    // Remove a game sale (for company users)
    removeSale: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/games/sale/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error removing game sale');
        }
    }
};

export default gameApi;