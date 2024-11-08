import React, { useState } from 'react';
import './categories.css';
import filterListData from '../data/filterListData';
import GameCard from '../components/GameCard';

function Categories({ games, reference }) {
  const [data,setData] = useState(games);
  const [filters, setFilters] = useState(filterListData);

  const handleFilterGames = (category) => {
    setFilters(
      filters.map((filter) => {
        filter.active = false;
        if (filter.name === category) {
          filter.active = true;
        }
        return filter;
      })
    );
    if(category==='All'){
      setData(games);
      return;
    }

    setData(games.filter(game=>game.category === category))
  };
  const[text, setText] = useState('');

  const handleSearchGames= e =>{
        setData(
          games.filter(
            game=>game.name.toLowerCase().includes(e.target.value.toLowerCase())
          )

        )
        setText(e.target.value);
  }
  return (
    <section id="categories" className="categories" ref={reference}>
      <div className="container-fluid mt-2">
        <div className="row" style={{ marginBottom: "25px" }}>
          <div className="col-lg-12">
            <div className="search-container">
              <div className="search">
                <i className="bi bi-search"></i>
                <input type="text" name="search" placeholder="Search" value={text} onChange={handleSearchGames} />
              </div>
              <div className="dropdown">
                <button className="dropdown-button">
                  Categories <i className="bi bi-chevron-down"></i>
                </button>
                <div className="dropdown-menu">
                  {filters.map((filter) => (
                    <div
                      key={filter._id}
                      className={`dropdown-item ${filter.active ? 'active' : ''}`}
                      onClick={() => handleFilterGames(filter.name)}
                    >
                      {filter.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row" >
          {data.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;