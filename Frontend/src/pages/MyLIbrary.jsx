import React from 'react'
import './myLibrary.css'


function MyLIbrary({games, reference}) {
  return (<section id="library" className='library' ref={reference}>
    <h1>My Library</h1>
  </section>   );
}

export default MyLIbrary
