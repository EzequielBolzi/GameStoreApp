import React from 'react';
import './home.css';
import GameSwiper from '../components/GameSwiper';  // Import GameSwiper
import GameCard  from '../components/GameCard';

function Home({ games, loading, error , reference}) {
    if (loading) {
        return <div>Loading...</div>;  // Show a loading message while data is fetching
    }

    if (error) {
        return <div>Error: {error}</div>;  // Show an error message if fetching fails
    }

    return ( 
      <section id="home" className="home active" ref={reference}>
        <div className="container-fluid">
          <div className="row">
            <GameSwiper games={games} />
            </div>
            <div className="row mb-4 mt-4" >
              <div className="col-lg-6">
                <h2 className="sectionTitle">Games on promotion</h2>

              </div>
              <div className="col-lg-6 d-flex justify-content-end aling-items-center">
                <a href="#" className="viewMore"> View More games  <i class="bi bi-arrow-right"></i>
                </a>
              </div>
              {
                games.slice(0,4).map(game=>(
                  <GameCard key={game.id} game={game}/>
                ))
              }
            </div>
        </div>
        </section>
    );
}

export default Home;
