import React, { useState, useEffect } from 'react';
import companyApi from '../../api/companyApi';
import useAuth from '../../hooks/useAuth';
import GameCard from '../../components/GameCard';
import gameApi from '../../api/gameApi';
import './companyGames.css';

const CompanyGames = ({ reference, onSuccess, onGameDelete, onDiscountSave}) => {
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

      if (!companyData || !Array.isArray(companyData.games)) {
        setError('No games or invalid data received');
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
      setGames(detailedGames.filter((game) => game !== null));
      onSuccess();
    } catch (error) {
      setError(`Error fetching company games: ${error.message}`);
    }
  };

  useEffect(() => {
    if (authToken) fetchCompanyGames();
  }, [authToken]); 

  const handleDeleteGame = async (gameId) => {
    await onGameDelete(gameId);
    setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
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
                onGameDelete={handleDeleteGame}
                onDiscountSave={onDiscountSave}
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
