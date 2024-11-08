import React, { useState, useEffect } from 'react';
import gameApi from '../api/gameApi';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    language: '',
    minPrice: '',
    maxPrice: '',
    system: ''
  });

  // Fetch games with current filters
  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gameApi.getAllGames(filters);  // Ensure this returns the correct data
      setGames(response);  // Assuming the response is an array of games
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters change
  useEffect(() => {
    fetchGames();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Render loading, error, or list of games
  if (loading) return <div className="text-center p-4">Loading games...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div>
      {/* Game List */}
      <div className="game-list">
        {games.length > 0 ? (
          games.map((game) => (
            <div key={game.id} className="game-item">
              <h3>{game.name}</h3>
              <p>{game.description}</p>
              {/* Add more game details here */}
            </div>
          ))
        ) : (
          <div>No games found</div>
        )}
      </div>
    </div>
  );
};

export default GameList;
