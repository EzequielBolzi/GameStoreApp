import React, { useState, useEffect } from 'react';
import './sideMenu.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import navListData from '../data/navListData';
import NavListItem from './NavListItem';

function SideMenu({ active, sectionActive, userRole }) {
  const [navData, setNavData] = useState(navListData);

  useEffect(() => {
    let updatedNavData = [...navListData];

    if (userRole === 'user') {
      updatedNavData = updatedNavData.filter(item => !['registerGame', 'companyGames'].includes(item.target));
    } else if (userRole === 'company') {
      updatedNavData = updatedNavData.filter(item => !['library', 'cart','purchasedGames'].includes(item.target));
    }

    setNavData(updatedNavData);
  }, [userRole]);

  const handleNavOnClick = (id, target) => {
    const newNavData = navData.map(nav => {
      nav.active = false;
      if (nav._id === id) nav.active = true;
      return nav;
    });
    setNavData(newNavData);
    sectionActive(target); 
  };

  return (
    <div className={`sideMenu ${active ? 'active' : ''}`}>
      <a href="#" className="logo">
        <i className="bi bi-controller"></i>
        <span className="brand">Gamestation</span>
      </a>
      <ul className="nav">
        {navData.map(item => (
          <NavListItem key={item._id} item={item} navOnClick={handleNavOnClick} />
        ))}
      </ul>
    </div>
  );
}

export default SideMenu;
