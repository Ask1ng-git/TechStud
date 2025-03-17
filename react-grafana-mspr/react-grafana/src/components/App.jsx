import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CovidDashboard from './graphs/CovidDashboard';
import ExportData from './graphs/ExportData';
import AddData from './graphs/AddData';
import Topbar from '../components/Topbar/Topbar';
import Login from '../components/Auth/Login';

const AppContainer = styled.div`
    min-height: 100vh;
    background-color: #1a1a1a;
`;

const Content = styled.div``;

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    return (
        <Router>
            <AppContainer>
                <Topbar 
                    key={isAuthenticated} // ✅ Force le re-render de la Topbar
                    isAuthenticated={isAuthenticated} 
                    setIsAuthenticated={setIsAuthenticated} 
                />
                <Content>
                    <Switch>
                        <Route exact path="/" component={CovidDashboard} />
                        <Route exact path="/export" component={ExportData} />
                        <Route exact path="/add-data" component={isAuthenticated ? AddData : () => <Login setIsAuthenticated={setIsAuthenticated} />} />
                        <Route exact path="/login" render={(props) => <Login {...props} setIsAuthenticated={setIsAuthenticated} />} />
                    </Switch>
                </Content>
            </AppContainer>
        </Router>
    );
};

export default App;
