import React, { useState, useEffect, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';
import SideMenu from "../components/SideMenu";
import Header from './Header';
import Home from './Home';
import gameApi from '../api/gameApi'; 
import Categories from "./Categories";
import MyLibrary from "./MyLibrary";
import Cart from "./Cart";
import useAuth from '../hooks/useAuth';

function Main() {
    console.log("Entre al")
    const { auth } = useAuth();  // Añade esto
    
    const [active, setActive] = useState(false);
    const [games, setGames] = useState([]);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  


    const homeRef = useRef();
    const categoriesRef = useRef();
    const libraryRef = useRef();
    const cartRef = useRef();

    const sections =[
        {
            name: 'home',
            ref: homeRef,
            active: true,
        },
        {
            name: 'categories',
            ref: categoriesRef,
            active: false,
        },
        {
            name: 'library',
            ref: libraryRef,
            active: false,
        },
        {
            name: 'cart',
            ref: cartRef,
            active: false,
        }
    ]

    const handelToggleActive = () => {
        setActive(!active);
    };

    const handleSectionActive = target => {
        sections.map(section =>{
                section.ref.current.classList.remove('active');
                if(section.ref.current.id===target){
                    section.ref.current.classList.add('active');
                }
                return section;
        })
    }
    useEffect(() => {
        console.log("Auth in Main:", auth); // Para debug
    }, [auth]);
    // Fetch the games data once when the component mounts
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await gameApi.getAllGames();  // Fetch games
                console.log('Fetched games:', response);  // Log the response to check the structure
                setGames(response);  // Set the games state
                setError(null);  // Reset error if successful
            } catch (err) {
                setError(err.message);  // Set error message if failed
            } finally {
                setLoading(false);  // Set loading to false when done
            }
        };

        fetchGames();  // Call fetchGames once on component mount
    }, []);  // Empty dependency array to only call once

    return (
        <main>
        <SideMenu active={active} sectionActive={handleSectionActive}  />
        <div className={`banner ${active ? 'active' : undefined}`}>
            <div className="content-wrapper">
                <Header toggleActive={handelToggleActive} />
                <div className="container-fluid">
                    <Home games={games} loading={loading} error={error}  reference={homeRef}/>
                    <Categories games={games} reference={categoriesRef}/>
                    <MyLibrary games={games} reference={libraryRef}/>
                    <Cart games={games} reference={cartRef}/>

                </div>
            </div>
        </div>
    </main>
    );
}

export default Main;