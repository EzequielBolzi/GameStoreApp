import React, { useState, useEffect, useContext } from 'react';
import './gameCard.css';
import GameRating from './GameRating';
import companyApi from '../api/companyApi';
import { AppContext } from '../App';

function GameCard({ game }) {


  const [company, setCompany] = useState(null);


  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const data = await companyApi.getCompanyById(game.company);
        setCompany(data.companyName);
      } catch (error) {
        console.error('Error fetching company info:', error);
      }
    };

    fetchCompanyInfo();
  }, [game.company]);

  return (
    <div className="col-xl-3 col-lg-4 col-md-6">
      <div className="gameCard">
        <img src={game.gamePhoto} alt={game.name} className="img-fluid" />
        <a href="#" className="like">
          <i className="bi bi-heart-fill"></i>
        </a>
        <div className="gameFeature">
          <span className="gameCompany">{company}</span>
          <GameRating rating={game.averageRating} />
        </div>
        <div className="gameTitle mt-4 mb-3">{game.name}</div>
        <div className="gamePrice">
          {game.isOnSale && (
            <>
              <span className="discount"><i>{game.discountPercentage}%</i></span>
              <span className="originalPrice">${game.price.toFixed(2)}</span>
              <br />
              <span className="currentPrice"> ${game.salePrice.toFixed(2)} </span>
            </>
          )}
          <a href="" className="addBag">
            <i className="bi bi-bag-plus-fill"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

export default GameCard;
