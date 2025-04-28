import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const TopbarContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: purple;
    padding: 15px 20px;
    color: white;
    font-size: 18px;
`;

const NavLinks = styled.div`
    a {
        color: white;
        text-decoration: none;
        margin-right: 20px;
        font-weight: bold;
        &:hover {
            text-decoration: underline;
        }
    }
`;

const Button = styled.button`
    background-color: #ff4747;
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    font-size: 16px;
    border-radius: 5px;
    &:hover {
        background-color: #cc0000;
    }
`;

const Topbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        window.location.reload(); // Recharge la page après la déconnexion
    };

    return (
        <TopbarContainer>
            <div>📊 COVID Dashboard</div>
            <NavLinks>
                <Link to="/">🏠 Accueil</Link>
                <Link to="/export">📤 Exporter</Link>
                {isAuthenticated && (
                    <>
                        <Link to="/add-data">➕ Ajouter</Link>
                        <Link to="/edit-data">✏️ Modifier</Link>
                        <Link to="/delete-data">🗑️ Supprimer</Link> {/* 👈 Ajout ici */}
                        <Button onClick={handleLogout}>🚪 Déconnexion</Button>
                    </>

                )}

                {!isAuthenticated && <Link to="/login">🔐 Connexion</Link>}
            </NavLinks>
        </TopbarContainer>
    );
};

export default Topbar;
