import React, { useState, useEffect } from 'react';
import userApi from '../../api/userApi';
import useAuth from '../../hooks/useAuth';
import GameCard from '../../components/GameCard';
import gameApi from '../../api/gameApi';

const UserPurchasedGames = ({ reference}) => {
  const { auth } = useAuth();
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const authToken = auth?.accessToken;

  const fetchUserGames = async () => {
    console.log('Starting fetchUserGames');
    console.log('Auth token exists:', !!authToken);

    if (!authToken) {
      setError('Authentication token not found');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching user data...');
      const userData = await userApi.getCurrentUser(authToken);
      console.log('User data received:', userData);

      if (!userData) {
        setError('No user data received');
        setLoading(false);
        return;
      }

      console.log('Purchased games:', userData.purchasedGames);

      if (!userData.purchasedGames) {
        setError('No purchased games data found');
        setLoading(false);
        return;
      }

      if (!Array.isArray(userData.purchasedGames)) {
        setError('Invalid purchased games data format');
        setLoading(false);
        return;
      }

      if (userData.purchasedGames.length === 0) {
        setGames([]);
        setLoading(false);
        return;
      }

      const fetchedGames = [];
      
      for (const gameId of userData.purchasedGames) {
        try {
          console.log('Fetching game details for ID:', gameId);
          const gameDetails = await gameApi.getGame(gameId, authToken);
          console.log('Game details received:', gameDetails);
          
          if (gameDetails) {
            fetchedGames.push(gameDetails);
          }
        } catch (error) {
          console.error(`Error fetching game ${gameId}:`, error);
        }
      }

      console.log('All games fetched:', fetchedGames);
      setGames(fetchedGames);
    } catch (error) {
      console.error('Error in fetchUserGames:', error);
      setError(`Error fetching purchased games: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGames();
  }, [authToken]);

  if (loading) {
    return (
      <section id="purchasedGames" ref={reference} className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="purchasedGames" ref={reference} className="error-container">
        <div className="alert alert-danger" role="alert">
          <h4>Error Loading Games</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-2" 
            onClick={fetchUserGames}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="purchasedGames" ref={reference}>
      <div className="container">
        <h2 className="text-center mb-4">My Games Library</h2>
        {games.length > 0 ? (
          <div className="row">
            {games.map((game) => (
          
                <GameCard 
                  key={game.id} 
                  game={game} 
                  isPurchased={true}  
                />
            ))}
          </div>
        ) : (
          <div className="no-games-message text-center">
            <h3>No purchased games</h3>
            <p>You haven't purchased any games yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserPurchasedGames;