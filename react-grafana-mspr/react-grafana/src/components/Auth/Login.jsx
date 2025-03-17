import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const history = useHistory();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            history.push('/'); // ✅ Redirige automatiquement si déjà connecté
        }
    }, [setIsAuthenticated, history]); // ✅ Exécute l'effet quand `setIsAuthenticated` change

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3005/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                setIsAuthenticated(true);
                history.push('/'); // ✅ Redirige vers le `CovidDashboard` après connexion
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error("❌ Erreur lors de la connexion:", error);
            setMessage('❌ Erreur serveur.');
        }
    };

    return (
        <div>
            <h2>🔐 Connexion</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Se connecter</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
