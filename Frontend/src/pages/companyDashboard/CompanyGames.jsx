import React, { useState, useEffect } from 'react';
import companyApi from '../../api/companyApi';
import useAuth from '../../hooks/useAuth';
import GameCard from '../../components/GameCard';
import gameApi from '../../api/gameApi';
import './companyGames.css';

const CompanyGames = ({ reference, onSuccess, onGameDelete }) => {
  const { auth } = useAuth();
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const authToken = auth?.accessToken;

  const fetchCompanyGames = async () => {
    if (!authToken) {
      setError('Authentication token not found');
      return;
    }

    try {
      const companyData = await companyApi.getCurrentCompany(authToken);
      
      if (!companyData) {
        setError('No company data received');
        return;
      }

      if (!Array.isArray(companyData.games)) {
        setError('Invalid games data format');
        return;
      }

      if (companyData.games.length === 0) {
        setGames([]);
        return;
      }

      const gameDetailsPromises = companyData.games.map(async (gameId) => {
        try {
          const gameDetails = await gameApi.getGame(gameId, authToken);
          return gameDetails;
        } catch (error) {
          console.error(`Error fetching game ${gameId}:`, error);
          return null;
        }
      });

      const detailedGames = await Promise.all(gameDetailsPromises);
      
      const validGames = detailedGames.filter(game => game !== null);
      
      setGames(validGames);
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(`Error fetching company games: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchCompanyGames();
  }, [authToken]);

  // Ensure to remove the deleted game from the list
  const handleDeleteGame = async (gameId) => {
    await onGameDelete(gameId);  // Call onGameDelete function passed from parent
    setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));  // Remove the game from the state
  };

  if (error) {
    return (
      <section id="companyGames" ref={reference} className="error-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section id="companyGames" ref={reference}>
        <div className="container">
          {games.length > 0 ? (
            <div className="row">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onGameDelete={handleDeleteGame} // Pass the delete handler to GameCard
                />
              ))}
            </div>
          ) : (
            <div className="no-games-message">
              <h3>No games found</h3>
              <p>Your company hasn't registered any games yet.</p>
            </div>
          )}
        </div>
    </section>
  );
};

export default CompanyGames;