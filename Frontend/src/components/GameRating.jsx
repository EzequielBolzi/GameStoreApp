import React, {useState, useEffect} from 'react'
import './gameRating.css'

function GameRating({rating}) {
    const [stars, setStars] = useState([]);

    const generateStars =()=>{
        let stars =[]
        if(rating>5 || rating <1){
            return stars;
        }
        for(let i=0; i<rating; i++){
            stars.push(i);
        }

        return stars;
    }
useEffect(()=>{
    setStars(generateStars());
},[rating])
  return (
    <div className="gameRating"> 
      {stars.map((star, index)=>(
        <i key={index} className="bi bi-star-fill"></i>
      ))}
    </div>
  )
}

export default GameRating;
