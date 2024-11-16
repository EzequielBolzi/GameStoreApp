import React, {useState} from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import './gameSwiper.css';

import { EffectCoverflow, Navigation, Autoplay } from 'swiper/modules';

function GameSwiper({ games }) {
    const[active, setActive] = useState(false);
    
    const handleToggleVideo=()=>{
        setActive(!active);
    }
  if (!games || games.length === 0) {
    return <div>No games available</div>;
  }
  return (
    <Swiper
      effect={'coverflow'}
      grabCursor={true}
      navigation={true}
      loop={true}
      centeredSlides={true}
      slidesPerView={'auto'}
      coverflowEffect={{
        rotate: 35,
        stretch: 200,
        depth: 250,
        modifier: 1,
        slideShadows: true,
      }}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      modules={[EffectCoverflow, Navigation, Autoplay]}
      className="gameSwiper"
    >
        
      {games.map((game) => (
        <SwiperSlide key={game.id}> {/* Assuming `id` is unique */}
        <div className="gameSlider">
            <img src={game.gamePhoto} alt="Game Image " />
            <div className="content">
                <h2>{game.name}</h2>
          </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default GameSwiper;
